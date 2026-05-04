'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { Container, Section, Badge, Button } from '@aura/ui';

const SAMPLE_COURSES = [
  {
    slug: 'gestao-projetos-educacionais',
    title: 'Gestão de Projetos Educacionais',
    instructor: 'Prof. Helena Costa',
    hours: 40,
    category: 'Gestão',
    level: 'Intermediário',
    isPremium: true,
  },
  {
    slug: 'metodologias-ativas',
    title: 'Metodologias Ativas em Sala de Aula',
    instructor: 'Prof. Ricardo Mendes',
    hours: 30,
    category: 'Educação',
    level: 'Básico',
    isPremium: false,
  },
  {
    slug: 'ia-generativa-educacao',
    title: 'IA Generativa na Educação',
    instructor: 'Prof. Camila Souza',
    hours: 25,
    category: 'Tecnologia',
    level: 'Intermediário',
    isPremium: true,
  },
  {
    slug: 'avaliacao-aprendizagem',
    title: 'Avaliação da Aprendizagem',
    instructor: 'Prof. André Lima',
    hours: 20,
    category: 'Educação',
    level: 'Básico',
    isPremium: false,
  },
  {
    slug: 'lideranca-educacional',
    title: 'Liderança Educacional',
    instructor: 'Prof. Patrícia Vieira',
    hours: 35,
    category: 'Gestão',
    level: 'Avançado',
    isPremium: true,
  },
  {
    slug: 'educacao-inclusiva',
    title: 'Educação Inclusiva e Acessibilidade',
    instructor: 'Prof. Beatriz Rocha',
    hours: 28,
    category: 'Educação',
    level: 'Intermediário',
    isPremium: false,
  },
];

export function CoursesPreviewSection() {
  return (
    <Section variant="paper" spacing="lg" id="cursos">
      <Container size="wide">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Catálogo
            </span>
            <h2 className="font-display text-display-xl font-medium text-navy-900">
              Cursos lecionados por especialistas.
            </h2>
          </div>
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-gold-600"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_COURSES.map((course, idx) => (
            <motion.article
              key={course.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
              className="group overflow-hidden rounded-xl border border-border bg-paper transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
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
                    <span>{course.category}</span>
                    <span>•</span>
                    <span>{course.level}</span>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-medium leading-snug text-navy-900 transition-colors group-hover:text-navy-500">
                    {course.title}
                  </h3>
                  <p className="mb-4 text-sm text-ink-600">{course.instructor}</p>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-ink-500">
                      <Clock className="h-3.5 w-3.5" />
                      {course.hours}h
                    </div>
                    <span className="text-xs font-medium text-gold-600">Acesse com Pro</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/cursos">
            <Button variant="outline" size="lg">
              Explorar todos os cursos
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
