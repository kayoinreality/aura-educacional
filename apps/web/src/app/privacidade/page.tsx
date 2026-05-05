import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section } from '@aura/ui';

export const metadata = { title: 'Política de privacidade — Aura Educacional' };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section variant="ivory" spacing="md">
          <Container size="narrow">
            <h1 className="mb-3 font-display text-display-lg font-medium text-navy-900">
              Política de Privacidade
            </h1>
            <p className="text-sm text-ink-500">Em conformidade com a LGPD (Lei 13.709/18)</p>
          </Container>
        </Section>
        <Section variant="paper" spacing="md">
          <Container size="narrow" className="prose prose-navy max-w-none text-ink-700">
            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              Dados coletados
            </h2>
            <ul className="space-y-2">
              <li>Email, nome e foto (de Google ou cadastro próprio)</li>
              <li>CPF e data de nascimento (opcional, para nominalização do certificado)</li>
              <li>Endereço IP e user-agent (auditoria de login)</li>
              <li>Dados de pagamento processados via Stripe (não armazenamos cartões)</li>
              <li>Progresso de estudo e desempenho em avaliações</li>
            </ul>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              Finalidade
            </h2>
            <p>
              Os dados são usados exclusivamente para: prestar o serviço, emitir certificados,
              processar pagamentos, atender suporte, prevenir fraudes e cumprir obrigações
              legais.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              Seus direitos (LGPD)
            </h2>
            <ul className="space-y-2">
              <li>
                <strong>Acesso e portabilidade:</strong> exporte todos os seus dados em{' '}
                <em>/conta/dados</em> (formato JSON).
              </li>
              <li>
                <strong>Correção:</strong> edite seu perfil em <em>/conta/perfil</em>.
              </li>
              <li>
                <strong>Exclusão:</strong> solicite em <em>/conta/excluir</em>. Após 30 dias
                de carência (para reverter exclusão acidental), os dados são purgados, com
                exceção de obrigações fiscais e certificados emitidos (preservados conforme
                interesse legítimo de verificação pública).
              </li>
              <li>
                <strong>Revogação de consentimento:</strong> opt-out de marketing emails.
              </li>
            </ul>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              Compartilhamento
            </h2>
            <p>
              Compartilhamos dados apenas com operadores essenciais ao serviço: Stripe
              (pagamentos), Mux (vídeo), Resend (email), Google Cloud (hospedagem). Todos
              com cláusulas LGPD.
            </p>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              Retenção
            </h2>
            <ul className="space-y-2">
              <li>Pagamentos: 5 anos (obrigação fiscal)</li>
              <li>Certificados: indefinido (interesse legítimo de verificação pública)</li>
              <li>Logs de login: 12 meses</li>
              <li>Conta excluída: purga total após 30 dias</li>
            </ul>

            <h2 className="mb-3 mt-8 font-display text-2xl font-medium text-navy-900">
              Encarregado de dados (DPO)
            </h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas, contate o DPO:{' '}
              <a href="mailto:lgpd@auraeducacional.com.br">lgpd@auraeducacional.com.br</a>.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
