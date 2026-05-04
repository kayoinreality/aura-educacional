import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, courses, categories, certificates, users } from '@aura/db';

export const publicRoutes = new Hono();

/**
 * GET /public/courses — catálogo público (apenas published)
 */
publicRoutes.get('/courses', async (c) => {
  const categorySlug = c.req.query('category');
  const search = c.req.query('q');

  const conditions = [eq(courses.status, 'published')];
  if (categorySlug) {
    const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
    if (cat[0]) conditions.push(eq(courses.categoryId, cat[0].id));
  }
  if (search) {
    conditions.push(sql`${courses.title} ILIKE ${`%${search}%`}`);
  }

  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      subtitle: courses.subtitle,
      coverUrl: courses.coverUrl,
      workloadHours: courses.workloadHours,
      level: courses.level,
      isPremium: courses.isPremium,
      priceCents: courses.priceCents,
    })
    .from(courses)
    .where(and(...conditions))
    .orderBy(desc(courses.publishedAt))
    .limit(60);

  return c.json({ courses: rows });
});

/**
 * GET /public/courses/:slug — detalhe do curso público
 */
publicRoutes.get('/courses/:slug', async (c) => {
  const slug = c.req.param('slug');
  const row = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.status, 'published')))
    .limit(1);
  if (!row[0]) return c.json({ error: 'NotFound', message: 'Curso não encontrado' }, 404);
  return c.json({ course: row[0] });
});

/**
 * GET /public/categories
 */
publicRoutes.get('/categories', async (c) => {
  const rows = await db.select().from(categories).orderBy(categories.orderIndex);
  return c.json({ categories: rows });
});

/**
 * GET /public/certificates/:code — verificação pública de certificado
 */
publicRoutes.get('/certificates/:code', async (c) => {
  const code = c.req.param('code');
  const row = await db.select().from(certificates).where(eq(certificates.code, code)).limit(1);
  const cert = row[0];
  if (!cert || cert.status === 'generating') {
    return c.json({ error: 'NotFound', message: 'Certificado não encontrado' }, 404);
  }
  // Incrementa contador de verificação (fire-and-forget)
  db.update(certificates)
    .set({ verificationCount: sql`${certificates.verificationCount} + 1` })
    .where(eq(certificates.id, cert.id))
    .execute()
    .catch(() => null);

  return c.json({
    certificate: {
      code: cert.code,
      userName: cert.userNameSnapshot,
      courseTitle: cert.courseTitleSnapshot,
      workloadHours: cert.workloadHoursSnapshot,
      instructorName: cert.instructorNameSnapshot,
      issuedAt: cert.issuedAt,
      status: cert.status,
      pdfUrl: cert.status === 'issued' ? cert.pdfUrl : null,
    },
  });
});
