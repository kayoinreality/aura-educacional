import { PrismaClient } from '@prisma/client'

declare global {
  var __auraPrisma__: PrismaClient | undefined
}

export const prisma =
  globalThis.__auraPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__auraPrisma__ = prisma
}
