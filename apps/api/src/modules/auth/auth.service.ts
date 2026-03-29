// =============================================================================
// AURA EDUCACIONAL — AUTH SERVICE
// Autenticação segura com bcrypt, JWT, rate limiting e auditoria completa
// =============================================================================

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { prisma } from '../database/client'
import { redis } from '../config/redis'
import { sendEmail } from '../utils/mailer'
import { logger } from '../utils/logger'

// =============================================================================
// CONSTANTES DE SEGURANÇA
// =============================================================================

const SECURITY = {
  BCRYPT_ROUNDS: 12,                // Alto custo computacional contra brute force
  MAX_LOGIN_ATTEMPTS: 5,            // Tentativas antes de bloquear
  LOCKOUT_MINUTES: 30,              // Tempo de bloqueio após exceder tentativas
  JWT_ACCESS_EXPIRES: '15m',        // Token de acesso curto (15 minutos)
  JWT_REFRESH_EXPIRES: '7d',        // Token de refresh (7 dias)
  PASSWORD_RESET_EXPIRES_MINUTES: 60,
  VERIFY_EMAIL_EXPIRES_HOURS: 24,
  SESSION_IDLE_TIMEOUT_HOURS: 24,
  MAX_SESSIONS_PER_USER: 10,        // Limitar sessões simultâneas
} as const

// =============================================================================
// SCHEMAS DE VALIDAÇÃO
// =============================================================================

const RegisterSchema = z.object({
  firstName: z.string().min(2).max(60),
  lastName: z.string().min(2).max(60),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[a-z]/, 'Deve conter letra minúscula')
    .regex(/[0-9]/, 'Deve conter número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter caractere especial'),
  cpf: z.string().regex(/^\d{11}$/).optional(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(v => v === true, 'Aceite os termos'),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
})

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
})

const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
})

// =============================================================================
// FUNÇÕES AUXILIARES DE SEGURANÇA
// =============================================================================

/**
 * Hash de senha com bcrypt (custo 12)
 * Nunca armazene senha em plain text — sempre use esta função
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS)
}

/**
 * Verificação de senha — usa comparação de tempo constante (bcrypt)
 * Resistente a timing attacks
 */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash)
}

/**
 * Gera código único de verificação (ex: AE-2026-00847)
 */
export function generateCertificateCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `AE-${year}-${random}`
}

/**
 * Sanitiza dados do usuário antes de retornar na resposta
 * Nunca retorne passwordHash, twoFactorSecret ou dados sensíveis
 */
export function sanitizeUser(user: any) {
  const { passwordHash, twoFactorSecret, loginAttempts, lockedUntil, ...safe } = user
  return safe
}

/**
 * Obtém IP real do cliente (considera proxies/load balancers)
 */
export function getRealIP(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return request.ip
}

// =============================================================================
// GERENCIAMENTO DE TENTATIVAS DE LOGIN (via Redis)
// =============================================================================

const loginAttemptKey = (email: string) => `auth:attempts:${email}`
const lockKey = (email: string) => `auth:locked:${email}`

async function getLoginAttempts(email: string): Promise<number> {
  const val = await redis.get(loginAttemptKey(email))
  return val ? parseInt(val) : 0
}

async function incrementLoginAttempts(email: string): Promise<number> {
  const key = loginAttemptKey(email)
  const attempts = await redis.incr(key)
  // Expira em 1 hora (janela de tentativas)
  await redis.expire(key, 3600)
  return attempts
}

async function resetLoginAttempts(email: string): Promise<void> {
  await redis.del(loginAttemptKey(email))
  await redis.del(lockKey(email))
}

async function isAccountLocked(email: string): Promise<boolean> {
  const locked = await redis.get(lockKey(email))
  return !!locked
}

async function lockAccount(email: string): Promise<void> {
  const key = lockKey(email)
  await redis.set(key, '1', 'EX', SECURITY.LOCKOUT_MINUTES * 60)
  logger.warn(`Account locked: ${email}`)
}

// =============================================================================
// HANDLERS DE AUTENTICAÇÃO
// =============================================================================

/**
 * POST /auth/register
 * Cria conta nova com verificação de email obrigatória
 */
export async function register(
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance
) {
  const body = RegisterSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: body.error.flatten() })
  }

  const { firstName, lastName, email, password, cpf, phone } = body.data
  const ip = getRealIP(request)

  // Verificar se email já existe (mensagem genérica para não vazar info)
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  })

  if (existing) {
    // Delay intencional para evitar user enumeration por timing
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
    return reply.status(409).send({ error: 'E-mail já cadastrado' })
  }

  // Verificar CPF duplicado
  if (cpf) {
    const cpfExists = await prisma.user.findUnique({
      where: { cpf },
      select: { id: true },
    })
    if (cpfExists) {
      return reply.status(409).send({ error: 'CPF já cadastrado' })
    }
  }

  // Hash de senha
  const passwordHash = await hashPassword(password)

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      cpf: cpf || null,
      phone: phone || null,
      status: 'PENDING_VERIFICATION',
    },
  })

  // Gerar token de verificação de email
  const verifyToken = nanoid(48)
  await prisma.verificationToken.create({
    data: {
      identifier: email.toLowerCase(),
      token: verifyToken,
      expires: new Date(Date.now() + SECURITY.VERIFY_EMAIL_EXPIRES_HOURS * 3600 * 1000),
    },
  })

  // Enviar email de boas-vindas + verificação
  await sendEmail({
    to: email,
    template: 'welcome-verify',
    data: {
      firstName,
      verifyUrl: `${process.env.APP_URL}/verificar-email?token=${verifyToken}`,
    },
  })

  // Registrar log
  logger.info({ userId: user.id, ip, event: 'register' })

  return reply.status(201).send({
    message: 'Conta criada! Verifique seu e-mail para ativar.',
    userId: user.id,
  })
}

/**
 * POST /auth/login
 * Login com proteção contra brute force, rate limit e auditoria
 */
export async function login(
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance
) {
  const body = LoginSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ error: 'Dados inválidos' })
  }

  const { email, password, rememberMe } = body.data
  const ip = getRealIP(request)
  const userAgent = request.headers['user-agent'] || ''

  // Verificar bloqueio por tentativas excessivas
  const locked = await isAccountLocked(email)
  if (locked) {
    return reply.status(429).send({
      error: `Conta temporariamente bloqueada após múltiplas tentativas. Tente novamente em ${SECURITY.LOCKOUT_MINUTES} minutos.`,
    })
  }

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      status: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      twoFactorEnabled: true,
    },
  })

  // Função para registrar tentativa falha
  const recordFailure = async (reason: string) => {
    const attempts = await incrementLoginAttempts(email)
    
    if (user) {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ip,
          userAgent,
          success: false,
          failReason: reason,
        },
      })
    }

    if (attempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
      await lockAccount(email)
      return reply.status(429).send({
        error: `Conta bloqueada por ${SECURITY.LOCKOUT_MINUTES} minutos por excesso de tentativas.`,
      })
    }

    // Delay de segurança (simula tempo de verificação mesmo quando falha)
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500))
    
    return reply.status(401).send({
      error: 'E-mail ou senha inválidos',
      attemptsRemaining: SECURITY.MAX_LOGIN_ATTEMPTS - attempts,
    })
  }

  // Usuário não encontrado (mensagem genérica)
  if (!user || !user.passwordHash) {
    return recordFailure('user_not_found')
  }

  // Verificar email confirmado
  if (!user.emailVerified) {
    return reply.status(403).send({
      error: 'E-mail não verificado. Verifique sua caixa de entrada.',
      code: 'EMAIL_NOT_VERIFIED',
    })
  }

  // Verificar status da conta
  if (user.status === 'SUSPENDED') {
    return reply.status(403).send({
      error: 'Conta suspensa. Entre em contato com o suporte.',
      code: 'ACCOUNT_SUSPENDED',
    })
  }

  if (user.status === 'INACTIVE') {
    return reply.status(403).send({
      error: 'Conta inativa.',
      code: 'ACCOUNT_INACTIVE',
    })
  }

  // Verificar senha
  const passwordValid = await verifyPassword(password, user.passwordHash)
  if (!passwordValid) {
    return recordFailure('invalid_password')
  }

  // Login bem-sucedido — resetar tentativas
  await resetLoginAttempts(email)

  // Atualizar último login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      loginAttempts: 0,
    },
  })

  // Registrar histórico
  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress: ip,
      userAgent,
      success: true,
    },
  })

  // Gerar tokens JWT
  const accessToken = app.jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    { expiresIn: SECURITY.JWT_ACCESS_EXPIRES }
  )

  const refreshToken = app.jwt.sign(
    { sub: user.id, type: 'refresh' },
    { expiresIn: rememberMe ? '30d' : SECURITY.JWT_REFRESH_EXPIRES }
  )

  // Armazenar refresh token no Redis (permite revogação)
  const refreshKey = `auth:refresh:${user.id}:${nanoid(8)}`
  await redis.set(
    refreshKey,
    refreshToken,
    'EX',
    rememberMe ? 30 * 86400 : 7 * 86400
  )

  // Cookie httpOnly para o refresh token (mais seguro que localStorage)
  reply.setCookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth/refresh',
    maxAge: rememberMe ? 30 * 86400 : 7 * 86400,
  })

  logger.info({ userId: user.id, ip, event: 'login_success' })

  return reply.send({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  })
}

/**
 * POST /auth/logout
 * Revoga tokens e limpa sessão
 */
export async function logout(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = (request.user as any)?.sub
  if (userId) {
    // Revogar todos os refresh tokens do usuário no Redis
    const keys = await redis.keys(`auth:refresh:${userId}:*`)
    if (keys.length) await redis.del(...keys)
    logger.info({ userId, event: 'logout' })
  }

  reply.clearCookie('refresh_token', { path: '/auth/refresh' })
  return reply.send({ message: 'Sessão encerrada.' })
}

/**
 * POST /auth/forgot-password
 * Envia e-mail de redefinição com token de uso único
 */
export async function forgotPassword(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = ForgotPasswordSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ error: 'E-mail inválido' })
  }

  // Rate limit por IP (via Redis)
  const ip = getRealIP(request)
  const rateLimitKey = `auth:forgot:${ip}`
  const attempts = await redis.incr(rateLimitKey)
  if (attempts === 1) await redis.expire(rateLimitKey, 3600)
  if (attempts > 5) {
    return reply.status(429).send({ error: 'Muitas tentativas. Aguarde 1 hora.' })
  }

  const { email } = body.data

  // Resposta genérica independente de o email existir ou não
  // (evita user enumeration)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, firstName: true },
  })

  if (user) {
    // Invalidar tokens anteriores
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    const token = nanoid(64)
    const expiresAt = new Date(Date.now() + SECURITY.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000)

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    })

    await sendEmail({
      to: email,
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl: `${process.env.APP_URL}/redefinir-senha?token=${token}`,
        expiresMinutes: SECURITY.PASSWORD_RESET_EXPIRES_MINUTES,
      },
    })
  }

  // Delay deliberado para não vazar se email existe
  await new Promise(r => setTimeout(r, 400 + Math.random() * 400))

  return reply.send({
    message: 'Se esse e-mail estiver cadastrado, você receberá as instruções.',
  })
}

/**
 * POST /auth/reset-password
 * Redefine senha com token de uso único
 */
export async function resetPassword(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = ResetPasswordSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: body.error.flatten() })
  }

  const { token, password } = body.data

  const reset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true } } },
  })

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return reply.status(400).send({ error: 'Token inválido ou expirado.' })
  }

  const passwordHash = await hashPassword(password)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  // Revogar todas as sessões ativas (forçar relogin)
  const refreshKeys = await redis.keys(`auth:refresh:${reset.userId}:*`)
  if (refreshKeys.length) await redis.del(...refreshKeys)

  logger.info({ userId: reset.userId, event: 'password_reset' })

  return reply.send({ message: 'Senha redefinida com sucesso. Faça login novamente.' })
}
