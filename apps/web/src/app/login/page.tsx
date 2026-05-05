import Link from 'next/link';
import { Logo } from '@aura/ui';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata = { title: 'Entrar — Aura Educacional' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-12 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-paper p-8 shadow-card">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
