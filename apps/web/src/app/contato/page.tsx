import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section } from '@aura/ui';
import { Mail, MessageCircle } from 'lucide-react';

export const metadata = { title: 'Contato — Aura Educacional' };

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section variant="ivory" spacing="md">
          <Container size="narrow">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Contato
            </span>
            <h1 className="mb-4 font-display text-display-xl font-medium text-navy-900">
              Estamos por aqui para ajudar.
            </h1>
            <p className="mb-10 text-ink-600">
              Suporte ao aluno, parcerias institucionais e dúvidas comerciais.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="mailto:contato@auraeducacional.com.br"
                className="rounded-xl border border-border bg-paper p-6 transition-shadow hover:shadow-card"
              >
                <Mail className="mb-3 h-6 w-6 text-gold-600" />
                <div className="font-display text-lg font-medium text-navy-900">
                  Suporte ao aluno
                </div>
                <div className="mt-1 text-sm text-ink-600">contato@auraeducacional.com.br</div>
              </a>
              <a
                href="mailto:parcerias@auraeducacional.com.br"
                className="rounded-xl border border-border bg-paper p-6 transition-shadow hover:shadow-card"
              >
                <MessageCircle className="mb-3 h-6 w-6 text-gold-600" />
                <div className="font-display text-lg font-medium text-navy-900">
                  Parcerias e B2B
                </div>
                <div className="mt-1 text-sm text-ink-600">parcerias@auraeducacional.com.br</div>
              </a>
            </div>
            <p className="mt-10 text-xs text-ink-500">
              Encarregado de dados (LGPD): lgpd@auraeducacional.com.br
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
