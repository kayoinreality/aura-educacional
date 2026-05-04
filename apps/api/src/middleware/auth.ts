import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyIdToken, type DecodedIdToken } from '@aura/auth/server';

export type AuthVariables = {
  userId: string; // firebase uid (não confundir com users.id que é uuid)
  user: DecodedIdToken;
};

/**
 * Valida Firebase ID token do header `Authorization: Bearer <idToken>`.
 * Anexa { user, userId } ao contexto.
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Token ausente' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = await verifyIdToken(token);
    c.set('user', decoded);
    c.set('userId', decoded.uid);
    await next();
  } catch (err) {
    throw new HTTPException(401, { message: 'Token inválido' });
  }
}

/**
 * Exige role específica no token (custom claims).
 * Use após `requireAuth`.
 */
export function requireRole(...roles: Array<'admin' | 'superadmin' | 'instructor'>) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as DecodedIdToken | undefined;
    const userRole = (user?.role as string | undefined) ?? 'student';
    if (!roles.includes(userRole as typeof roles[number])) {
      throw new HTTPException(403, { message: 'Sem permissão' });
    }
    await next();
  };
}
