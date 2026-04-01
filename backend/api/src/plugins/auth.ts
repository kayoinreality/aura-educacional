import type { UserRole } from '@prisma/client'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../utils/errors'

type AuthCapableFastify = FastifyInstance<any, any, any, any>

export async function registerAuthUtilities(app: AuthCapableFastify) {
  app.decorate(
    'authenticate',
    async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch {
        throw new AppError('Authentication required.', 401, 'UNAUTHORIZED')
      }
    }
  )

  app.decorate('requireRole', (roles: UserRole[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await app.authenticate(request, reply)

      if (!roles.includes(request.user.role)) {
        throw new AppError('You do not have permission to access this resource.', 403, 'FORBIDDEN')
      }
    }
  })
}
