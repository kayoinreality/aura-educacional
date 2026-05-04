'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Container, Section, Button, Badge } from '@aura/ui';

const FEATURES = [
  'Acesso completo ao catálogo',
  'Certificados ilimitados',
  'Novos cursos a cada mês',
  'Atualizações de conteúdo gratuitas',
  'Acesso pelo navegador e celular',
  'Suporte prioritário em até 24h',
];

export function PricingSection() {
  const [interval, setInterval] = useState<'month' | 'year'>('year');

  const monthly = 49.9;
  const yearly = 499.0;
  const yearlyAsMonthly = yearly / 12;
  const savings = Math.round((1 - yearlyAsMonthly / monthly) * 100);

  return (
    <Section variant="ivory" spacing="lg" id="precos">
      <Container size="wide">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Planos
          </span>
          <h2 className="mb-4 font-display text-display-xl font-medium text-navy-900">
            Acesso total ou curso individual.
            <br />
            Você escolhe.
          </h2>
          <p className="text-ink-600">
            Assine para acessar todo o catálogo ou compre cursos avulsos. Cancele quando quiser.
          </p>
        </div>

        {/* toggle mensal/anual */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-paper p-1 text-sm">
            <button
              type="button"
              onClick={() => setInterval('month')}
              className={`rounded-full px-5 py-2 font-medium transition-all ${
                interval === 'month' ? 'bg-navy-700 text-paper shadow-soft' : 'text-ink-600'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setInterval('year')}
              className={`rounded-full px-5 py-2 font-medium transition-all ${
                interval === 'year' ? 'bg-navy-700 text-paper shadow-soft' : 'text-ink-600'
              }`}
            >
              Anual
              <span className="ml-2 inline-block rounded-full bg-gold-500 px-2 py-0.5 text-[0.6rem] font-bold text-navy-900">
                -{savings}%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Plano Pro (destaque) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl border-2 border-gold-400 bg-paper p-8 shadow-card-hover lg:col-span-2"
          >
            <Badge variant="gold" className="absolute -top-3 left-8">
              Mais escolhido
            </Badge>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-1 font-display text-2xl font-medium text-navy-900">
                  Assinatura Pro
                </h3>
                <p className="mb-6 text-sm text-ink-600">
                  Acesse todo o catálogo, novos cursos mensais e certificados ilimitados.
                </p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-medium text-navy-900">
                      R$ {(interval === 'month' ? monthly : yearlyAsMonthly).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-ink-500">/mês</span>
                  </div>
                  {interval === 'year' && (
                    <p className="mt-1 text-xs text-ink-500">
                      Cobrado R$ {yearly.toFixed(2).replace('.', ',')} por ano
                    </p>
                  )}
                </div>
                <Button variant="gold" size="lg" block>
                  Começar 7 dias grátis
                </Button>
                <p className="mt-3 text-center text-xs text-ink-500">
                  Sem fidelidade. Cancele quando quiser.
                </p>
              </div>
              <ul className="space-y-3 border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                {FEATURES.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Curso avulso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-paper p-8"
          >
            <h3 className="mb-1 font-display text-2xl font-medium text-navy-900">
              Curso individual
            </h3>
            <p className="mb-6 text-sm text-ink-600">
              Comprou, é seu para sempre. Sem mensalidade.
            </p>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-ink-500">a partir de</span>
                <span className="font-display text-4xl font-medium text-navy-900">R$ 97</span>
              </div>
              <p className="mt-1 text-xs text-ink-500">Acesso vitalício + certificado</p>
            </div>
            <Button variant="outline" size="lg" block>
              Ver catálogo
            </Button>
            <ul className="mt-6 space-y-3 text-sm text-ink-700">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" />
                <span>Acesso vitalício ao curso</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" />
                <span>Certificado incluso</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" />
                <span>Atualizações futuras</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
