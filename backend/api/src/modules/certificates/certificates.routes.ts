import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  generateCertificatePdf,
  getMyCertificates,
  verifyCertificate,
} from './certificates.service'

const codeParamsSchema = z.object({
  code: z.string().trim().min(1),
})

export async function certificatesRoutes(app: FastifyInstance) {
  app.get('/mine', { preHandler: app.authenticate }, async (request) => {
    return getMyCertificates(request.user.sub)
  })

  app.get('/verify/:code', async (request, reply) => {
    const params = codeParamsSchema.safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send({
        error: 'Invalid certificate code.',
        code: 'VALIDATION_ERROR',
        details: params.error.flatten(),
      })
    }

    return verifyCertificate(params.data.code)
  })

  app.get('/:code/pdf', async (request, reply) => {
    const params = codeParamsSchema.safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send({
        error: 'Invalid certificate code.',
        code: 'VALIDATION_ERROR',
        details: params.error.flatten(),
      })
    }

    const pdfBuffer = await generateCertificatePdf(params.data.code)
    reply.header('Content-Type', 'application/pdf')
    reply.header('Content-Disposition', `inline; filename="${params.data.code}.pdf"`)
    return reply.send(pdfBuffer)
  })
}
