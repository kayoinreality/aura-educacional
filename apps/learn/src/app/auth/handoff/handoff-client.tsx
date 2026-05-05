'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@aura/ui';
import { useFirebaseAuth } from '@aura/auth/hooks';

/**
 * Handoff: chamado depois do Stripe Checkout com sucesso.
 * O usuário já está logado no Firebase (sessão persistida), então:
 *  1. Aguardamos o auth state
 *  2. Sincronizamos com a API (cria/atualiza row em users + course_access via webhook)
 *  3. Redirecionamos para o curso (se foi compra avulsa) ou home
 */
export function HandoffClient() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useFirebaseAuth();
  const [status, setStatus] = useState<'syncing' | 'redirecting' | 'error'>('syncing');

  const courseSlug = params.get('course');

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.user || !auth.idToken) {
      // Não logado — manda para a tela de login
      router.replace('/login');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    fetch(`${apiUrl}/auth/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.idToken}` },
    })
      .then(() => {
        setStatus('redirecting');
        const target = courseSlug ? `/cursos/${encodeURIComponent(courseSlug)}` : '/';
        router.replace(target);
      })
      .catch(() => setStatus('error'));
  }, [auth, courseSlug, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-700" />
        <p className="text-sm text-ink-600">
          {status === 'error'
            ? 'Algo deu errado. Tente recarregar.'
            : status === 'redirecting'
              ? 'Tudo pronto, redirecionando…'
              : 'Conectando sua conta…'}
        </p>
      </div>
    </div>
  );
}
