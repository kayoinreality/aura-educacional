'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Clock, ShieldCheck } from 'lucide-react';
import { Button, Container, Badge } from '@aura/ui';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ivory pt-12 pb-20 md:pt-20 md:pb-28">
      {/* fundo decorativo sutil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, #0F1E47 0%, transparent 40%), radial-gradient(circle at 80% 60%, #C9A961 0%, transparent 35%)',
        }}
      />
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge variant="gold" className="mb-4">
                Educação continuada
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-display-2xl font-medium text-navy-900"
            >
              Aprenda no seu ritmo.
              <br />
              <span className="text-navy-700">Conquiste certificados</span>
              <br />
              que <span className="italic text-gold-600">valem horas.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl text-lg text-ink-600"
            >
              Plataforma com cursos livres, instrutores especialistas e certificados
              verificáveis com QR code. Acesse com assinatura ou compre o curso individualmente.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/precos">
                <Button variant="gold" size="xl" className="w-full sm:w-auto">
                  Começar agora
                </Button>
              </Link>
              <Link href="/cursos">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Ver catálogo
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6"
            >
              <Stat icon={<Clock className="h-5 w-5" />} value="500+" label="horas de conteúdo" />
              <Stat icon={<Award className="h-5 w-5" />} value="2k+" label="certificados emitidos" />
              <Stat icon={<ShieldCheck className="h-5 w-5" />} value="100%" label="verificáveis" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <CertificateMockup />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="text-gold-600">{icon}</div>
      <span className="font-display text-2xl font-medium text-navy-900">{value}</span>
      <span className="text-xs uppercase tracking-wider text-ink-500">{label}</span>
    </div>
  );
}

function CertificateMockup() {
  return (
    <div className="relative">
      <div className="rotate-[-2deg] rounded-2xl border border-gold-300 bg-paper p-6 shadow-card-hover">
        <div className="rounded-lg border-2 border-double border-navy-700 p-6 text-center">
          <div className="mb-3 text-[0.6rem] font-semibold tracking-[0.4em] text-gold-600">
            CERTIFICADO DE CONCLUSÃO
          </div>
          <div className="mb-1 font-display text-xs text-ink-500">Certificamos que</div>
          <div className="mb-1 font-display text-2xl font-medium text-navy-900">Maria Silva</div>
          <div className="mb-3 text-xs text-ink-500">concluiu com aproveitamento o curso</div>
          <div className="mb-4 font-display text-lg italic text-navy-700">
            Gestão de Projetos Educacionais
          </div>
          <div className="flex justify-between text-[0.65rem] text-ink-500">
            <span>40 horas</span>
            <span className="font-mono">AURA-2026-A8B2C4D9</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="6" height="6" stroke="#0F1E47" strokeWidth="1.5" />
              <rect x="15" y="3" width="6" height="6" stroke="#0F1E47" strokeWidth="1.5" />
              <rect x="3" y="15" width="6" height="6" stroke="#0F1E47" strokeWidth="1.5" />
              <rect x="13" y="13" width="2" height="2" fill="#0F1E47" />
              <rect x="17" y="13" width="2" height="2" fill="#0F1E47" />
              <rect x="15" y="17" width="2" height="2" fill="#0F1E47" />
              <rect x="19" y="17" width="2" height="2" fill="#0F1E47" />
            </svg>
            <span className="text-[0.55rem] uppercase tracking-wider text-ink-400">
              auraeducacional.com.br
            </span>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="absolute -right-4 -top-4 -z-10 h-full w-full rotate-[3deg] rounded-2xl bg-gold-100"
      />
    </div>
  );
}
