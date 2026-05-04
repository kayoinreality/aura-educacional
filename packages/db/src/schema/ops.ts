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
import { reviewStatusEnum, notificationTypeEnum } from './enums';
import { users } from './users';
import { courses } from './catalog';

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    status: reviewStatusEnum('status').notNull().default('pending'),
    moderatedAt: timestamp('moderated_at', { withTimezone: true }),
    moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('reviews_user_course_unique').on(t.userId, t.courseId),
    index('reviews_course_status_idx').on(t.courseId, t.status),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    actionUrl: text('action_url'),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('notifications_user_unread_idx').on(t.userId, t.readAt)],
);

/**
 * email_log — auditoria de envios via Resend.
 */
export const emailLog = pgTable(
  'email_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    toEmail: varchar('to_email', { length: 255 }).notNull(),
    templateId: varchar('template_id', { length: 64 }).notNull(),
    resendId: varchar('resend_id', { length: 128 }),
    status: varchar('status', { length: 32 }).notNull().default('queued'),
    error: text('error'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('email_log_status_idx').on(t.status, t.createdAt)],
);

/**
 * webhook_events — idempotência de webhooks Stripe/Mux.
 * Garantia: cada event_id é processado uma única vez.
 */
export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    source: varchar('source', { length: 16 }).notNull(), // 'stripe' | 'mux'
    eventId: varchar('event_id', { length: 128 }).notNull(),
    eventType: varchar('event_type', { length: 128 }).notNull(),
    payload: jsonb('payload').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    error: text('error'),
    retryCount: integer('retry_count').notNull().default(0),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('webhook_events_event_id_idx').on(t.source, t.eventId),
    index('webhook_events_unprocessed_idx').on(t.processedAt),
  ],
);

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 64 }).notNull(),
    entityType: varchar('entity_type', { length: 64 }).notNull(),
    entityId: varchar('entity_id', { length: 64 }),
    diff: jsonb('diff'),
    ip: varchar('ip', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('audit_log_entity_idx').on(t.entityType, t.entityId)],
);
