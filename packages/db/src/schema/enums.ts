import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['student', 'instructor', 'admin', 'superadmin']);
export const userStatusEnum = pgEnum('user_status', [
  'pending_verification',
  'active',
  'inactive',
  'suspended',
]);

export const courseStatusEnum = pgEnum('course_status', ['draft', 'review', 'published', 'archived']);
export const courseLevelEnum = pgEnum('course_level', ['basic', 'intermediate', 'advanced']);

export const lessonTypeEnum = pgEnum('lesson_type', ['video', 'text', 'quiz', 'attachment']);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'active',
  'completed',
  'paused',
  'expired',
]);

export const accessSourceEnum = pgEnum('access_source', [
  'subscription',
  'purchase',
  'gift',
  'admin_grant',
  'coupon_full',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'refunded',
  'failed',
  'canceled',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
]);

export const subscriptionIntervalEnum = pgEnum('subscription_interval', ['month', 'year']);

export const certificateStatusEnum = pgEnum('certificate_status', [
  'generating',
  'issued',
  'revoked',
]);

export const couponTypeEnum = pgEnum('coupon_type', [
  'percent',
  'fixed',
  'free_course',
  'free_trial_extension',
]);

export const couponAppliesToEnum = pgEnum('coupon_applies_to', ['subscription', 'course', 'both']);

export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

export const notificationTypeEnum = pgEnum('notification_type', [
  'welcome',
  'email_verification',
  'password_reset',
  'course_published',
  'course_completed',
  'certificate_ready',
  'payment_succeeded',
  'payment_failed',
  'subscription_active',
  'subscription_renewed',
  'subscription_canceled',
  'review_approved',
]);
