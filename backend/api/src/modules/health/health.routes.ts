import type { FastifyInstance } from 'fastify'
import { prisma } from '../../database/client'
import { ensureRedisConnection, redis } from '../../config/redis'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    await prisma.$queryRaw`SELECT 1`
    await ensureRedisConnection()
    await redis.ping()

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'up',
        redis: 'up',
      },
    }
  })
}
