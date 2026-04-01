import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../../database/client'
import { AppError } from '../../utils/errors'

const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
})

const createCourseBodySchema = z.object({
  slug: z.string().trim().min(3).max(120),
  title: z.string().trim().min(3).max(160),
  shortDescription: z.string().trim().min(10).max(255),
  description: z.string().trim().min(20),
  categoryId: z.string().min(1),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  language: z.string().trim().default('pt-BR'),
  price: z.coerce.number().min(0),
  originalPrice: z.coerce.number().min(0).optional(),
  isFree: z.boolean().default(false),
  hasCertificate: z.boolean().default(true),
  certificateHours: z.coerce.number().int().positive().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  metaTitle: z.string().trim().max(120).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  instructorProfileId: z.string().optional(),
})

export async function coursesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const parsed = listCoursesQuerySchema.safeParse(request.query)

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters.',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      })
    }

    const { page, pageSize, search, categorySlug, level } = parsed.data
    const where = {
      status: 'PUBLISHED' as const,
      level,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { shortDescription: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
            },
          }
        : {}),
    }

    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          thumbnailUrl: true,
          level: true,
          language: true,
          price: true,
          originalPrice: true,
          isFree: true,
          totalLessons: true,
          totalHours: true,
          totalEnrollments: true,
          totalRating: true,
          totalReviews: true,
          publishedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          instructor: {
            select: {
              id: true,
              headline: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    return reply.send({
      data: courses.map((course) => ({
        ...course,
        price: Number(course.price),
        originalPrice: course.originalPrice ? Number(course.originalPrice) : null,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  })

  app.get('/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string().trim().min(1) }).safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send({
        error: 'Invalid route parameter.',
        code: 'VALIDATION_ERROR',
        details: params.error.flatten(),
      })
    }

    const course = await prisma.course.findFirst({
      where: {
        slug: params.data.slug,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        description: true,
        thumbnailUrl: true,
        previewVideoUrl: true,
        level: true,
        language: true,
        price: true,
        originalPrice: true,
        isFree: true,
        hasCertificate: true,
        certificateHours: true,
        totalLessons: true,
        totalHours: true,
        totalModules: true,
        tags: true,
        totalEnrollments: true,
        totalRating: true,
        totalReviews: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        instructor: {
          select: {
            id: true,
            headline: true,
            expertise: true,
            verified: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
        },
        requirements: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            description: true,
            order: true,
          },
        },
        outcomes: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            description: true,
            order: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                order: true,
                videoDuration: true,
                isPreview: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND')
    }

    return reply.send({
      ...course,
      price: Number(course.price),
      originalPrice: course.originalPrice ? Number(course.originalPrice) : null,
    })
  })

  app.post(
    '/',
    {
      preHandler: app.requireRole(['INSTRUCTOR', 'ADMIN', 'SUPERADMIN']),
    },
    async (request, reply) => {
      const parsed = createCourseBodySchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Invalid request body.',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const body = parsed.data
      let instructorProfileId = body.instructorProfileId

      if (request.user.role === 'INSTRUCTOR') {
        const instructorProfile = await prisma.instructorProfile.findUnique({
          where: { userId: request.user.sub },
          select: { id: true },
        })

        if (!instructorProfile) {
          throw new AppError('Instructor profile not found.', 404, 'INSTRUCTOR_PROFILE_NOT_FOUND')
        }

        instructorProfileId = instructorProfile.id
      }

      if (!instructorProfileId) {
        throw new AppError(
          'An instructor profile is required to create a course.',
          400,
          'INSTRUCTOR_PROFILE_REQUIRED'
        )
      }

      const course = await prisma.course.create({
        data: {
          slug: body.slug,
          title: body.title,
          shortDescription: body.shortDescription,
          description: body.description,
          categoryId: body.categoryId,
          instructorId: instructorProfileId,
          level: body.level,
          language: body.language,
          price: body.price,
          originalPrice: body.originalPrice,
          isFree: body.isFree,
          hasCertificate: body.hasCertificate,
          certificateHours: body.certificateHours,
          tags: body.tags,
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
          status: 'DRAFT',
        },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          createdAt: true,
        },
      })

      return reply.status(201).send(course)
    }
  )
}
