import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  getCheckoutSessionStatus,
  getCheckoutSummary,
  handleStripeWebhook,
  purchaseCourse,
} from './checkout.service'

const checkoutSummarySchema = z.object({
  slug: z.string().trim().min(1),
})

const checkoutSessionSchema = z.object({
  sessionId: z.string().trim().min(1),
})

const checkoutQuerySchema = z.object({
  coupon: z.string().trim().optional(),
})

const purchaseSchema = z.object({
  courseSlug: z.string().trim().min(1),
  paymentMethod: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO']).default('CREDIT_CARD'),
  couponCode: z.string().trim().optional(),
})

export async function checkoutRoutes(app: FastifyInstance) {
  app.post(
    '/webhook/stripe',
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const signature = request.headers['stripe-signature']

      if (typeof signature !== 'string') {
        return reply.status(400).send({
          error: 'Missing Stripe signature.',
          code: 'STRIPE_SIGNATURE_MISSING',
        })
      }

      const rawBody = (request as { rawBody?: string | Buffer }).rawBody

      if (!rawBody) {
        return reply.status(400).send({
          error: 'Missing raw webhook body.',
          code: 'STRIPE_RAW_BODY_MISSING',
        })
      }

      const result = await handleStripeWebhook(rawBody, signature)
      return reply.send({
        received: true,
        result,
      })
    }
  )

  app.get('/summary/:slug', async (request, reply) => {
    const params = checkoutSummarySchema.safeParse(request.params)
    const query = checkoutQuerySchema.safeParse(request.query)

    if (!params.success || !query.success) {
      return reply.status(400).send({
        error: 'Invalid checkout parameters.',
        code: 'VALIDATION_ERROR',
      })
    }

    return getCheckoutSummary(params.data.slug, query.data.coupon)
  })

  app.get(
    '/session/:sessionId',
    {
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const params = checkoutSessionSchema.safeParse(request.params)

      if (!params.success) {
        return reply.status(400).send({
          error: 'Invalid checkout session parameter.',
          code: 'VALIDATION_ERROR',
          details: params.error.flatten(),
        })
      }

      return getCheckoutSessionStatus(request.user.sub, params.data.sessionId)
    }
  )

  app.post(
    '/purchase',
    {
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const parsed = purchaseSchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Invalid purchase payload.',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const result = await purchaseCourse(request.user.sub, parsed.data)
      return reply.status(201).send(result)
    }
  )
}
