'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Container } from '@aura/ui';

export function CtaSection() {
  return (
    <section className="bg-navy-700 py-16 md:py-24">
      <Container size="wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mx-auto mb-6 max-w-3xl font-display text-display-xl font-medium text-paper">
            Comece sua próxima certificação <span className="italic text-gold-400">hoje.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-navy-200">
            7 dias grátis. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/precos">
              <Button variant="gold" size="xl">
                Assinar com 7 dias grátis
              </Button>
            </Link>
            <Link href="/cursos">
              <Button
                variant="ghost"
                size="xl"
                className="text-paper hover:bg-navy-600 hover:text-paper"
              >
                Ver catálogo
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
