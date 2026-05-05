import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section } from '@aura/ui';

export const metadata = { title: 'Termos de uso — Aura Educacional' };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section variant="ivory" spacing="md">
          <Container size="narrow">
            <h1 className="mb-3 font-display text-display-lg font-medium text-navy-900">
              Termos de uso
            </h1>
            <p className="text-sm text-ink-500">Última atualização: maio de 2026</p>
          </Container>
        </Section>
        <Section variant="paper" spacing="md">
          <Container size="narrow" className="prose prose-navy max-w-none text-ink-700">
            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              1. Aceitação dos termos
            </h2>
            <p>
              Ao acessar ou usar a plataforma Aura Educacional, você concorda com estes Termos
              de Uso. Caso não concorde, não utilize nossos serviços.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              2. Natureza dos cursos
            </h2>
            <p>
              Todos os cursos oferecidos são <strong>cursos livres</strong>, conforme Lei
              9.394/96 (LDB) art. 42. <strong>Não possuem reconhecimento do MEC</strong> (que
              se aplica a graduação e pós-graduação), mas são amplamente aceitos como horas
              complementares e formação continuada, conforme regulamento de cada conselho ou
              instituição.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              3. Assinatura e cobrança
            </h2>
            <p>
              A assinatura Pro é cobrada mensal ou anualmente via Stripe, com renovação
              automática. Você pode cancelar a qualquer momento pelo Portal do Cliente. O
              acesso continua até o fim do período pago.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              4. Compras avulsas
            </h2>
            <p>
              Cursos comprados individualmente concedem acesso vitalício ao conteúdo, mesmo
              após cancelamento de assinatura.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              5. Reembolso
            </h2>
            <p>
              Conforme art. 49 do CDC, você tem direito a 7 (sete) dias corridos para
              solicitar reembolso integral, contados da data da compra. A solicitação pode
              ser feita pelo Portal do Cliente ou via contato@auraeducacional.com.br.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              6. Certificados
            </h2>
            <p>
              Os certificados emitidos são declaratórios e contêm: nome do aluno, título do
              curso, carga horária, data de emissão e código único de verificação. Possuem
              QR code que aponta para a página pública de verificação. Permanecem disponíveis
              indefinidamente, exceto em caso de fraude comprovada (revogação registrada).
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              7. Conduta do usuário
            </h2>
            <p>
              É proibido compartilhar credenciais, baixar conteúdo para redistribuição,
              copiar materiais com fins comerciais ou tentar burlar mecanismos de
              autenticação. A violação pode resultar em suspensão imediata sem reembolso.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              8. Propriedade intelectual
            </h2>
            <p>
              Todos os conteúdos (vídeos, textos, materiais) são de propriedade da Aura
              Educacional ou licenciados. O acesso concede uso pessoal e intransferível.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              9. Alterações
            </h2>
            <p>
              Estes termos podem ser atualizados a qualquer momento. Mudanças relevantes
              serão notificadas por email com 30 dias de antecedência.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              10. Foro
            </h2>
            <p>
              Fica eleito o foro da comarca da sede da Aura Educacional para dirimir
              controvérsias decorrentes deste instrumento.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
