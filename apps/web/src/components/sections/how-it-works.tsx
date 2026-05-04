'use client';

import { motion } from 'framer-motion';
import { UserPlus, Play, ClipboardCheck, Award } from 'lucide-react';
import { Container, Section } from '@aura/ui';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Inscreva-se',
    desc: 'Crie sua conta em segundos com Google ou e-mail. Comece com 7 dias grátis na assinatura.',
  },
  {
    icon: Play,
    title: 'Estude no seu ritmo',
    desc: 'Vídeos em alta qualidade, materiais complementares e progresso salvo automaticamente.',
  },
  {
    icon: ClipboardCheck,
    title: 'Faça a avaliação',
    desc: 'Quiz final para validar seu aprendizado. Você pode tentar quantas vezes precisar.',
  },
  {
    icon: Award,
    title: 'Receba o certificado',
    desc: 'PDF assinado digitalmente, com QR code de verificação pública. Use no LinkedIn.',
  },
];

export function HowItWorksSection() {
  return (
    <Section variant="paper" spacing="lg" id="como-funciona">
      <Container size="wide">
        <div className="mb-12 max-w-2xl">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Como funciona
          </span>
          <h2 className="font-display text-display-xl font-medium text-navy-900">
            Quatro passos do interesse à carteira de certificados.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-xl border border-border bg-ivory p-6 transition-shadow hover:shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-navy-700">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="mb-2 font-mono text-xs text-gold-600">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <h3 className="mb-2 font-display text-xl font-medium text-navy-900">{step.title}</h3>
              <p className="text-sm text-ink-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
