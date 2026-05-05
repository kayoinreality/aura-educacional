import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section } from '@aura/ui';

export const metadata = { title: 'Sobre — Aura Educacional' };

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section variant="ivory" spacing="md">
          <Container size="narrow">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Sobre
            </span>
            <h1 className="font-display text-display-xl font-medium text-navy-900">
              Educação continuada que cabe na sua rotina.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-700">
              A Aura Educacional nasceu para oferecer cursos livres com qualidade
              institucional, certificados verificáveis e um modelo de assinatura que
              democratiza acesso ao conhecimento profissional.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-700">
              Acreditamos que aprendizado de verdade não cabe num único formato. Por isso
              combinamos vídeo de alta qualidade, materiais práticos, avaliações que medem
              entendimento real e certificados que abrem portas — tudo em uma plataforma
              feita por quem entende de educação.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
