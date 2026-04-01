import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  getAssessmentForCourse,
  getStudentCourses,
  getStudyCourse,
  submitAssessmentForCourse,
  updateLessonProgress,
} from './learning.service'

const lessonProgressSchema = z.object({
  completed: z.boolean().optional(),
  watchTime: z.coerce.number().int().min(0).optional(),
})

const assessmentSubmissionSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      optionId: z.string().min(1),
    })
  ),
})

const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
})

const lessonParamSchema = z.object({
  lessonId: z.string().trim().min(1),
})

export async function learningRoutes(app: FastifyInstance) {
  app.get('/courses', { preHandler: app.authenticate }, async (request) => {
    return getStudentCourses(request.user.sub)
  })

  app.get('/courses/:slug', { preHandler: app.authenticate }, async (request, reply) => {
    const params = slugParamSchema.safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send({
        error: 'Invalid course route parameter.',
        code: 'VALIDATION_ERROR',
        details: params.error.flatten(),
      })
    }

    return getStudyCourse(request.user.sub, params.data.slug)
  })

  app.get(
    '/courses/:slug/assessment',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const params = slugParamSchema.safeParse(request.params)

      if (!params.success) {
        return reply.status(400).send({
          error: 'Invalid course route parameter.',
          code: 'VALIDATION_ERROR',
          details: params.error.flatten(),
        })
      }

      return getAssessmentForCourse(request.user.sub, params.data.slug)
    }
  )

  app.post(
    '/courses/:slug/assessment',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const params = slugParamSchema.safeParse(request.params)
      const body = assessmentSubmissionSchema.safeParse(request.body)

      if (!params.success) {
        return reply.status(400).send({
          error: 'Invalid assessment payload.',
          code: 'VALIDATION_ERROR',
          details: params.error.flatten(),
        })
      }

      if (!body.success) {
        return reply.status(400).send({
          error: 'Invalid assessment payload.',
          code: 'VALIDATION_ERROR',
          details: body.error.flatten(),
        })
      }

      return submitAssessmentForCourse(request.user.sub, params.data.slug, body.data.answers)
    }
  )

  app.post('/lessons/:lessonId/progress', { preHandler: app.authenticate }, async (request, reply) => {
    const params = lessonParamSchema.safeParse(request.params)
    const body = lessonProgressSchema.safeParse(request.body)

    if (!params.success) {
      return reply.status(400).send({
        error: 'Invalid lesson progress payload.',
        code: 'VALIDATION_ERROR',
        details: params.error.flatten(),
      })
    }

    if (!body.success) {
      return reply.status(400).send({
        error: 'Invalid lesson progress payload.',
        code: 'VALIDATION_ERROR',
        details: body.error.flatten(),
      })
    }

    return updateLessonProgress(request.user.sub, params.data.lessonId, body.data)
  })
}
