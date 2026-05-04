'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Container, Section } from '@aura/ui';

const FAQS = [
  {
    q: 'O certificado da Aura é reconhecido pelo MEC?',
    a: 'Os cursos são livres, conforme LDB 9.394/96 art. 42. Eles não têm reconhecimento MEC (que se aplica a graduação e pós), mas são amplamente aceitos como horas complementares, formação continuada e progressão funcional em escolas públicas e privadas. Cada conselho ou instituição tem seu próprio regulamento — vale conferir.',
  },
  {
    q: 'Posso cancelar a assinatura quando quiser?',
    a: 'Sim, sem fidelidade. Você cancela direto pelo Portal do Cliente (Stripe). O acesso continua até o fim do período pago. Certificados já emitidos não são afetados.',
  },
  {
    q: 'Quanto tempo leva para receber o certificado?',
    a: 'Após completar o curso e passar na avaliação final, o certificado é gerado automaticamente em até 1 minuto. Você recebe por e-mail e baixa direto na plataforma.',
  },
  {
    q: 'Comprei um curso avulso, perco se cancelar a assinatura?',
    a: 'Não. Cursos comprados individualmente são seus para sempre. A assinatura libera o acesso ao restante do catálogo enquanto está ativa.',
  },
  {
    q: 'Posso reembolsar se não gostar?',
    a: 'Sim. Você tem 7 dias de reembolso garantido por lei (CDC art. 49). Basta solicitar pelo Portal do Cliente ou contato@auraeducacional.com.br.',
  },
  {
    q: 'Os cursos têm prazo para conclusão?',
    a: 'Não. Você estuda no seu ritmo. Enquanto a assinatura estiver ativa (ou enquanto for o dono do curso avulso), você acessa quando quiser.',
  },
  {
    q: 'Posso emitir nota fiscal?',
    a: 'Sim, emitimos NFS-e para todas as compras. Caso seja pessoa jurídica, informe o CNPJ no checkout.',
  },
];

export function FaqSection() {
  return (
    <Section variant="paper" spacing="lg" id="faq">
      <Container size="narrow">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Perguntas frequentes
          </span>
          <h2 className="font-display text-display-xl font-medium text-navy-900">
            Tudo o que você precisa saber.
          </h2>
        </div>
        <div className="divide-y divide-border rounded-xl border border-border bg-ivory">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-5 py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:text-navy-700"
        aria-expanded={open}
      >
        <span className="font-medium text-navy-900">{q}</span>
        <ChevronDown
          className={`mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
