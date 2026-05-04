import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, users } from '@aura/db';
import { requireAuth } from '../middleware/auth';

export const authRoutes = new Hono();

/**
 * POST /auth/sync — sincroniza usuário Firebase com nossa tabela `users`.
 * Chamado no primeiro login (ou em mudanças de perfil) pelo cliente.
 *
 * O Firebase ID token contém { uid, email, name, picture, email_verified }.
 * Aqui criamos/atualizamos o "shadow" do usuário no Postgres.
 */
authRoutes.post('/sync', requireAuth, async (c) => {
  const fbUser = c.get('user');
  const uid = fbUser.uid;
  const email = fbUser.email;
  if (!email) return c.json({ error: 'Bad', message: 'Email ausente no token' }, 400);

  const existing = await db.select().from(users).where(eq(users.firebaseUid, uid)).limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({
        email,
        name: (fbUser.name as string | undefined) ?? existing[0].name,
        avatarUrl: (fbUser.picture as string | undefined) ?? existing[0].avatarUrl,
        emailVerifiedAt: fbUser.email_verified ? new Date() : existing[0].emailVerifiedAt,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing[0].id));
    return c.json({ user: existing[0] });
  }

  const inserted = await db
    .insert(users)
    .values({
      firebaseUid: uid,
      email,
      name: (fbUser.name as string | undefined) ?? null,
      avatarUrl: (fbUser.picture as string | undefined) ?? null,
      emailVerifiedAt: fbUser.email_verified ? new Date() : null,
      lastLoginAt: new Date(),
    })
    .returning();

  return c.json({ user: inserted[0], created: true });
});

/**
 * GET /auth/me — perfil do usuário logado
 */
authRoutes.get('/me', requireAuth, async (c) => {
  const uid = c.get('userId');
  const row = await db.select().from(users).where(eq(users.firebaseUid, uid)).limit(1);
  if (!row[0]) return c.json({ error: 'NotFound', message: 'Usuário não sincronizado' }, 404);
  return c.json({ user: row[0] });
});
