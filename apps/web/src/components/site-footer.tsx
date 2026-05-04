import Link from 'next/link';
import { Logo, Container } from '@aura/ui';

const COL_PROD = [
  { href: '/cursos', label: 'Catálogo' },
  { href: '/precos', label: 'Planos' },
  { href: '/certificados', label: 'Verificar certificado' },
];
const COL_INST = [
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
  { href: '/parcerias', label: 'Parcerias' },
];
const COL_LEGAL = [
  { href: '/termos', label: 'Termos de uso' },
  { href: '/privacidade', label: 'Política de privacidade' },
  { href: '/lgpd', label: 'LGPD' },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-800 text-navy-100">
      <Container size="wide" className="py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Logo monochrome="ivory" />
            <p className="max-w-xs text-sm text-navy-200">
              Educação continuada que vale carga horária. Cursos livres com certificados
              verificáveis e suporte para sua jornada de aprendizado.
            </p>
          </div>
          <FooterColumn title="Plataforma" items={COL_PROD} />
          <FooterColumn title="Institucional" items={COL_INST} />
          <FooterColumn title="Legal" items={COL_LEGAL} />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-navy-700 pt-6 text-xs text-navy-300 md:flex-row md:items-center">
          <p>© {year} Aura Educacional. Todos os direitos reservados.</p>
          <p>
            Cursos livres conforme LDB 9.394/96 art. 42 — sem reconhecimento MEC, válidos como
            horas complementares.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-base font-medium text-paper">{title}</h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="text-sm text-navy-200 transition-colors hover:text-gold-300"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
