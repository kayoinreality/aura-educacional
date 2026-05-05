'use client';

import { useEffect } from 'react';
import { Logo } from '@aura/ui';

/**
 * O fluxo principal de login acontece em apps/web (auraeducacional.com.br/login).
 * Esta página apenas redireciona para lá com return_to apontando de volta.
 */
export function LoginRedirect() {
  useEffect(() => {
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'https://auraeducacional.com.br';
    window.location.href = `${webUrl}/login`;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="text-sm text-ink-600">Redirecionando para o login…</p>
      </div>
    </div>
  );
}
