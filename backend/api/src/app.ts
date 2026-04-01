import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import fastifyRawBody from 'fastify-raw-body'
import Fastify from 'fastify'
import { env, isAllowedCorsOrigin } from './config/env'
import { prisma } from './database/client'
import { ensureRedisConnection, redis } from './config/redis'
import { registerAuthUtilities } from './plugins/auth'
import { healthRoutes } from './modules/health/health.routes'
import { authRoutes } from './modules/auth/auth.routes'
import { usersRoutes } from './modules/users/users.routes'
import { coursesRoutes } from './modules/courses/courses.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { adminRoutes } from './modules/admin/admin.routes'
import { checkoutRoutes } from './modules/checkout/checkout.routes'
import { learningRoutes } from './modules/learning/learning.routes'
import { certificatesRoutes } from './modules/certificates/certificates.routes'
import { logger } from './utils/logger'
import { mapError } from './utils/errors'

export async function buildApp() {
  const app = Fastify({
    logger,
    trustProxy: true,
    bodyLimit: 1024 * 1024,
  })

  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })

  await app.register(cors, {
    credentials: true,
    origin(origin, callback) {
      if (!origin || isAllowedCorsOrigin(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed by CORS'), false)
    },
  })

  await app.register(cookie, {
    hook: 'onRequest',
  })

  await app.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true,
  })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  })

  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
  })

  await app.register(multipart, {
    limits: {
      files: 3,
      fileSize: 10 * 1024 * 1024,
    },
  })

  await registerAuthUtilities(app)

  app.setErrorHandler((error, request, reply) => {
    const mapped = mapError(error)

    request.log.error(
      {
        err: error,
        path: request.url,
        method: request.method,
      },
      'request_failed'
    )

    reply.status(mapped.statusCode).send(mapped.payload)
  })

  app.get('/', async () => ({
    name: env.APP_NAME,
    status: 'online',
    docs: '/health',
  }))

  await app.register(healthRoutes)
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(usersRoutes, { prefix: '/users' })
  await app.register(coursesRoutes, { prefix: '/courses' })
  await app.register(checkoutRoutes, { prefix: '/checkout' })
  await app.register(learningRoutes, { prefix: '/learning' })
  await app.register(certificatesRoutes, { prefix: '/certificates' })
  await app.register(dashboardRoutes, { prefix: '/dashboard' })
  await app.register(adminRoutes, { prefix: '/admin' })

  app.addHook('onReady', async () => {
    await prisma.$queryRaw`SELECT 1`
    await ensureRedisConnection()
    await redis.ping()
  })

  app.addHook('onClose', async () => {
    await Promise.allSettled([prisma.$disconnect(), redis.quit()])
  })

  return app
}
