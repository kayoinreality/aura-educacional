import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { db, courses, users, orders, certificates } from '@aura/db';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminRoutes = new Hono();

adminRoutes.use('*', requireAuth, requireRole('admin', 'superadmin'));

/**
 * GET /admin/stats — KPIs do dashboard
 */
adminRoutes.get('/stats', async (c) => {
  const [{ totalUsers }] = await db.execute<{ totalUsers: number }>(
    `SELECT COUNT(*)::int AS "totalUsers" FROM users WHERE deleted_at IS NULL`,
  ) as unknown as Array<{ totalUsers: number }>;
  const [{ totalCourses }] = await db.execute<{ totalCourses: number }>(
    `SELECT COUNT(*)::int AS "totalCourses" FROM courses WHERE status = 'published'`,
  ) as unknown as Array<{ totalCourses: number }>;
  const [{ totalCerts }] = await db.execute<{ totalCerts: number }>(
    `SELECT COUNT(*)::int AS "totalCerts" FROM certificates WHERE status = 'issued'`,
  ) as unknown as Array<{ totalCerts: number }>;
  return c.json({ totalUsers, totalCourses, totalCerts });
});

adminRoutes.get('/courses', async (c) => {
  const rows = await db.select().from(courses).orderBy(desc(courses.updatedAt)).limit(100);
  return c.json({ courses: rows });
});

adminRoutes.get('/students', async (c) => {
  const rows = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.role, 'student'))
    .limit(100);
  return c.json({ students: rows });
});

adminRoutes.get('/orders', async (c) => {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  return c.json({ orders: rows });
});

adminRoutes.get('/certificates', async (c) => {
  const rows = await db.select().from(certificates).orderBy(desc(certificates.issuedAt)).limit(100);
  return c.json({ certificates: rows });
});
