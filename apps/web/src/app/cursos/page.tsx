import Link from 'next/link';
import { Clock, BookOpen } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section, Badge } from '@aura/ui';
import { listCourses, listCategories } from '@/lib/api';

export const metadata = { title: 'Catálogo de cursos — Aura Educacional' };
export const revalidate = 120;

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [courses, categories] = await Promise.all([
    listCourses({ category: params.category, q: params.q }),
    listCategories(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <Section variant="ivory" spacing="md">
          <Container size="wide">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Catálogo
            </span>
            <h1 className="font-display text-display-xl font-medium text-navy-900">
              Encontre seu próximo curso.
            </h1>
            <p className="mt-3 max-w-2xl text-ink-600">
              Catálogo curado por especialistas. Filtre por área e nível.
            </p>
          </Container>
        </Section>

        <Section variant="paper" spacing="md">
          <Container size="wide">
            {/* Filtros por categoria */}
            <nav className="mb-8 flex flex-wrap gap-2">
              <Link
                href="/cursos"
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  !params.category
                    ? 'border-navy-700 bg-navy-700 text-paper'
                    : 'border-border bg-paper text-ink-700 hover:border-navy-500'
                }`}
              >
                Todas
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/cursos?category=${cat.slug}`}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    params.category === cat.slug
                      ? 'border-navy-700 bg-navy-700 text-paper'
                      : 'border-border bg-paper text-ink-700 hover:border-navy-500'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {courses.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

function CourseCard({
  course,
}: {
  course: Awaited<ReturnType<typeof listCourses>>[number];
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-paper transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/cursos/${course.slug}`}>
        <div className="relative h-44 overflow-hidden bg-navy-gradient">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <BookOpen className="h-16 w-16 text-paper" />
          </div>
          {course.isPremium && (
            <Badge variant="gold" className="absolute right-3 top-3">
              Premium
            </Badge>
          )}
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs text-ink-500">
            {course.category && <span>{course.category.name}</span>}
            {course.category && <span>•</span>}
            <span className="capitalize">
              {course.level === 'basic'
                ? 'Básico'
                : course.level === 'intermediate'
                  ? 'Intermediário'
                  : 'Avançado'}
            </span>
          </div>
          <h3 className="mb-2 font-display text-lg font-medium leading-snug text-navy-900 transition-colors group-hover:text-navy-500">
            {course.title}
          </h3>
          {course.subtitle && (
            <p className="mb-4 line-clamp-2 text-sm text-ink-600">{course.subtitle}</p>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-500">
              <Clock className="h-3.5 w-3.5" />
              {course.workloadHours}h
            </div>
            <span className="text-xs font-medium text-gold-600">Acesse com Pro</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-ivory p-16 text-center">
      <BookOpen className="mx-auto mb-4 h-10 w-10 text-ink-400" />
      <p className="font-display text-xl text-navy-900">Nenhum curso encontrado</p>
      <p className="mt-2 text-sm text-ink-500">
        Estamos preparando o catálogo. Novos cursos chegando em breve.
      </p>
    </div>
  );
}
