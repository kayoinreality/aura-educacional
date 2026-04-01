import { createHash } from 'node:crypto'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import * as bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { nanoid } from 'nanoid'
import { prisma } from '../../database/client'
import { redis } from '../../config/redis'
import { env } from '../../config/env'
import { sendEmail } from '../../utils/mailer'
import { logger } from '../../utils/logger'
import { AppError } from '../../utils/errors'
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  GoogleLoginInput,
  LoginInput,
  RefreshInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.schema'

const googleClient = new OAuth2Client()

const SECURITY = {
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 30,
  MAX_FORGOT_ATTEMPTS_PER_HOUR: 5,
  MAX_SESSIONS_PER_USER: 10,
  VERIFY_EMAIL_EXPIRES_HOURS: 24,
  PASSWORD_RESET_EXPIRES_MINUTES: 60,
  ACCESS_TOKEN_TTL: '15m',
  REFRESH_TOKEN_TTL: '7d',
  REMEMBER_ME_REFRESH_TOKEN_TTL: '30d',
  REFRESH_TOKEN_TTL_SECONDS: 7 * 24 * 60 * 60,
  REMEMBER_ME_REFRESH_TOKEN_TTL_SECONDS: 30 * 24 * 60 * 60,
} as const

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  emailVerified: true,
  avatarUrl: true,
  city: true,
  state: true,
  country: true,
  createdAt: true,
  lastLoginAt: true,
} as const

const profileUserSelect = {
  ...publicUserSelect,
  bio: true,
  phone: true,
  emailNotifications: true,
  marketingEmails: true,
  instructorProfile: {
    select: {
      id: true,
      headline: true,
      expertise: true,
      linkedin: true,
      website: true,
      youtube: true,
      verified: true,
      totalStudents: true,
      totalRating: true,
      totalReviews: true,
    },
  },
  subscription: {
    select: {
      id: true,
      plan: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
    },
  },
} as const

type RequestContext = {
  ipAddress: string
  userAgent: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hasConfiguredGoogleClientId() {
  return Boolean(env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_ID.includes('XXXXX'))
}

function refreshTokenKey(userId: string, jti: string) {
  return `auth:refresh:${userId}:${jti}`
}

function refreshTokenIndexKey(userId: string) {
  return `auth:refresh:index:${userId}`
}

function loginAttemptKey(email: string) {
  return `auth:attempts:${email}`
}

function forgotPasswordKey(ipAddress: string) {
  return `auth:forgot:${ipAddress}`
}

function accountLockKey(email: string) {
  return `auth:locked:${email}`
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function ttlSeconds(rememberMe: boolean) {
  return rememberMe
    ? SECURITY.REMEMBER_ME_REFRESH_TOKEN_TTL_SECONDS
    : SECURITY.REFRESH_TOKEN_TTL_SECONDS
}

function refreshTokenExpiry(rememberMe: boolean) {
  return rememberMe
    ? SECURITY.REMEMBER_ME_REFRESH_TOKEN_TTL
    : SECURITY.REFRESH_TOKEN_TTL
}

export function getRealIp(request: FastifyRequest) {
  const forwarded = request.headers['x-forwarded-for']

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]!.trim()
  }

  return request.ip
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

async function isLocked(email: string) {
  return Boolean(await redis.get(accountLockKey(email)))
}

async function getLoginAttempts(email: string) {
  const attempts = await redis.get(loginAttemptKey(email))
  return attempts ? Number.parseInt(attempts, 10) : 0
}

async function incrementLoginAttempts(email: string) {
  const attempts = await redis.incr(loginAttemptKey(email))
  await redis.expire(loginAttemptKey(email), 60 * 60)
  return attempts
}

async function resetLoginAttempts(email: string, userId?: string) {
  await redis.del(loginAttemptKey(email), accountLockKey(email))

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    })
  }
}

async function lockAccount(email: string, userId?: string) {
  await redis.set(accountLockKey(email), '1', 'EX', SECURITY.LOCKOUT_MINUTES * 60)

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + SECURITY.LOCKOUT_MINUTES * 60 * 1000),
      },
    })
  }
}

async function revokeRefreshToken(userId: string, jti: string) {
  const key = refreshTokenKey(userId, jti)
  await redis.del(key)
  await redis.zrem(refreshTokenIndexKey(userId), key)
}

export async function revokeAllRefreshTokens(userId: string) {
  const indexKey = refreshTokenIndexKey(userId)
  const keys = await redis.zrange(indexKey, 0, -1)

  if (keys.length > 0) {
    await redis.del(...keys)
  }

  await redis.del(indexKey)
}

async function storeRefreshToken(userId: string, jti: string, token: string, maxAge: number) {
  const key = refreshTokenKey(userId, jti)
  const indexKey = refreshTokenIndexKey(userId)
  const now = Date.now()

  await redis.multi().set(key, hashToken(token), 'EX', maxAge).zadd(indexKey, now, key).expire(indexKey, maxAge).exec()

  const total = await redis.zcard(indexKey)
  const overflow = total - SECURITY.MAX_SESSIONS_PER_USER

  if (overflow > 0) {
    const staleKeys = await redis.zrange(indexKey, 0, overflow - 1)

    if (staleKeys.length > 0) {
      await redis.del(...staleKeys)
      await redis.zrem(indexKey, ...staleKeys)
    }
  }
}

async function issueSession(
  app: FastifyInstance,
  user: { id: string; email: string; role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPERADMIN' },
  rememberMe: boolean
) {
  const accessToken = app.jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    {
      expiresIn: SECURITY.ACCESS_TOKEN_TTL,
    }
  )

  const jti = nanoid(24)
  const refreshToken = app.jwt.sign(
    {
      sub: user.id,
      type: 'refresh' as const,
      jti,
    },
    {
      expiresIn: refreshTokenExpiry(rememberMe),
    }
  )

  const maxAge = ttlSeconds(rememberMe)
  await storeRefreshToken(user.id, jti, refreshToken, maxAge)

  return {
    accessToken,
    refreshToken,
    refreshTokenMaxAge: maxAge,
  }
}

async function parseRefreshToken(app: FastifyInstance, token: string) {
  try {
    const payload = app.jwt.verify<{
      sub: string
      type?: string
      jti?: string
    }>(token)

    if (payload.type !== 'refresh' || !payload.jti) {
      throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN')
    }

    return payload
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN')
  }
}

async function getSafeUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileUserSelect,
  })

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND')
  }

  return user
}

async function recordLoginFailure(
  email: string,
  context: RequestContext,
  reason: string,
  user?: { id: string } | null
): Promise<never> {
  const attempts = await incrementLoginAttempts(email)

  if (user) {
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success: false,
        failReason: reason,
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: attempts,
      },
    })
  }

  if (attempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
    await lockAccount(email, user?.id)
    throw new AppError(
      `Account locked for ${SECURITY.LOCKOUT_MINUTES} minutes after repeated failed attempts.`,
      429,
      'ACCOUNT_LOCKED'
    )
  }

  await new Promise((resolve) => setTimeout(resolve, 400))
  throw new AppError('Invalid e-mail or password.', 401, 'INVALID_CREDENTIALS', {
    attemptsRemaining: SECURITY.MAX_LOGIN_ATTEMPTS - attempts,
  })
}

export async function registerAccount(input: RegisterInput, context: RequestContext) {
  const email = normalizeEmail(input.email)
  const autoVerify = env.EMAIL_TRANSPORT_MODE === 'log'

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    throw new AppError('E-mail already registered.', 409, 'EMAIL_ALREADY_EXISTS')
  }

  if (input.cpf) {
    const existingCpf = await prisma.user.findUnique({
      where: { cpf: input.cpf },
      select: { id: true },
    })

    if (existingCpf) {
      throw new AppError('CPF already registered.', 409, 'CPF_ALREADY_EXISTS')
    }
  }

  const passwordHash = await hashPassword(input.password)
  const verifyToken = nanoid(48)

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        passwordHash,
        cpf: input.cpf ?? null,
        phone: input.phone ?? null,
        status: autoVerify ? 'ACTIVE' : 'PENDING_VERIFICATION',
        emailVerified: autoVerify ? new Date() : null,
      },
      select: publicUserSelect,
    })

    if (!autoVerify) {
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verifyToken,
          expires: new Date(Date.now() + SECURITY.VERIFY_EMAIL_EXPIRES_HOURS * 60 * 60 * 1000),
        },
      })
    }

    return createdUser
  })

  if (!autoVerify) {
    await sendEmail({
      to: email,
      template: 'welcome-verify',
      data: {
        firstName: user.firstName,
        verifyUrl: `${env.APP_URL}/verificar-email?token=${verifyToken}`,
      },
    })
  }

  logger.info({ event: 'auth.registered', userId: user.id, ipAddress: context.ipAddress })

  return {
    message: autoVerify
      ? 'Account created successfully. In local mode the account is already verified.'
      : 'Account created successfully. Please verify your e-mail before logging in.',
    user,
  }
}

export async function verifyEmailToken(input: VerifyEmailInput) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token: input.token },
  })

  if (!tokenRecord || tokenRecord.expires < new Date()) {
    throw new AppError('Invalid or expired verification token.', 400, 'INVALID_VERIFY_TOKEN')
  }

  const user = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { email: tokenRecord.identifier },
      data: {
        emailVerified: new Date(),
        status: 'ACTIVE',
      },
      select: publicUserSelect,
    })

    await tx.verificationToken.delete({
      where: { token: input.token },
    })

    return updatedUser
  })

  return {
    message: 'E-mail verified successfully.',
    user,
  }
}

export async function loginAccount(
  app: FastifyInstance,
  input: LoginInput,
  context: RequestContext
) {
  const email = normalizeEmail(input.email)

  if (await isLocked(email)) {
    const attempts = await getLoginAttempts(email)
    throw new AppError(
      `Account temporarily locked after ${attempts} failed attempts.`,
      429,
      'ACCOUNT_LOCKED'
    )
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      passwordHash: true,
    },
  })

  if (!user || !user.passwordHash) {
    return recordLoginFailure(email, context, 'user_not_found')
  }

  if (!user.emailVerified) {
    throw new AppError('Verify your e-mail before logging in.', 403, 'EMAIL_NOT_VERIFIED')
  }

  if (user.status === 'SUSPENDED') {
    throw new AppError('Account suspended. Contact support.', 403, 'ACCOUNT_SUSPENDED')
  }

  if (user.status === 'INACTIVE') {
    throw new AppError('Account inactive.', 403, 'ACCOUNT_INACTIVE')
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash)

  if (!passwordMatches) {
    return recordLoginFailure(email, context, 'invalid_password', { id: user.id })
  }

  await resetLoginAttempts(email, user.id)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: context.ipAddress,
      },
    }),
    prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success: true,
      },
    }),
  ])

  const session = await issueSession(app, user, input.rememberMe)
  const safeUser = await getSafeUserById(user.id)

  logger.info({ event: 'auth.logged_in', userId: user.id, ipAddress: context.ipAddress })

  return {
    ...session,
    user: safeUser,
  }
}

export async function loginWithGoogle(
  app: FastifyInstance,
  input: GoogleLoginInput,
  context: RequestContext
) {
  if (!hasConfiguredGoogleClientId()) {
    throw new AppError(
      'Google login is not configured yet. Add GOOGLE_CLIENT_ID to enable it.',
      503,
      'GOOGLE_LOGIN_NOT_CONFIGURED'
    )
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: input.credential,
    audience: env.GOOGLE_CLIENT_ID!,
  })

  const payload = ticket.getPayload()

  if (!payload?.email || !payload.email_verified || !payload.sub) {
    throw new AppError('Unable to validate Google account.', 401, 'GOOGLE_LOGIN_INVALID')
  }

  const email = normalizeEmail(payload.email)
  const firstName = payload.given_name?.trim() || 'Aluno'
  const lastName = payload.family_name?.trim() || 'Aura'

  const user = await prisma.$transaction(async (tx) => {
    const upsertedUser = await tx.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        avatarUrl: payload.picture ?? undefined,
        emailVerified: new Date(),
        status: 'ACTIVE',
        lastLoginAt: new Date(),
        lastLoginIp: context.ipAddress,
      },
      create: {
        email,
        firstName,
        lastName,
        avatarUrl: payload.picture ?? null,
        emailVerified: new Date(),
        status: 'ACTIVE',
        role: 'STUDENT',
        country: 'BR',
        lastLoginAt: new Date(),
        lastLoginIp: context.ipAddress,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    await tx.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: payload.sub,
        },
      },
      update: {
        userId: upsertedUser.id,
        type: 'oauth',
        provider: 'google',
      },
      create: {
        userId: upsertedUser.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: payload.sub,
      },
    })

    await tx.loginHistory.create({
      data: {
        userId: upsertedUser.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success: true,
      },
    })

    return upsertedUser
  })

  await resetLoginAttempts(email, user.id)

  const session = await issueSession(app, user, false)
  const safeUser = await getSafeUserById(user.id)

  return {
    ...session,
    user: safeUser,
  }
}

export async function refreshSession(
  app: FastifyInstance,
  input: RefreshInput,
  cookieToken?: string
) {
  const rawToken = input.refreshToken ?? cookieToken

  if (!rawToken) {
    throw new AppError('Refresh token not provided.', 401, 'REFRESH_TOKEN_MISSING')
  }

  const payload = await parseRefreshToken(app, rawToken)
  const storedHash = await redis.get(refreshTokenKey(payload.sub, payload.jti!))

  if (!storedHash || storedHash !== hashToken(rawToken)) {
    throw new AppError('Refresh token has been revoked.', 401, 'REFRESH_TOKEN_REVOKED')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
    },
  })

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND')
  }

  if (user.status !== 'ACTIVE' || !user.emailVerified) {
    await revokeAllRefreshTokens(user.id)
    throw new AppError('User is not allowed to refresh the session.', 403, 'SESSION_REFRESH_DENIED')
  }

  await revokeRefreshToken(user.id, payload.jti!)
  const session = await issueSession(app, user, false)
  const safeUser = await getSafeUserById(user.id)

  return {
    ...session,
    user: safeUser,
  }
}

export async function logoutAccount(app: FastifyInstance, token?: string) {
  if (!token) {
    return { message: 'Session closed.' }
  }

  try {
    const payload = await parseRefreshToken(app, token)
    await revokeRefreshToken(payload.sub, payload.jti!)
  } catch {
    return { message: 'Session closed.' }
  }

  return { message: 'Session closed.' }
}

export async function forgotPassword(input: ForgotPasswordInput, context: RequestContext) {
  const attempts = await redis.incr(forgotPasswordKey(context.ipAddress))

  if (attempts === 1) {
    await redis.expire(forgotPasswordKey(context.ipAddress), 60 * 60)
  }

  if (attempts > SECURITY.MAX_FORGOT_ATTEMPTS_PER_HOUR) {
    throw new AppError('Too many password reset requests. Try again later.', 429, 'RATE_LIMITED')
  }

  const email = normalizeEmail(input.email)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
    },
  })

  if (user) {
    await prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    })

    const resetToken = nanoid(64)

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + SECURITY.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000),
      },
    })

    await sendEmail({
      to: email,
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl: `${env.APP_URL}/redefinir-senha?token=${resetToken}`,
        expiresMinutes: SECURITY.PASSWORD_RESET_EXPIRES_MINUTES,
      },
    })
  }

  return {
    message: 'If the e-mail exists, password reset instructions have been sent.',
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token: input.token },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          email: true,
        },
      },
    },
  })

  if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset token.', 400, 'INVALID_RESET_TOKEN')
  }

  const newPasswordHash = await hashPassword(input.password)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordHash: newPasswordHash,
      },
    }),
    prisma.passwordReset.update({
      where: { token: input.token },
      data: {
        usedAt: new Date(),
      },
    }),
  ])

  await revokeAllRefreshTokens(resetRecord.userId)

  await sendEmail({
    to: resetRecord.user.email,
    template: 'password-reset-confirmed',
    data: {
      firstName: resetRecord.user.firstName,
    },
  })

  return {
    message: 'Password updated successfully. Please log in again.',
  }
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  })

  if (!user || !user.passwordHash) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND')
  }

  const currentPasswordMatches = await verifyPassword(input.currentPassword, user.passwordHash)

  if (!currentPasswordMatches) {
    throw new AppError('Current password is incorrect.', 400, 'INVALID_CURRENT_PASSWORD')
  }

  const newPasswordHash = await hashPassword(input.newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  })

  await revokeAllRefreshTokens(userId)

  return {
    message: 'Password changed successfully. Please log in again.',
  }
}

export async function getCurrentUserProfile(userId: string) {
  return getSafeUserById(userId)
}
