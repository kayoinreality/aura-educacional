import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';
import { userRoleEnum, userStatusEnum } from './enums';

/**
 * Users — fonte de verdade do perfil.
 * Auth (login) é gerenciada por Firebase Auth; aqui guardamos o "shadow" do usuário
 * sincronizado via webhook/Admin SDK no primeiro login.
 *
 * `firebase_uid` é o link com Firebase Auth.
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firebaseUid: varchar('firebase_uid', { length: 128 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    avatarUrl: text('avatar_url'),

    // Dados pessoais (necessários para certificado)
    cpf: varchar('cpf', { length: 14 }),
    birthDate: timestamp('birth_date', { mode: 'date' }),
    phone: varchar('phone', { length: 32 }),

    role: userRoleEnum('role').notNull().default('student'),
    status: userStatusEnum('status').notNull().default('active'),

    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

    stripeCustomerId: varchar('stripe_customer_id', { length: 64 }),

    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('users_firebase_uid_idx').on(t.firebaseUid),
    uniqueIndex('users_email_idx').on(t.email),
    index('users_role_idx').on(t.role),
    index('users_status_idx').on(t.status),
    index('users_stripe_customer_idx').on(t.stripeCustomerId),
  ],
);

export const instructorProfiles = pgTable('instructor_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  headline: varchar('headline', { length: 255 }),
  bio: text('bio'),
  expertise: text('expertise').array(),
  socialLinks: jsonb('social_links').$type<Record<string, string>>().default({}),
  rating: text('rating'), // numeric stored as string by drizzle
  ratingCount: text('rating_count'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const loginHistory = pgTable(
  'login_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ip: varchar('ip', { length: 64 }),
    userAgent: text('user_agent'),
    country: varchar('country', { length: 2 }),
    success: boolean('success').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('login_history_user_idx').on(t.userId, t.createdAt)],
);
