import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  numeric,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { certificateStatusEnum } from './enums';
import { users } from './users';
import { courses } from './catalog';
import { enrollments } from './access';

/**
 * certificates — emissão imutável.
 *
 * Snapshots (user_name_snapshot, course_title_snapshot, etc) garantem que o certificado
 * NUNCA muda mesmo se o curso for renomeado, instrutor trocado ou usuário renomeado.
 * Isso é crítico para verificação pública.
 */
export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 32 }).notNull().unique(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'restrict' }),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => enrollments.id, { onDelete: 'restrict' }),

    // Snapshots
    userNameSnapshot: varchar('user_name_snapshot', { length: 255 }).notNull(),
    userCpfSnapshot: varchar('user_cpf_snapshot', { length: 14 }),
    courseTitleSnapshot: varchar('course_title_snapshot', { length: 255 }).notNull(),
    workloadHoursSnapshot: numeric('workload_hours_snapshot', { precision: 6, scale: 2 }).notNull(),
    instructorNameSnapshot: varchar('instructor_name_snapshot', { length: 255 }),
    finalScore: numeric('final_score', { precision: 5, scale: 2 }),

    status: certificateStatusEnum('status').notNull().default('generating'),

    issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
    pdfGcsKey: varchar('pdf_gcs_key', { length: 500 }),
    pdfUrl: text('pdf_url'),
    pdfHashSha256: varchar('pdf_hash_sha256', { length: 64 }),

    verificationCount: integer('verification_count').notNull().default(0),

    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokeReason: text('revoke_reason'),
    revokedByUserId: uuid('revoked_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => [
    uniqueIndex('certificates_code_idx').on(t.code),
    uniqueIndex('certificates_user_course_issued_idx')
      .on(t.userId, t.courseId)
      .where(sql`${t.status} = 'issued'`),
    index('certificates_user_idx').on(t.userId),
    index('certificates_status_idx').on(t.status),
  ],
);
