import { Prisma } from '@prisma/client'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = 'APP_ERROR',
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function mapError(error: unknown) {
  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      payload: {
        error: error.message,
        code: error.code,
        details: error.details,
      },
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return {
        statusCode: 409,
        payload: {
          error: 'A record with the same unique value already exists.',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          details: error.meta,
        },
      }
    }
  }

  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number'
  ) {
    const fallback = error as {
      statusCode: number
      message?: string
      code?: string
    }

    return {
      statusCode: fallback.statusCode,
      payload: {
        error: fallback.message || 'Request failed.',
        code: fallback.code || 'REQUEST_ERROR',
      },
    }
  }

  return {
    statusCode: 500,
    payload: {
      error: 'Internal server error.',
      code: 'INTERNAL_SERVER_ERROR',
    },
  }
}
