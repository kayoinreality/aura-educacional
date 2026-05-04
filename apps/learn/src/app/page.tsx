import { Logo, Container, Section, Card, CardContent, CardTitle, CardDescription, Button } from '@aura/ui';
import { BookOpen, Award, Clock } from 'lucide-react';

export const metadata = { title: 'Área do aluno — Aura Educacional' };

export default function LearnHomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-6 text-sm">
            <a href="/" className="font-medium text-navy-700">
              Meus cursos
            </a>
            <a href="/certificados" className="text-ink-600 hover:text-navy-700">
              Certificados
            </a>
            <a href="/conta" className="text-ink-600 hover:text-navy-700">
              Conta
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Section variant="ivory" spacing="md">
          <Container size="wide">
            <h1 className="mb-2 font-display text-display-lg font-medium text-navy-900">
              Bem-vindo de volta
            </h1>
            <p className="text-ink-600">Continue de onde parou ou explore novos cursos.</p>
          </Container>
        </Section>

        <Section variant="paper" spacing="md">
          <Container size="wide">
            <h2 className="mb-6 font-display text-2xl font-medium text-navy-900">Em andamento</h2>
            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="mb-1">Você ainda não iniciou nenhum curso</CardTitle>
                  <CardDescription>
                    Explore o catálogo e comece sua próxima certificação.
                  </CardDescription>
                </div>
                <Button variant="gold">Ver catálogo</Button>
              </CardContent>
            </Card>
          </Container>
        </Section>

        <Section variant="ivory" spacing="md">
          <Container size="wide">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard icon={<BookOpen className="h-5 w-5" />} label="Cursos ativos" value="0" />
              <StatCard
                icon={<Clock className="h-5 w-5" />}
                label="Horas estudadas"
                value="0h"
              />
              <StatCard
                icon={<Award className="h-5 w-5" />}
                label="Certificados emitidos"
                value="0"
              />
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-paper p-6">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-gold-700">
        {icon}
      </div>
      <div className="font-display text-3xl font-medium text-navy-900">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-ink-500">{label}</div>
    </div>
  );
}
