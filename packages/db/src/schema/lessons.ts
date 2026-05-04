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
  jsonb,
} from 'drizzle-orm/pg-core';
import { lessonTypeEnum } from './enums';
import { courses } from './catalog';

export const modules = pgTable(
  'modules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('modules_course_idx').on(t.courseId, t.orderIndex)],
);

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    type: lessonTypeEnum('type').notNull().default('video'),
    orderIndex: integer('order_index').notNull().default(0),

    // texto / markdown
    contentMarkdown: text('content_markdown'),

    // vídeo (Mux)
    muxAssetId: varchar('mux_asset_id', { length: 128 }),
    muxPlaybackId: varchar('mux_playback_id', { length: 128 }),
    muxStatus: varchar('mux_status', { length: 32 }), // 'preparing' | 'ready' | 'errored'
    durationSeconds: integer('duration_seconds'),

    isPreview: boolean('is_preview').notNull().default(false),
    isPublished: boolean('is_published').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('lessons_module_idx').on(t.moduleId, t.orderIndex),
    index('lessons_course_idx').on(t.courseId),
    index('lessons_mux_asset_idx').on(t.muxAssetId),
  ],
);

export const lessonAttachments = pgTable('lesson_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  gcsKey: varchar('gcs_key', { length: 500 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  mimeType: varchar('mime_type', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Quizzes — podem ser por aula (type=quiz) ou exame final do curso (is_final_exam)
export const quizzes = pgTable(
  'quizzes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    passingScore: integer('passing_score').notNull().default(70),
    timeLimitMinutes: integer('time_limit_minutes'),
    maxAttempts: integer('max_attempts'),
    isFinalExam: boolean('is_final_exam').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('quizzes_course_idx').on(t.courseId), index('quizzes_lesson_idx').on(t.lessonId)],
);

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  statement: text('statement').notNull(),
  type: varchar('type', { length: 16 }).notNull().default('single'), // single | multiple | truefalse
  orderIndex: integer('order_index').notNull().default(0),
  points: integer('points').notNull().default(1),
});

export const quizOptions = pgTable('quiz_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => quizQuestions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
});

export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    score: numeric('score', { precision: 5, scale: 2 }),
    passed: boolean('passed').notNull().default(false),
    answers: jsonb('answers').$type<Array<{ questionId: string; optionIds: string[] }>>(),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
  },
  (t) => [
    index('quiz_attempts_user_quiz_idx').on(t.userId, t.quizId),
    index('quiz_attempts_quiz_idx').on(t.quizId),
  ],
);

