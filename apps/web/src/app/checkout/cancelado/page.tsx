import Link from 'next/link';
import { Logo, Button } from '@aura/ui';

export const metadata = { title: 'Pagamento cancelado — Aura Educacional' };

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-12 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-paper p-10 shadow-card">
          <h1 className="mb-3 font-display text-3xl font-medium text-navy-900">
            Pagamento cancelado
          </h1>
          <p className="mb-8 text-ink-600">
            Nada foi cobrado. Você pode tentar novamente quando quiser.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/precos">
              <Button variant="primary" size="lg" block>
                Voltar para os planos
              </Button>
            </Link>
            <Link href="/cursos">
              <Button variant="outline" size="lg" block>
                Explorar catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
