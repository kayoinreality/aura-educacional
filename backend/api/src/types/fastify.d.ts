import '@fastify/jwt'
import 'fastify'
import type { UserRole } from '@prisma/client'
import type { FastifyReply, FastifyRequest } from 'fastify'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string
      role?: UserRole
      email?: string
      type?: 'refresh'
      jti?: string
    }
    user: {
      sub: string
      role: UserRole
      email: string
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRole: (
      roles: UserRole[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
