import Link from 'next/link';
import { Button, Logo } from '@aura/ui';

const NAV = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/precos', label: 'Planos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/certificados', label: 'Verificar certificado' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link href="/" aria-label="Aura Educacional">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-700 transition-colors hover:text-navy-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={process.env.NEXT_PUBLIC_LEARN_URL ?? '/login'}
            className="hidden text-sm font-medium text-ink-700 transition-colors hover:text-navy-700 md:inline"
          >
            Entrar
          </Link>
          <Link href="/precos">
            <Button variant="gold" size="md">
              Assinar
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
