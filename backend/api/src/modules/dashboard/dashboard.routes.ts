import type { FastifyInstance } from 'fastify'
import { getDashboardSummary, getPublicDashboardOverview } from './dashboard.service'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/public-overview', async () => {
    return getPublicDashboardOverview()
  })

  app.get(
    '/summary',
    {
      preHandler: app.requireRole(['ADMIN', 'SUPERADMIN']),
    },
    async () => getDashboardSummary()
  )
}
