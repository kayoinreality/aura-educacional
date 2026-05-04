'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, QrCode, Hash, Clock } from 'lucide-react';
import { Container, Section } from '@aura/ui';

const FEATURES = [
  {
    icon: Hash,
    title: 'Código único',
    desc: 'Cada certificado tem código verificável (ex: AURA-2026-A8B2C4D9)',
  },
  {
    icon: QrCode,
    title: 'QR code anti-fraude',
    desc: 'Aponta para a página pública de verificação da Aura',
  },
  {
    icon: Clock,
    title: 'Carga horária declarada',
    desc: 'Aceito como horas complementares e formação continuada',
  },
  {
    icon: ShieldCheck,
    title: 'Snapshot imutável',
    desc: 'Certificado nunca muda mesmo se o curso for editado depois',
  },
];

export function AboutCertificateSection() {
  return (
    <Section variant="navy" spacing="lg" id="certificado">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Certificado
            </span>
            <h2 className="mb-6 font-display text-display-xl font-medium text-paper">
              Um certificado que pode <span className="italic text-gold-400">orgulhar</span> seu
              currículo.
            </h2>
            <p className="mb-8 text-base text-navy-200">
              Cursos livres conforme LDB 9.394/96 art. 42. Reconhecidos por instituições e
              conselhos profissionais como horas complementares e formação continuada.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feat, idx) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="rounded-lg border border-navy-600 bg-navy-700/50 p-4"
                >
                  <feat.icon className="mb-3 h-5 w-5 text-gold-400" />
                  <h3 className="mb-1 font-medium text-paper">{feat.title}</h3>
                  <p className="text-xs text-navy-200">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-xl border-4 border-double border-gold-400 bg-paper p-8 shadow-card-hover">
              <div className="text-center">
                <div className="mb-2 text-[0.6rem] font-semibold tracking-[0.4em] text-gold-600">
                  CERTIFICADO DE CONCLUSÃO
                </div>
                <div className="mb-1 mt-6 font-display text-xs uppercase tracking-widest text-ink-500">
                  Certificamos que
                </div>
                <div className="mb-2 font-display text-3xl font-medium text-navy-900">
                  Maria Silva Pereira
                </div>
                <div className="mb-2 text-xs text-ink-500">
                  CPF 123.456.789-00 — concluiu com aproveitamento o curso
                </div>
                <div className="mb-6 font-display text-xl italic text-navy-700">
                  Gestão de Projetos Educacionais
                </div>
                <div className="my-6 mx-auto h-px w-16 bg-gold-500" />
                <div className="grid grid-cols-3 gap-2 text-[0.65rem] text-ink-500">
                  <div>
                    <div className="font-mono text-navy-700">40h</div>
                    <div className="uppercase tracking-widest">Carga horária</div>
                  </div>
                  <div>
                    <div className="font-mono text-navy-700">12 / 04 / 2026</div>
                    <div className="uppercase tracking-widest">Emitido em</div>
                  </div>
                  <div>
                    <div className="font-mono text-navy-700">95%</div>
                    <div className="uppercase tracking-widest">Aproveitamento</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="6" height="6" stroke="#0F1E47" strokeWidth="1.5" />
                    <rect x="15" y="3" width="6" height="6" stroke="#0F1E47" strokeWidth="1.5" />
                    <rect x="3" y="15" width="6" height="6" stroke="#0F1E47" strokeWidth="1.5" />
                    <rect x="13" y="13" width="2" height="2" fill="#0F1E47" />
                    <rect x="17" y="13" width="2" height="2" fill="#0F1E47" />
                    <rect x="15" y="17" width="2" height="2" fill="#0F1E47" />
                    <rect x="19" y="17" width="2" height="2" fill="#0F1E47" />
                  </svg>
                  <div className="text-left">
                    <div className="font-mono text-[0.7rem] text-navy-700">AURA-2026-A8B2C4D9</div>
                    <div className="text-[0.55rem] uppercase tracking-wider text-ink-400">
                      Verifique em auraeducacional.com.br
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
