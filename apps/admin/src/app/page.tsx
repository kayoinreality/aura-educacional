import { Logo, Container, Section } from '@aura/ui';
import { Users, BookOpen, Award, DollarSign } from 'lucide-react';

export default function AdminHomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="ml-2 rounded bg-navy-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-navy-700">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <a href="/" className="font-medium text-navy-700">
              Visão geral
            </a>
            <a href="/cursos" className="text-ink-600 hover:text-navy-700">
              Cursos
            </a>
            <a href="/alunos" className="text-ink-600 hover:text-navy-700">
              Alunos
            </a>
            <a href="/pedidos" className="text-ink-600 hover:text-navy-700">
              Pedidos
            </a>
            <a href="/certificados" className="text-ink-600 hover:text-navy-700">
              Certificados
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Section variant="ivory" spacing="md">
          <Container size="wide">
            <h1 className="mb-2 font-display text-display-lg font-medium text-navy-900">
              Visão geral
            </h1>
            <p className="mb-8 text-ink-600">Indicadores principais da plataforma.</p>
            <div className="grid gap-4 md:grid-cols-4">
              <KpiCard icon={<Users className="h-5 w-5" />} label="Alunos ativos" value="—" />
              <KpiCard icon={<BookOpen className="h-5 w-5" />} label="Cursos publicados" value="—" />
              <KpiCard icon={<Award className="h-5 w-5" />} label="Certificados emitidos" value="—" />
              <KpiCard icon={<DollarSign className="h-5 w-5" />} label="MRR" value="R$ —" />
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-paper p-6 shadow-soft">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-navy-700">
        {icon}
      </div>
      <div className="font-display text-3xl font-medium text-navy-900">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-ink-500">{label}</div>
    </div>
  );
}
