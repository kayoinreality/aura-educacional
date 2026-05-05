import Link from 'next/link';
import { Logo } from '@aura/ui';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata = { title: 'Criar conta — Aura Educacional' };

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-12 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-paper p-8 shadow-card">
          <AuthForm mode="register" />
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          Ao criar conta, você concorda com os{' '}
          <Link href="/termos" className="underline hover:text-navy-700">
            Termos de uso
          </Link>{' '}
          e a{' '}
          <Link href="/privacidade" className="underline hover:text-navy-700">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
