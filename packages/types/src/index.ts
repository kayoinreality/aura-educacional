import { z } from 'zod';

// =====================================================================
// Auth / User
// =====================================================================

export const userPublicSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  role: z.enum(['student', 'instructor', 'admin', 'superadmin']),
});
export type UserPublic = z.infer<typeof userPublicSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .optional(),
  phone: z.string().min(10).max(32).optional(),
  birthDate: z.coerce.date().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// =====================================================================
// Courses
// =====================================================================

export const courseSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  coverUrl: z.string().nullable(),
  workloadHours: z.string(),
  level: z.enum(['basic', 'intermediate', 'advanced']),
  isPremium: z.boolean(),
  priceCents: z.number().nullable(),
  category: z.object({ slug: z.string(), name: z.string() }).nullable(),
  instructor: z.object({ name: z.string().nullable(), avatarUrl: z.string().nullable() }).nullable(),
});
export type CourseSummary = z.infer<typeof courseSummarySchema>;

// =====================================================================
// Enrollment / Progress
// =====================================================================

export const lessonProgressUpdateSchema = z.object({
  lessonId: z.string().uuid(),
  watchedSeconds: z.number().int().nonnegative(),
  lastPositionSeconds: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
});
export type LessonProgressUpdate = z.infer<typeof lessonProgressUpdateSchema>;

// =====================================================================
// Quiz
// =====================================================================

export const quizSubmitSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      optionIds: z.array(z.string().uuid()).min(1),
    }),
  ),
});
export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;

// =====================================================================
// Checkout
// =====================================================================

export const subscriptionCheckoutSchema = z.object({
  planId: z.string().uuid(),
  interval: z.enum(['month', 'year']),
  couponCode: z.string().optional(),
});
export type SubscriptionCheckoutInput = z.infer<typeof subscriptionCheckoutSchema>;

export const courseCheckoutSchema = z.object({
  courseId: z.string().uuid(),
  couponCode: z.string().optional(),
});
export type CourseCheckoutInput = z.infer<typeof courseCheckoutSchema>;

// =====================================================================
// Certificate
// =====================================================================

export const certificatePublicSchema = z.object({
  code: z.string(),
  userName: z.string(),
  courseTitle: z.string(),
  workloadHours: z.string(),
  instructorName: z.string().nullable(),
  issuedAt: z.string(),
  status: z.enum(['issued', 'revoked']),
  pdfUrl: z.string().nullable(),
});
export type CertificatePublic = z.infer<typeof certificatePublicSchema>;

// =====================================================================
// API helpers
// =====================================================================

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
