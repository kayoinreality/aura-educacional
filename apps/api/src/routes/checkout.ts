import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { db, users, courses, subscriptionPlans } from '@aura/db';
import { subscriptionCheckoutSchema, courseCheckoutSchema } from '@aura/types';
import { requireAuth } from '../middleware/auth';

export const checkoutRoutes = new Hono();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-11-20.acacia' });

checkoutRoutes.use('*', requireAuth);

async function getOrCreateStripeCustomer(firebaseUid: string, email: string): Promise<string> {
  const row = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
  const user = row[0];
  if (!user) throw new Error('User not synced');
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { firebaseUid, userId: user.id },
  });
  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, user.id));
  return customer.id;
}

/**
 * POST /checkout/subscription — cria Stripe Checkout para assinatura
 */
checkoutRoutes.post('/subscription', zValidator('json', subscriptionCheckoutSchema), async (c) => {
  const fb = c.get('user');
  const body = c.req.valid('json');

  const planRow = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, body.planId)).limit(1);
  const plan = planRow[0];
  if (!plan) return c.json({ error: 'NotFound', message: 'Plano não encontrado' }, 404);

  const priceId = body.interval === 'year' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
  if (!priceId) return c.json({ error: 'Bad', message: 'Preço não configurado' }, 400);

  const customerId = await getOrCreateStripeCustomer(fb.uid, fb.email!);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: plan.trialDays > 0 ? { trial_period_days: plan.trialDays } : undefined,
    discounts: body.couponCode ? [{ coupon: body.couponCode }] : undefined,
    success_url: `${process.env.NEXT_PUBLIC_LEARN_URL}/auth/handoff?session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/cancelado`,
    locale: 'pt-BR',
    allow_promotion_codes: true,
  });

  return c.json({ url: session.url, sessionId: session.id });
});

/**
 * POST /checkout/course — cria Stripe Checkout para compra avulsa de curso
 */
checkoutRoutes.post('/course', zValidator('json', courseCheckoutSchema), async (c) => {
  const fb = c.get('user');
  const body = c.req.valid('json');

  const courseRow = await db.select().from(courses).where(eq(courses.id, body.courseId)).limit(1);
  const course = courseRow[0];
  if (!course) return c.json({ error: 'NotFound', message: 'Curso não encontrado' }, 404);
  if (!course.stripePriceId)
    return c.json({ error: 'Bad', message: 'Curso sem preço configurado' }, 400);

  const customerId = await getOrCreateStripeCustomer(fb.uid, fb.email!);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: course.stripePriceId, quantity: 1 }],
    discounts: body.couponCode ? [{ coupon: body.couponCode }] : undefined,
    success_url: `${process.env.NEXT_PUBLIC_LEARN_URL}/auth/handoff?session={CHECKOUT_SESSION_ID}&course=${course.slug}`,
    cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/cursos/${course.slug}`,
    locale: 'pt-BR',
    metadata: { courseId: course.id, userFirebaseUid: fb.uid },
  });

  return c.json({ url: session.url, sessionId: session.id });
});

/**
 * POST /checkout/portal — link para Stripe Customer Portal
 */
checkoutRoutes.post('/portal', async (c) => {
  const fb = c.get('user');
  const customerId = await getOrCreateStripeCustomer(fb.uid, fb.email!);
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_LEARN_URL}/conta`,
  });
  return c.json({ url: portal.url });
});
