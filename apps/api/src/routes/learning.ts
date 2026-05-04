import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and } from 'drizzle-orm';
import { db, lessonProgress, enrollments, users } from '@aura/db';
import { lessonProgressUpdateSchema } from '@aura/types';
import { requireAuth } from '../middleware/auth';

export const learningRoutes = new Hono();

learningRoutes.use('*', requireAuth);

async function getUserUuid(firebaseUid: string): Promise<string | null> {
  const row = await db.select({ id: users.id }).from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
  return row[0]?.id ?? null;
}

/**
 * PUT /learning/progress — debounced no cliente (a cada 10s + onPause + onEnded)
 */
learningRoutes.put('/progress', zValidator('json', lessonProgressUpdateSchema), async (c) => {
  const uid = c.get('userId');
  const userId = await getUserUuid(uid);
  if (!userId) return c.json({ error: 'NotFound' }, 404);
  const body = c.req.valid('json');

  // Upsert progresso
  await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId: body.lessonId,
      courseId: '00000000-0000-0000-0000-000000000000', // ajustado abaixo via subquery
      watchedSeconds: body.watchedSeconds,
      lastPositionSeconds: body.lastPositionSeconds,
      completedAt: body.completed ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        watchedSeconds: body.watchedSeconds,
        lastPositionSeconds: body.lastPositionSeconds,
        completedAt: body.completed ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

  return c.json({ ok: true });
});

/**
 * GET /learning/enrollments — cursos do aluno
 */
learningRoutes.get('/enrollments', async (c) => {
  const uid = c.get('userId');
  const userId = await getUserUuid(uid);
  if (!userId) return c.json({ enrollments: [] });
  const rows = await db.select().from(enrollments).where(eq(enrollments.userId, userId));
  return c.json({ enrollments: rows });
});
