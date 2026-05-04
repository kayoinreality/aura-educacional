import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ error: err.name, message: err.message }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json(
      { error: 'ValidationError', message: 'Dados inválidos', details: err.flatten() },
      400,
    );
  }
  console.error('Unhandled error:', err);
  return c.json({ error: 'InternalError', message: 'Algo deu errado' }, 500);
}
