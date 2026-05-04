import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  index,
  uniqueIndex,
  numeric,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { accessSourceEnum, enrollmentStatusEnum } from './enums';
import { users } from './users';
import { courses } from './catalog';
import { lessons } from './lessons';

/**
 * course_access — direito de acessar um curso AGORA.
 *
 * Decisão arquitetural crítica:
 * - Compras avulsas, gifts, admin grants → INSERIR rows aqui (lifetime ou com expiry).
 * - Assinatura ativa NÃO materializa rows aqui (caso contrário, 1 assinante × N cursos
 *   inflaria a tabela). A função has_course_access checa subscriptions ativas dinamicamente.
 *
 * Vantagens:
 * - Catálogo cresce sem inflar tabela
 * - Cancelamento de assinatura é instantâneo (sem batch update)
 * - Compras avulsas preservam acesso vitalício mesmo se assinatura cair
 */
export const courseAccess = pgTable(
  'course_access',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    source: accessSourceEnum('source').notNull(),
    sourceRefId: uuid('source_ref_id'), // pode apontar pra orders.id, subscriptions.id, etc.
    grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }), // null = lifetime
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokeReason: text('revoke_reason'),
  },
  (t) => [
    uniqueIndex('course_access_unique_grant').on(t.userId, t.courseId, t.source, t.sourceRefId),
    index('course_access_user_course_active_idx')
      .on(t.userId, t.courseId)
      .where(sql`${t.revokedAt} IS NULL`),
  ],
);

/**
 * enrollments — jornada do aluno no curso.
 * 1 row por (user, course). Não tem source — quem decide acesso é course_access.
 */
export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    status: enrollmentStatusEnum('status').notNull().default('active'),
    progressPercent: numeric('progress_percent', { precision: 5, scale: 2 })
      .notNull()
      .default('0'),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('enrollments_user_course_unique').on(t.userId, t.courseId),
    index('enrollments_user_idx').on(t.userId),
    index('enrollments_course_idx').on(t.courseId),
  ],
);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    watchedSeconds: integer('watched_seconds').notNull().default(0),
    totalSeconds: integer('total_seconds').notNull().default(0),
    lastPositionSeconds: integer('last_position_seconds').notNull().default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('lesson_progress_user_lesson_unique').on(t.userId, t.lessonId),
    index('lesson_progress_user_course_idx').on(t.userId, t.courseId),
  ],
);
