import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';
import {
  orderStatusEnum,
  subscriptionStatusEnum,
  subscriptionIntervalEnum,
  couponTypeEnum,
  couponAppliesToEnum,
} from './enums';
import { users } from './users';
import { courses } from './catalog';

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description'),
  stripeProductId: varchar('stripe_product_id', { length: 64 }).notNull(),
  stripePriceIdMonthly: varchar('stripe_price_id_monthly', { length: 64 }),
  stripePriceIdYearly: varchar('stripe_price_id_yearly', { length: 64 }),
  features: jsonb('features').$type<string[]>().default([]),
  monthlyPriceCents: integer('monthly_price_cents').notNull(),
  yearlyPriceCents: integer('yearly_price_cents').notNull(),
  trialDays: integer('trial_days').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 64 }).notNull().unique(),
    status: subscriptionStatusEnum('status').notNull(),
    interval: subscriptionIntervalEnum('interval').notNull(),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    trialEndAt: timestamp('trial_end_at', { withTimezone: true }),
    canceledAt: timestamp('canceled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('subscriptions_stripe_idx').on(t.stripeSubscriptionId),
    index('subscriptions_user_idx').on(t.userId, t.status),
    index('subscriptions_status_idx').on(t.status),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: orderStatusEnum('status').notNull().default('pending'),

    stripeCheckoutSessionId: varchar('stripe_checkout_session_id', { length: 128 }),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 128 }),

    totalCents: integer('total_cents').notNull(),
    currency: varchar('currency', { length: 8 }).notNull().default('BRL'),
    couponId: uuid('coupon_id'),

    paidAt: timestamp('paid_at', { withTimezone: true }),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('orders_user_idx').on(t.userId, t.createdAt),
    index('orders_status_idx').on(t.status),
    index('orders_stripe_session_idx').on(t.stripeCheckoutSessionId),
  ],
);

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'restrict' }),
  priceCents: integer('price_cents').notNull(),
  quantity: integer('quantity').notNull().default(1),
});

export const coupons = pgTable(
  'coupons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    type: couponTypeEnum('type').notNull(),
    valueCents: integer('value_cents'),
    valuePercent: integer('value_percent'),
    appliesTo: couponAppliesToEnum('applies_to').notNull().default('both'),
    courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),
    stripeCouponId: varchar('stripe_coupon_id', { length: 64 }),
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').notNull().default(0),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('coupons_code_idx').on(t.code)],
);

export const couponRedemptions = pgTable('coupon_redemptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  couponId: uuid('coupon_id')
    .notNull()
    .references(() => coupons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, {
    onDelete: 'set null',
  }),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }).defaultNow().notNull(),
});
