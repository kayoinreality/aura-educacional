'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section, Button, Input } from '@aura/ui';
import { Search } from 'lucide-react';

export default function VerifyCertificatePage() {
  const [code, setCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    window.location.href = `/certificados/${encodeURIComponent(code.trim())}`;
  }

  return (
    <>
      <SiteHeader />
      <main>
        <Section variant="ivory" spacing="lg">
          <Container size="narrow">
            <div className="text-center">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
                Verificação
              </span>
              <h1 className="mb-4 font-display text-display-xl font-medium text-navy-900">
                Verifique a autenticidade
              </h1>
              <p className="mb-10 text-ink-600">
                Digite o código que aparece no certificado (ex: AURA-2026-A8B2C4D9).
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="AURA-2026-XXXXXXXX"
                  className="font-mono"
                  required
                />
                <Button type="submit" variant="primary" size="md" className="sm:px-6">
                  <Search className="mr-1 h-4 w-4" />
                  Verificar
                </Button>
              </form>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
