'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Container, Section } from '@aura/ui';

const TESTIMONIALS = [
  {
    name: 'Carla Mendes',
    role: 'Coordenadora pedagógica, SP',
    quote:
      'Os cursos da Aura me deram embasamento real para reformular o currículo da escola. O certificado foi aceito como horas para minha progressão funcional.',
  },
  {
    name: 'Rafael Costa',
    role: 'Professor de Ensino Médio, MG',
    quote:
      'A plataforma é incrível. Consigo estudar entre uma aula e outra, com qualidade de vídeo excelente. Já completei 5 cursos.',
  },
  {
    name: 'Juliana Pereira',
    role: 'Diretora de RH, RJ',
    quote:
      'Comprei a assinatura para minha equipe. O retorno em desenvolvimento profissional foi imediato. Recomendo.',
  },
];

export function TestimonialsSection() {
  return (
    <Section variant="ivory" spacing="lg" id="depoimentos">
      <Container size="wide">
        <div className="mb-10 max-w-2xl">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Depoimentos
          </span>
          <h2 className="font-display text-display-xl font-medium text-navy-900">
            Quem usa a Aura, recomenda.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-xl border border-border bg-paper p-7 shadow-soft"
            >
              <Quote className="mb-4 h-7 w-7 text-gold-400" />
              <blockquote className="mb-6 text-base leading-relaxed text-ink-700">
                {t.quote}
              </blockquote>
              <figcaption className="border-t border-border pt-4">
                <div className="font-medium text-navy-900">{t.name}</div>
                <div className="text-xs text-ink-500">{t.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
