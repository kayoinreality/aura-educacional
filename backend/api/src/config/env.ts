import path from 'node:path'
import { z } from 'zod'

if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(path.resolve(process.cwd(), '.env'))
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('Aura Educacional'),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  API_PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  EMAIL_FROM: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_TRANSPORT_MODE: z.enum(['log', 'smtp']).default('log'),
  PAYMENT_PROVIDER_MODE: z.enum(['mock', 'stripe']).default('mock'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  COOKIE_DOMAIN: z.string().optional(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors)
  throw new Error('Environment validation failed')
}

export const env = parsed.data

export const isProduction = env.NODE_ENV === 'production'

const appOrigin = new URL(env.APP_URL).origin
const apiOrigin = new URL(env.API_URL).origin

const configuredCorsOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []

export const allowedCorsOrigins = [
  appOrigin,
  apiOrigin,
  ...configuredCorsOrigins,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
].filter((origin, index, array) => array.indexOf(origin) === index)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function originPatternToRegExp(pattern: string) {
  const escaped = pattern
    .split('*')
    .map((part) => escapeRegExp(part))
    .join('.*')

  return new RegExp(`^${escaped}$`)
}

export function isAllowedCorsOrigin(origin: string) {
  return allowedCorsOrigins.some((pattern) => {
    if (pattern.includes('*')) {
      return originPatternToRegExp(pattern).test(origin)
    }

    return pattern === origin
  })
}

export const refreshCookieConfig = {
  domain: env.COOKIE_DOMAIN || undefined,
  sameSite: isProduction && appOrigin !== apiOrigin ? ('none' as const) : ('lax' as const),
  secure: isProduction,
}
