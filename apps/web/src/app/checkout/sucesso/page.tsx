import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Logo, Button } from '@aura/ui';

export const metadata = { title: 'Pagamento confirmado — Aura Educacional' };

export default function CheckoutSuccessPage() {
  const learnUrl = process.env.NEXT_PUBLIC_LEARN_URL ?? '/';
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-12 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-paper p-10 shadow-card">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-success" />
          <h1 className="mb-3 font-display text-3xl font-medium text-navy-900">
            Tudo certo!
          </h1>
          <p className="mb-8 text-ink-600">
            Seu acesso foi liberado. Estamos preparando sua área de estudos.
          </p>
          <Link href={learnUrl}>
            <Button variant="gold" size="lg" block>
              Ir para meus cursos
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-500">
          Você receberá a confirmação em seu email em alguns minutos.
        </p>
      </div>
    </div>
  );
}
