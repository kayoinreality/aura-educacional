import { Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'
import { prisma } from '../../database/client'
import { AppError } from '../../utils/errors'

type LessonProgressInput = {
  completed?: boolean
  watchTime?: number
}

type AssessmentAnswerInput = {
  questionId: string
  optionId: string
}

async function getEnrollmentBySlug(userId: string, slug: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      course: {
        slug,
      },
    },
    select: {
      id: true,
      status: true,
      progress: true,
      completedAt: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          description: true,
          hasCertificate: true,
          certificateHours: true,
          totalHours: true,
          modules: {
            where: {
              lessons: {
                some: {
                  isPublished: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
            select: {
              id: true,
              title: true,
              description: true,
              order: true,
              lessons: {
                where: {
                  isPublished: true,
                },
                orderBy: {
                  order: 'asc',
                },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  content: true,
                  videoUrl: true,
                  videoDuration: true,
                  order: true,
                  isPreview: true,
                  attachments: true,
                },
              },
            },
          },
          assessment: {
            select: {
              id: true,
              title: true,
              description: true,
              passingScore: true,
              timeLimitMinutes: true,
              questions: {
                orderBy: {
                  order: 'asc',
                },
                select: {
                  id: true,
                  prompt: true,
                  options: true,
                  order: true,
                },
              },
            },
          },
        },
      },
      certificate: {
        select: {
          id: true,
          code: true,
          status: true,
          issuedAt: true,
          pdfUrl: true,
        },
      },
    },
  })

  if (!enrollment) {
    throw new AppError('Enrollment not found for this course.', 404, 'ENROLLMENT_NOT_FOUND')
  }

  return enrollment
}

async function recalculateEnrollmentProgress(
  tx: Prisma.TransactionClient,
  userId: string,
  courseId: string
) {
  const lessons = await tx.lesson.findMany({
    where: {
      isPublished: true,
      module: {
        courseId,
      },
    },
    select: {
      id: true,
    },
  })

  const lessonIds = lessons.map((lesson) => lesson.id)
  const totalLessons = lessonIds.length
  const completedLessons =
    totalLessons === 0
      ? 0
      : await tx.lessonProgress.count({
          where: {
            userId,
            lessonId: {
              in: lessonIds,
            },
            completed: true,
          },
        })

  const latestProgress = totalLessons
    ? await tx.lessonProgress.findFirst({
        where: {
          userId,
          lessonId: {
            in: lessonIds,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          lessonId: true,
        },
      })
    : null

  const progressPercent =
    totalLessons === 0 ? 0 : Number(((completedLessons / totalLessons) * 100).toFixed(2))

  await tx.courseProgress.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {
      progressPercent,
      lastLessonId: latestProgress?.lessonId ?? null,
    },
    create: {
      userId,
      courseId,
      progressPercent,
      lastLessonId: latestProgress?.lessonId ?? null,
    },
  })

  await tx.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      progress: progressPercent,
    },
  })

  return {
    totalLessons,
    completedLessons,
    progressPercent,
    lastLessonId: latestProgress?.lessonId ?? null,
  }
}

async function issueCertificateIfNeeded(
  tx: Prisma.TransactionClient,
  input: {
    userId: string
    courseId: string
    enrollmentId: string
  }
) {
  const existing = await tx.certificate.findUnique({
    where: {
      enrollmentId: input.enrollmentId,
    },
    select: {
      id: true,
      code: true,
      status: true,
      issuedAt: true,
      pdfUrl: true,
    },
  })

  if (existing) {
    return existing
  }

  const course = await tx.course.findUnique({
    where: { id: input.courseId },
    select: {
      title: true,
      totalHours: true,
      certificateHours: true,
      instructor: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  if (!course) {
    throw new AppError('Course not found for certificate.', 404, 'COURSE_NOT_FOUND')
  }

  const code = `AE-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`
  const certificate = await tx.certificate.create({
    data: {
      code,
      userId: input.userId,
      courseId: input.courseId,
      enrollmentId: input.enrollmentId,
      status: 'ISSUED',
      issuedAt: new Date(),
      pdfUrl: `/certificates/${code}/pdf`,
      metadata: {
        totalHours: course.certificateHours ?? course.totalHours,
        instructor: `${course.instructor.user.firstName} ${course.instructor.user.lastName}`,
        courseTitle: course.title,
      },
    },
    select: {
      id: true,
      code: true,
      status: true,
      issuedAt: true,
      pdfUrl: true,
    },
  })

  return certificate
}

export async function getStudentCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      status: true,
      progress: true,
      createdAt: true,
      completedAt: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          thumbnailUrl: true,
          totalHours: true,
          totalLessons: true,
          level: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          instructor: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      certificate: {
        select: {
          code: true,
          status: true,
          issuedAt: true,
        },
      },
      payment: {
        select: {
          amount: true,
          method: true,
          status: true,
          paidAt: true,
        },
      },
    },
  })

  return enrollments.map((enrollment) => ({
    ...enrollment,
    payment: enrollment.payment
      ? {
          ...enrollment.payment,
          amount: Number(enrollment.payment.amount),
        }
      : null,
  }))
}

export async function getStudyCourse(userId: string, slug: string) {
  const enrollment = await getEnrollmentBySlug(userId, slug)

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lesson: {
        module: {
          courseId: enrollment.course.id,
        },
      },
    },
    select: {
      lessonId: true,
      completed: true,
      watchTime: true,
      completedAt: true,
    },
  })

  const lessonProgressMap = new Map(
    lessonProgress.map((progress) => [progress.lessonId, progress])
  )

  const assessmentAttempt = enrollment.course.assessment
    ? await prisma.assessmentAttempt.findFirst({
        where: {
          assessmentId: enrollment.course.assessment.id,
          userId,
        },
        orderBy: {
          submittedAt: 'desc',
        },
        select: {
          id: true,
          score: true,
          passed: true,
          submittedAt: true,
        },
      })
    : null

  return {
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      progress: enrollment.progress,
      completedAt: enrollment.completedAt,
    },
    course: {
      ...enrollment.course,
      modules: enrollment.course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          progress: lessonProgressMap.get(lesson.id) ?? {
            completed: false,
            watchTime: 0,
            completedAt: null,
          },
        })),
      })),
      assessment: enrollment.course.assessment
        ? {
            id: enrollment.course.assessment.id,
            title: enrollment.course.assessment.title,
            description: enrollment.course.assessment.description,
            passingScore: enrollment.course.assessment.passingScore,
            timeLimitMinutes: enrollment.course.assessment.timeLimitMinutes,
            questionCount: enrollment.course.assessment.questions.length,
            lastAttempt: assessmentAttempt,
            available: enrollment.progress >= 100,
          }
        : null,
    },
    certificate: enrollment.certificate,
  }
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  input: LessonProgressInput
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      isPublished: true,
    },
    select: {
      id: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  })

  if (!lesson) {
    throw new AppError('Lesson not found.', 404, 'LESSON_NOT_FOUND')
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.module.courseId,
      },
    },
    select: {
      id: true,
    },
  })

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course.', 403, 'ENROLLMENT_REQUIRED')
  }

  return prisma.$transaction(async (tx) => {
    await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed: input.completed ?? true,
        watchTime: input.watchTime ?? 0,
        completedAt: input.completed === false ? null : new Date(),
      },
      create: {
        userId,
        lessonId,
        completed: input.completed ?? true,
        watchTime: input.watchTime ?? 0,
        completedAt: input.completed === false ? null : new Date(),
      },
    })

    const progress = await recalculateEnrollmentProgress(tx, userId, lesson.module.courseId)

    return {
      message: 'Lesson progress updated.',
      courseSlug: lesson.module.course.slug,
      progress,
    }
  })
}

export async function getAssessmentForCourse(userId: string, slug: string) {
  const enrollment = await getEnrollmentBySlug(userId, slug)

  if (!enrollment.course.assessment) {
    throw new AppError('This course does not have an assessment.', 404, 'ASSESSMENT_NOT_FOUND')
  }

  if (enrollment.progress < 100) {
    throw new AppError(
      'Finish all lessons before starting the assessment.',
      400,
      'ASSESSMENT_LOCKED'
    )
  }

  return {
    id: enrollment.course.assessment.id,
    title: enrollment.course.assessment.title,
    description: enrollment.course.assessment.description,
    passingScore: enrollment.course.assessment.passingScore,
    timeLimitMinutes: enrollment.course.assessment.timeLimitMinutes,
    questions: enrollment.course.assessment.questions,
  }
}

export async function submitAssessmentForCourse(
  userId: string,
  slug: string,
  answers: AssessmentAnswerInput[]
) {
  const enrollment = await getEnrollmentBySlug(userId, slug)

  if (!enrollment.course.assessment) {
    throw new AppError('This course does not have an assessment.', 404, 'ASSESSMENT_NOT_FOUND')
  }

  if (enrollment.progress < 100) {
    throw new AppError(
      'Finish all lessons before submitting the assessment.',
      400,
      'ASSESSMENT_LOCKED'
    )
  }

  const questions = await prisma.assessmentQuestion.findMany({
    where: {
      assessmentId: enrollment.course.assessment.id,
    },
    orderBy: {
      order: 'asc',
    },
    select: {
      id: true,
      correctOption: true,
      explanation: true,
      prompt: true,
    },
  })

  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.optionId]))
  let correctAnswers = 0

  const reviewedAnswers = questions.map((question) => {
    const chosenOption = answerMap.get(question.id) ?? null
    const correct = chosenOption === question.correctOption

    if (correct) {
      correctAnswers += 1
    }

    return {
      questionId: question.id,
      prompt: question.prompt,
      chosenOption,
      correctOption: question.correctOption,
      correct,
      explanation: question.explanation,
    }
  })

  const score =
    questions.length === 0 ? 0 : Number(((correctAnswers / questions.length) * 100).toFixed(2))
  const passed = score >= enrollment.course.assessment.passingScore

  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.assessmentAttempt.create({
      data: {
        assessmentId: enrollment.course.assessment!.id,
        userId,
        enrollmentId: enrollment.id,
        score,
        passed,
        answers: reviewedAnswers,
      },
      select: {
        id: true,
        score: true,
        passed: true,
        submittedAt: true,
      },
    })

    let certificate = enrollment.certificate

    if (passed) {
      await tx.enrollment.update({
        where: {
          id: enrollment.id,
        },
        data: {
          status: 'COMPLETED',
          completedAt: enrollment.completedAt ?? new Date(),
        },
      })

      if (enrollment.course.hasCertificate) {
        certificate = await issueCertificateIfNeeded(tx, {
          userId,
          courseId: enrollment.course.id,
          enrollmentId: enrollment.id,
        })
      }
    }

    return {
      attempt,
      certificate,
    }
  })

  return {
    score,
    passed,
    passingScore: enrollment.course.assessment.passingScore,
    answers: reviewedAnswers,
    attempt: result.attempt,
    certificate: result.certificate,
  }
}
