import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must have at least 8 characters.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[0-9]/, 'Password must include a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character.')

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  password: passwordSchema,
  cpf: z.string().trim().regex(/^\d{11}$/).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
  acceptTerms: z.literal(true),
})

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
})

export const googleLoginSchema = z.object({
  credential: z.string().min(10),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
