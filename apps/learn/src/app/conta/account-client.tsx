'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ExternalLink, User, CreditCard } from 'lucide-react';
import { Logo, Container, Section, Card, CardContent, Button } from '@aura/ui';
import { useFirebaseAuth } from '@aura/auth/hooks';
import { logout } from '@aura/auth/client';

export function AccountClient() {
  const auth = useFirebaseAuth();
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function openCustomerPortal() {
    if (!auth.idToken) return;
    setLoadingPortal(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/checkout/portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.idToken}` },
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPortal(false);
    }
  }

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy-200 border-t-navy-700" />
      </div>
    );
  }

  if (!auth.user) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-6 text-sm">
            <a href="/" className="text-ink-600 hover:text-navy-700">
              Meus cursos
            </a>
            <a href="/certificados" className="text-ink-600 hover:text-navy-700">
              Certificados
            </a>
            <a href="/conta" className="font-medium text-navy-700">
              Conta
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Section variant="ivory" spacing="md">
          <Container size="default">
            <h1 className="mb-2 font-display text-display-lg font-medium text-navy-900">
              Minha conta
            </h1>
            <p className="text-ink-600">Gerencie seu perfil e assinatura.</p>
          </Container>
        </Section>

        <Section variant="paper" spacing="md">
          <Container size="default" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100 text-navy-700">
                    <User className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-medium text-navy-900">Perfil</h2>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">Nome</dt>
                    <dd className="mt-1 text-ink-900">{auth.user.displayName ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">Email</dt>
                    <dd className="mt-1 text-ink-900">{auth.user.email}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-medium text-navy-900">Assinatura</h2>
                </div>
                <p className="mb-4 text-sm text-ink-600">
                  Acesse o Portal do Cliente para gerenciar pagamento, baixar recibos ou
                  cancelar a assinatura.
                </p>
                <Button
                  variant="outline"
                  onClick={openCustomerPortal}
                  disabled={loadingPortal}
                >
                  <ExternalLink className="h-4 w-4" />
                  {loadingPortal ? 'Abrindo…' : 'Abrir Portal do Cliente'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h2 className="font-display text-base font-medium text-navy-900">Sair</h2>
                  <p className="text-xs text-ink-500">Encerre sua sessão neste dispositivo.</p>
                </div>
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </CardContent>
            </Card>
          </Container>
        </Section>
      </main>
    </div>
  );
}
