import Redis from 'ioredis'
import { env } from './env'

declare global {
  var __auraRedis__: Redis | undefined
}

export const redis =
  globalThis.__auraRedis__ ??
  new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
  })

if (env.NODE_ENV !== 'production') {
  globalThis.__auraRedis__ = redis
}

export async function ensureRedisConnection() {
  if (redis.status === 'ready' || redis.status === 'connecting') {
    return
  }

  await redis.connect()
}
