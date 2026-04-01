import { nanoid } from 'nanoid'
import Stripe from 'stripe'
import { prisma } from '../../database/client'
import { env } from '../../config/env'
import { AppError } from '../../utils/errors'

type PaymentMethodInput = 'CREDIT_CARD' | 'PIX' | 'BOLETO'

function normalizeCoupon(code?: string) {
  return code?.trim().toUpperCase() ?? null
}

function hasConfiguredStripeKeys() {
  return Boolean(
    env.STRIPE_SECRET_KEY &&
      env.STRIPE_PUBLISHABLE_KEY &&
      !env.STRIPE_SECRET_KEY.includes('XXXX') &&
      !env.STRIPE_PUBLISHABLE_KEY.includes('XXXX')
  )
}

function getStripeClient() {
  if (!hasConfiguredStripeKeys()) {
    throw new AppError(
      'Stripe is not configured yet. Add valid Stripe keys to continue.',
      503,
      'STRIPE_KEYS_REQUIRED'
    )
  }

  return new Stripe(env.STRIPE_SECRET_KEY!)
}

function mapStripePaymentMethod(method: PaymentMethodInput): Stripe.Checkout.SessionCreateParams.PaymentMethodType {
  if (method === 'PIX') return 'pix'
  if (method === 'BOLETO') return 'boleto'
  return 'card'
}

function serializeStripeSession(session: Stripe.Checkout.Session) {
  return {
    id: session.id,
    status: session.status,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    amountSubtotal: session.amount_subtotal,
    currency: session.currency,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    paymentIntent:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    metadata: session.metadata ?? {},
  }
}

async function markStripeCheckoutAsFailed(
  session: Stripe.Checkout.Session,
  status: 'FAILED' | 'CANCELLED'
) {
  const existingPayment = await prisma.payment.findUnique({
    where: {
      gatewayId: session.id,
    },
    select: {
      id: true,
      status: true,
    },
  })

  if (!existingPayment) {
    return {
      status,
      paymentId: null,
      sessionId: session.id,
    }
  }

  const failedAt = status === 'FAILED' ? new Date() : null

  const payment = await prisma.payment.update({
    where: {
      id: existingPayment.id,
    },
    data: {
      status,
      failedAt,
      gatewayData: serializeStripeSession(session),
    },
    select: {
      id: true,
      status: true,
    },
  })

  return {
    status: payment.status,
    paymentId: payment.id,
    sessionId: session.id,
  }
}

async function finalizeStripeCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const courseId = session.metadata?.courseId
  const courseSlug = session.metadata?.courseSlug
  const couponCode = normalizeCoupon(session.metadata?.couponCode || undefined)

  if (!userId || !courseId || !courseSlug) {
    throw new AppError('Stripe session metadata is incomplete.', 400, 'STRIPE_SESSION_INVALID')
  }

  const paymentMethod = (session.metadata?.paymentMethod as PaymentMethodInput | undefined) ?? 'CREDIT_CARD'
  const amount = Number(((session.amount_total ?? 0) / 100).toFixed(2))
  const currency = (session.currency ?? 'brl').toUpperCase()

  return prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findUnique({
      where: {
        gatewayId: session.id,
      },
      select: {
        id: true,
        status: true,
      },
    })

    const payment = existingPayment
      ? await tx.payment.update({
          where: {
            id: existingPayment.id,
          },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            failedAt: null,
            method: paymentMethod,
            amount,
            currency,
            gatewayData: serializeStripeSession(session),
          },
          select: {
            id: true,
            status: true,
          },
        })
      : await tx.payment.create({
          data: {
            userId,
            courseId,
            amount,
            currency,
            status: 'PAID',
            method: paymentMethod,
            gatewayId: session.id,
            gatewayData: serializeStripeSession(session),
            paidAt: new Date(),
          },
          select: {
            id: true,
            status: true,
          },
        })

    if (couponCode && existingPayment?.status !== 'PAID') {
      await tx.coupon.updateMany({
        where: {
          code: couponCode,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      })
    }

    const enrollment = await tx.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        status: 'ACTIVE',
        paymentId: payment.id,
      },
      create: {
        userId,
        courseId,
        status: 'ACTIVE',
        progress: 0,
        paymentId: payment.id,
      },
      select: {
        id: true,
        status: true,
        progress: true,
      },
    })

    await tx.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {},
      create: {
        userId,
        courseId,
        progressPercent: 0,
      },
    })

    return {
      paymentId: payment.id,
      paymentStatus: payment.status,
      enrollment,
      sessionId: session.id,
    }
  })
}

async function getPublishedCourseBySlug(slug: string) {
  const course = await prisma.course.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      price: true,
      originalPrice: true,
      isFree: true,
      hasCertificate: true,
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
  })

  if (!course) {
    throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND')
  }

  return course
}

async function calculateCheckoutSummary(courseSlug: string, couponCode?: string) {
  const course = await getPublishedCourseBySlug(courseSlug)
  const basePrice = Number(course.price)
  const normalizedCoupon = normalizeCoupon(couponCode)
  let discountAmount = 0
  let appliedCoupon: null | {
    code: string
    description: string | null
  } = null

  if (normalizedCoupon) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCoupon },
    })

    if (!coupon || !coupon.isActive) {
      throw new AppError('Coupon not found or inactive.', 404, 'COUPON_NOT_FOUND')
    }

    if (coupon.validUntil && coupon.validUntil < new Date()) {
      throw new AppError('Coupon expired.', 400, 'COUPON_EXPIRED')
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError('Coupon usage limit reached.', 400, 'COUPON_LIMIT_REACHED')
    }

    if (coupon.minAmount && basePrice < Number(coupon.minAmount)) {
      throw new AppError('Coupon minimum amount not reached.', 400, 'COUPON_MIN_AMOUNT')
    }

    if (coupon.courseIds.length > 0 && !coupon.courseIds.includes(course.id)) {
      throw new AppError('Coupon not applicable to this course.', 400, 'COUPON_NOT_APPLICABLE')
    }

    discountAmount =
      coupon.discountType === 'PERCENT'
        ? Number((basePrice * Number(coupon.discount)) / 100)
        : Number(coupon.discount)

    discountAmount = Math.min(basePrice, discountAmount)
    appliedCoupon = {
      code: coupon.code,
      description: coupon.description,
    }
  }

  const finalPrice = Math.max(0, basePrice - discountAmount)

  return {
    course: {
      ...course,
      price: basePrice,
      originalPrice: course.originalPrice ? Number(course.originalPrice) : null,
    },
    pricing: {
      basePrice,
      discountAmount,
      finalPrice,
      currency: 'BRL',
      isFree: course.isFree || finalPrice === 0,
      coupon: appliedCoupon,
    },
  }
}

export async function getCheckoutSummary(courseSlug: string, couponCode?: string) {
  return calculateCheckoutSummary(courseSlug, couponCode)
}

export async function purchaseCourse(
  userId: string,
  input: {
    courseSlug: string
    paymentMethod: PaymentMethodInput
    couponCode?: string
  }
) {
  const summary = await calculateCheckoutSummary(input.courseSlug, input.couponCode)

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: summary.course.id,
      },
    },
    select: {
      id: true,
      status: true,
      progress: true,
    },
  })

  if (existingEnrollment && ['ACTIVE', 'COMPLETED'].includes(existingEnrollment.status)) {
    return {
      mode: 'existing',
      message: 'You already have access to this course.',
      accessGranted: true,
      enrollment: existingEnrollment,
      pricing: summary.pricing,
    }
  }

  if (env.PAYMENT_PROVIDER_MODE === 'stripe' && !summary.pricing.isFree && !hasConfiguredStripeKeys()) {
    throw new AppError(
      'Stripe mode requires STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY and webhook setup before enabling public checkout.',
      503,
      'STRIPE_KEYS_REQUIRED'
    )
  }

  if (env.PAYMENT_PROVIDER_MODE === 'stripe' && !summary.pricing.isFree) {
    const stripe = getStripeClient()
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND')
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${env.APP_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/checkout/cancelado?course=${summary.course.slug}`,
      payment_method_types: [mapStripePaymentMethod(input.paymentMethod)],
      customer_email: user.email,
      billing_address_collection: 'auto',
      metadata: {
        userId,
        courseId: summary.course.id,
        courseSlug: summary.course.slug,
        paymentMethod: input.paymentMethod,
        couponCode: summary.pricing.coupon?.code ?? '',
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: Math.round(summary.pricing.finalPrice * 100),
            product_data: {
              name: summary.course.title,
              description: summary.course.shortDescription,
            },
          },
        },
      ],
      custom_text: {
        submit: {
          message: `Aluno: ${user.firstName} ${user.lastName}`,
        },
      },
    })

    await prisma.payment.create({
      data: {
        userId,
        courseId: summary.course.id,
        amount: summary.pricing.finalPrice,
        currency: 'BRL',
        status: 'PENDING',
        method: input.paymentMethod,
        gatewayId: session.id,
        gatewayData: serializeStripeSession(session),
      },
    })

    return {
      mode: 'stripe',
      message: 'Stripe checkout session created successfully.',
      accessGranted: false,
      course: summary.course,
      pricing: summary.pricing,
      checkoutSessionId: session.id,
      redirectUrl: session.url,
    }
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    let paymentId: string | null = null

    if (!summary.pricing.isFree) {
      const payment = await tx.payment.create({
        data: {
          userId,
          courseId: summary.course.id,
          amount: summary.pricing.finalPrice,
          currency: summary.pricing.currency,
          status: 'PAID',
          method: input.paymentMethod,
          gatewayId: `mock_${nanoid(18)}`,
          gatewayData: {
            provider: env.PAYMENT_PROVIDER_MODE,
            coupon: summary.pricing.coupon?.code ?? null,
          },
          paidAt: new Date(),
        },
        select: {
          id: true,
          amount: true,
          status: true,
          method: true,
        },
      })

      paymentId = payment.id

      if (summary.pricing.coupon?.code) {
        await tx.coupon.update({
          where: { code: summary.pricing.coupon.code },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        })
      }
    }

    const createdEnrollment = existingEnrollment
      ? await tx.enrollment.update({
          where: {
            userId_courseId: {
              userId,
              courseId: summary.course.id,
            },
          },
          data: {
            status: 'ACTIVE',
            paymentId,
            progress: 0,
            completedAt: null,
          },
          select: {
            id: true,
            status: true,
            progress: true,
            createdAt: true,
          },
        })
      : await tx.enrollment.create({
          data: {
            userId,
            courseId: summary.course.id,
            status: 'ACTIVE',
            progress: 0,
            paymentId,
          },
          select: {
            id: true,
            status: true,
            progress: true,
            createdAt: true,
          },
        })

    await tx.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: summary.course.id,
        },
      },
      update: {
        progressPercent: 0,
        lastLessonId: null,
      },
      create: {
        userId,
        courseId: summary.course.id,
        progressPercent: 0,
      },
    })

    return createdEnrollment
  })

  return {
    mode: env.PAYMENT_PROVIDER_MODE,
    message: summary.pricing.isFree
      ? 'Enrollment completed successfully.'
      : 'Payment approved and access granted.',
    accessGranted: true,
    enrollment,
    pricing: summary.pricing,
    course: summary.course,
  }
}

export async function handleStripeWebhook(rawBody: string | Buffer, signature: string) {
  if (!env.STRIPE_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET.includes('XXXX')) {
    throw new AppError('Stripe webhook secret is not configured.', 503, 'STRIPE_WEBHOOK_NOT_CONFIGURED')
  }

  const stripe = getStripeClient()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    throw new AppError('Invalid Stripe signature.', 400, 'STRIPE_SIGNATURE_INVALID')
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session
    return finalizeStripeCheckout(session)
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session
    return markStripeCheckoutAsFailed(session, 'FAILED')
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    return markStripeCheckoutAsFailed(session, 'CANCELLED')
  }

  return {
    ignored: true,
    eventType: event.type,
  }
}

export async function getCheckoutSessionStatus(userId: string, sessionId: string) {
  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.metadata?.userId !== userId) {
    throw new AppError('This checkout session does not belong to the current user.', 403, 'CHECKOUT_SESSION_FORBIDDEN')
  }

  let payment = await prisma.payment.findUnique({
    where: {
      gatewayId: sessionId,
    },
    select: {
      id: true,
      status: true,
      amount: true,
      method: true,
      paidAt: true,
      },
  })

  if (session.payment_status === 'paid' && payment?.status !== 'PAID') {
    await finalizeStripeCheckout(session)

    payment = await prisma.payment.findUnique({
      where: {
        gatewayId: sessionId,
      },
      select: {
        id: true,
        status: true,
        amount: true,
        method: true,
        paidAt: true,
      },
    })
  }

  const courseId = session.metadata?.courseId
  const enrollment =
    courseId
      ? await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          select: {
            id: true,
            status: true,
            progress: true,
          },
        })
      : null

  return {
    sessionId,
    checkoutStatus: session.status,
    stripePaymentStatus: session.payment_status,
    redirectStatus:
      payment?.status === 'PAID' || enrollment
        ? 'confirmed'
        : session.payment_status === 'paid'
          ? 'processing'
          : 'pending',
    courseSlug: session.metadata?.courseSlug ?? null,
    payment: payment
      ? {
          ...payment,
          amount: Number(payment.amount),
        }
      : null,
    enrollment,
  }
}
