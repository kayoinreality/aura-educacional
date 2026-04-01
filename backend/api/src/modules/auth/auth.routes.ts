import type { FastifyInstance, FastifyReply } from 'fastify'
import { AppError } from '../../utils/errors'
import { refreshCookieConfig } from '../../config/env'
import {
  changePassword,
  forgotPassword,
  getCurrentUserProfile,
  getRealIp,
  loginAccount,
  loginWithGoogle,
  logoutAccount,
  refreshSession,
  registerAccount,
  resetPassword,
  verifyEmailToken,
} from './auth.service'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema'

function setRefreshCookie(
  reply: FastifyReply,
  refreshToken: string,
  maxAge: number
) {
  reply.setCookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: refreshCookieConfig.sameSite,
    secure: refreshCookieConfig.secure,
    domain: refreshCookieConfig.domain,
    path: '/',
    maxAge,
  })
}

function clearRefreshCookie(reply: FastifyReply) {
  reply.clearCookie('refresh_token', {
    sameSite: refreshCookieConfig.sameSite,
    secure: refreshCookieConfig.secure,
    domain: refreshCookieConfig.domain,
    path: '/',
  })
}

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 hour',
        },
      },
    },
    async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Invalid request body.',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const result = await registerAccount(parsed.data, {
        ipAddress: getRealIp(request),
        userAgent: request.headers['user-agent'] ?? 'unknown',
      })

      return reply.status(201).send(result)
    }
  )

  app.post('/verify-email', async (request) => {
    const parsed = verifyEmailSchema.safeParse(request.body)

    if (!parsed.success) {
      throw new AppError('Invalid request body.', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    return verifyEmailToken(parsed.data)
  })

  app.post(
    '/google',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      const parsed = googleLoginSchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Invalid Google login payload.',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const result = await loginWithGoogle(app, parsed.data, {
        ipAddress: getRealIp(request),
        userAgent: request.headers['user-agent'] ?? 'unknown',
      })

      setRefreshCookie(reply, result.refreshToken, result.refreshTokenMaxAge)

      return reply.send({
        accessToken: result.accessToken,
        user: result.user,
      })
    }
  )

  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Invalid request body.',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const result = await loginAccount(app, parsed.data, {
        ipAddress: getRealIp(request),
        userAgent: request.headers['user-agent'] ?? 'unknown',
      })

      setRefreshCookie(reply, result.refreshToken, result.refreshTokenMaxAge)

      return reply.send({
        accessToken: result.accessToken,
        user: result.user,
      })
    }
  )

  app.post('/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body ?? {})

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body.',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }

    const result = await refreshSession(
      app,
      parsed.data,
      request.cookies.refresh_token
    )

    setRefreshCookie(reply, result.refreshToken, result.refreshTokenMaxAge)

    return reply.send({
      accessToken: result.accessToken,
      user: result.user,
    })
  })

  app.post('/logout', async (request, reply) => {
    const result = await logoutAccount(app, request.cookies.refresh_token)
    clearRefreshCookie(reply)
    return reply.send(result)
  })

  app.post(
    '/forgot-password',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 hour',
        },
      },
    },
    async (request) => {
      const parsed = forgotPasswordSchema.safeParse(request.body)

      if (!parsed.success) {
        throw new AppError('Invalid request body.', 400, 'VALIDATION_ERROR', parsed.error.flatten())
      }

      return forgotPassword(parsed.data, {
        ipAddress: getRealIp(request),
        userAgent: request.headers['user-agent'] ?? 'unknown',
      })
    }
  )

  app.post('/reset-password', async (request) => {
    const parsed = resetPasswordSchema.safeParse(request.body)

    if (!parsed.success) {
      throw new AppError('Invalid request body.', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    return resetPassword(parsed.data)
  })

  app.get('/me', { preHandler: app.authenticate }, async (request) => {
    return getCurrentUserProfile(request.user.sub)
  })

  app.post('/change-password', { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = changePasswordSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body.',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }

    const result = await changePassword(request.user.sub, parsed.data)
    clearRefreshCookie(reply)
    return reply.send(result)
  })
}
