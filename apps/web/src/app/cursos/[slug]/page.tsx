import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, BookOpen, Award, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section, Badge, Button, Card, CardContent } from '@aura/ui';
import { getCourseBySlug } from '@/lib/api';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: 'Curso não encontrado' };
  return {
    title: `${course.title} — Aura Educacional`,
    description: course.subtitle ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const levelLabel =
    course.level === 'basic'
      ? 'Básico'
      : course.level === 'intermediate'
        ? 'Intermediário'
        : 'Avançado';

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero do curso */}
        <Section variant="navy" spacing="md">
          <Container size="wide">
            <div className="grid items-start gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Link
                  href="/cursos"
                  className="mb-6 inline-flex items-center gap-2 text-sm text-navy-200 hover:text-gold-400"
                >
                  ← Voltar ao catálogo
                </Link>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {course.category && <Badge variant="navy">{course.category.name}</Badge>}
                  <Badge variant="outline" className="border-navy-500 text-navy-200">
                    {levelLabel}
                  </Badge>
                  {course.isPremium && <Badge variant="gold">Premium</Badge>}
                </div>
                <h1 className="mb-4 font-display text-display-xl font-medium text-paper">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="text-lg text-navy-200">{course.subtitle}</p>
                )}
                {course.instructor?.name && (
                  <div className="mt-6 flex items-center gap-3 text-sm text-navy-200">
                    <span className="text-navy-300">Instrutor:</span>
                    <span className="font-medium text-paper">{course.instructor.name}</span>
                  </div>
                )}
              </div>

              {/* Card de compra */}
              <Card className="bg-paper">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gold-600" />
                    <span className="text-ink-700">{course.workloadHours} horas de conteúdo</span>
                  </div>
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-gold-600" />
                    <span className="text-ink-700">Certificado incluso</span>
                  </div>
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-gold-600" />
                    <span className="text-ink-700">Acesso vitalício</span>
                  </div>

                  <div className="my-6 border-t border-border pt-6">
                    {course.priceCents !== null && (
                      <div className="mb-4">
                        <span className="text-sm text-ink-500">Curso avulso</span>
                        <div className="font-display text-3xl font-medium text-navy-900">
                          R$ {(course.priceCents / 100).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    )}
                    <Button variant="gold" size="lg" block>
                      Comprar este curso
                    </Button>
                    <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-400">
                      <span className="h-px flex-1 bg-border" />
                      ou
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <Link href="/precos">
                      <Button variant="outline" size="lg" block>
                        Acessar com assinatura
                      </Button>
                    </Link>
                    <p className="mt-3 text-center text-xs text-ink-500">
                      A partir de R$ 41,58/mês no plano anual
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>

        <Section variant="paper" spacing="md">
          <Container size="wide">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-4 font-display text-2xl font-medium text-navy-900">
                  Sobre o curso
                </h2>
                <div className="prose prose-navy max-w-none text-ink-700">
                  {course.description ? (
                    <p className="whitespace-pre-line leading-relaxed">{course.description}</p>
                  ) : (
                    <p className="text-ink-500">
                      Conteúdo em desenvolvimento. Volte em breve para a descrição completa.
                    </p>
                  )}
                </div>

                <h2 className="mb-4 mt-12 font-display text-2xl font-medium text-navy-900">
                  O que você vai aprender
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Fundamentos sólidos da área',
                    'Aplicação prática em casos reais',
                    'Ferramentas modernas do mercado',
                    'Metodologia passo a passo',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-700">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <h2 className="mb-4 mt-12 font-display text-2xl font-medium text-navy-900">
                  Currículo
                </h2>
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-ink-400" />
                    <p className="text-sm text-ink-600">
                      Estrutura de módulos e aulas será exibida aqui após publicação.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-display text-lg font-medium text-navy-900">
                      Sobre o certificado
                    </h3>
                    <p className="text-sm text-ink-600">
                      Curso livre conforme LDB 9.394/96 art. 42. Certificado com código único e
                      QR code de verificação pública.
                    </p>
                    <Link
                      href="/certificados"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-gold-600"
                    >
                      Verificar autenticidade <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
