'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@aura/ui';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '@aura/auth/client';

type Mode = 'login' | 'register';

const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/invalid-credential': 'Email ou senha incorretos',
  'auth/user-not-found': 'Usuário não encontrado',
  'auth/wrong-password': 'Senha incorreta',
  'auth/email-already-in-use': 'Este email já está cadastrado',
  'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
  'auth/invalid-email': 'Email inválido',
  'auth/popup-closed-by-user': 'Janela fechada antes de concluir',
  'auth/network-request-failed': 'Falha de rede. Tente novamente.',
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const learnUrl = process.env.NEXT_PUBLIC_LEARN_URL ?? '/';

  function handleError(err: unknown) {
    const code = (err as { code?: string })?.code;
    setError(FIREBASE_ERROR_MAP[code ?? ''] ?? 'Algo deu errado. Tente novamente.');
  }

  async function syncWithApi() {
    const { getFirebaseAuth } = await import('@aura/auth/client');
    const auth = getFirebaseAuth();
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    await fetch(`${apiUrl}/auth/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      await syncWithApi();
      router.push(learnUrl);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      await syncWithApi();
      router.push(learnUrl);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 font-display text-3xl font-medium text-navy-900">
        {mode === 'login' ? 'Entrar' : 'Criar conta'}
      </h1>
      <p className="mb-8 text-sm text-ink-600">
        {mode === 'login'
          ? 'Acesse sua área de estudo e continue de onde parou.'
          : 'Comece com 7 dias grátis. Sem cartão de crédito.'}
      </p>

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading}
        className="mb-4 flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-paper text-sm font-medium text-ink-900 transition-colors hover:bg-navy-50 disabled:opacity-50"
      >
        <GoogleIcon />
        Continuar com Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-400">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-600">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-600">
            Senha
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <div className="rounded-md border border-danger-light bg-danger-light/30 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" block disabled={loading}>
          {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600">
        {mode === 'login' ? (
          <>
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-medium text-navy-700 hover:text-gold-600">
              Cadastre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-navy-700 hover:text-gold-600">
              Entrar
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
