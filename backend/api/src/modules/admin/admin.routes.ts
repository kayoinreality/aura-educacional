import type { FastifyInstance } from 'fastify'
import { getAdminOverview } from './admin.service'

export async function adminRoutes(app: FastifyInstance) {
  app.get(
    '/overview',
    {
      preHandler: app.requireRole(['ADMIN', 'SUPERADMIN']),
    },
    async () => getAdminOverview()
  )
}
