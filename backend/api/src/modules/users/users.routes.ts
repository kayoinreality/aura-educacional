import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../../database/client'
import { getCurrentUserProfile } from '../auth/auth.service'

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
})

export async function usersRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: app.authenticate }, async (request) => {
    return getCurrentUserProfile(request.user.sub)
  })

  app.get(
    '/',
    {
      preHandler: app.requireRole(['ADMIN', 'SUPERADMIN']),
    },
    async (request, reply) => {
      const parsed = listUsersQuerySchema.safeParse(request.query)

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Invalid query parameters.',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const { page, pageSize, search, role, status } = parsed.data
      const where = {
        deletedAt: null,
        role,
        status,
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      }

      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            city: true,
            state: true,
            createdAt: true,
            emailVerified: true,
            lastLoginAt: true,
          },
        }),
        prisma.user.count({ where }),
      ])

      return reply.send({
        data: users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    }
  )
}
