import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CoursesPreviewSection } from '@/components/sections/courses-preview';
import { Container, Section } from '@aura/ui';

export const metadata = { title: 'Catálogo de cursos — Aura Educacional' };

export default function CoursesPage() {
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
              Catálogo curado por especialistas. Filtre por área, nível ou carga horária.
            </p>
          </Container>
        </Section>
        <CoursesPreviewSection />
      </main>
      <SiteFooter />
    </>
  );
}
