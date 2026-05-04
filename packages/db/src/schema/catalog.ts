import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  numeric,
  index,
  uniqueIndex,
  primaryKey,
  jsonb,
} from 'drizzle-orm/pg-core';
import { courseStatusEnum, courseLevelEnum } from './enums';
import { users } from './users';

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    name: varchar('name', { length: 128 }).notNull(),
    description: text('description'),
    parentId: uuid('parent_id'),
    orderIndex: integer('order_index').notNull().default(0),
    iconName: varchar('icon_name', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('categories_slug_idx').on(t.slug), index('categories_parent_idx').on(t.parentId)],
);

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
});

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    subtitle: varchar('subtitle', { length: 500 }),
    description: text('description'),

    coverUrl: text('cover_url'),
    trailerMuxPlaybackId: varchar('trailer_mux_playback_id', { length: 128 }),

    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    instructorId: uuid('instructor_id').references(() => users.id, { onDelete: 'set null' }),

    workloadHours: numeric('workload_hours', { precision: 6, scale: 2 }).notNull().default('0'),
    level: courseLevelEnum('level').notNull().default('basic'),
    language: varchar('language', { length: 8 }).notNull().default('pt-BR'),

    status: courseStatusEnum('status').notNull().default('draft'),

    // Comercial: aceita compra avulsa? Faz parte da assinatura?
    isPremium: boolean('is_premium').notNull().default(false),
    isSubscriptionOnly: boolean('is_subscription_only').notNull().default(false),
    priceCents: integer('price_cents'),
    stripeProductId: varchar('stripe_product_id', { length: 64 }),
    stripePriceId: varchar('stripe_price_id', { length: 64 }),

    // Avaliação e certificado
    passingScore: integer('passing_score').notNull().default(70),
    allowCertificate: boolean('allow_certificate').notNull().default(true),

    // SEO
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: text('seo_description'),

    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  },
  (t) => [
    uniqueIndex('courses_slug_idx').on(t.slug),
    index('courses_status_idx').on(t.status),
    index('courses_category_idx').on(t.categoryId),
    index('courses_instructor_idx').on(t.instructorId),
    index('courses_published_idx').on(t.publishedAt),
  ],
);

export const courseTags = pgTable(
  'course_tags',
  {
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.tagId] })],
);

export const courseRequirements = pgTable('course_requirements', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
});

export const courseOutcomes = pgTable('course_outcomes', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
});
