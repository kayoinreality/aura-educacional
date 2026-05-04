import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Container, Section, Badge } from '@aura/ui';
import { CheckCircle2 } from 'lucide-react';
import type { CertificatePublic } from '@aura/types';

async function fetchCertificate(code: string): Promise<CertificatePublic | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
  try {
    const res = await fetch(`${apiUrl}/public/certificates/${encodeURIComponent(code)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { certificate: CertificatePublic };
    return data.certificate;
  } catch {
    return null;
  }
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cert = await fetchCertificate(code);
  if (!cert) notFound();

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <SiteHeader />
      <main>
        <Section variant="ivory" spacing="md">
          <Container size="narrow">
            <div className="mb-6 flex items-center justify-center gap-2">
              {cert.status === 'issued' ? (
                <Badge variant="success" className="gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Certificado autêntico
                </Badge>
              ) : (
                <Badge variant="warning">Certificado revogado</Badge>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-paper p-10 shadow-card">
              <div className="text-center">
                <div className="mb-2 text-[0.7rem] font-semibold tracking-[0.4em] text-gold-600">
                  CERTIFICADO DE CONCLUSÃO
                </div>
                <div className="mb-1 mt-8 text-sm uppercase tracking-widest text-ink-500">
                  Certificamos que
                </div>
                <div className="mb-3 font-display text-3xl font-medium text-navy-900">
                  {cert.userName}
                </div>
                <div className="mb-2 text-sm text-ink-500">concluiu com aproveitamento o curso</div>
                <div className="mb-8 font-display text-2xl italic text-navy-700">
                  {cert.courseTitle}
                </div>
                <div className="mx-auto my-6 h-px w-20 bg-gold-500" />
                <div className="grid grid-cols-3 gap-4 text-xs text-ink-500">
                  <div>
                    <div className="font-mono text-base text-navy-700">{cert.workloadHours}h</div>
                    <div className="mt-1 uppercase tracking-widest">Carga horária</div>
                  </div>
                  <div>
                    <div className="font-mono text-base text-navy-700">{issuedDate}</div>
                    <div className="mt-1 uppercase tracking-widest">Emitido em</div>
                  </div>
                  <div>
                    <div className="font-mono text-base text-navy-700">{cert.code}</div>
                    <div className="mt-1 uppercase tracking-widest">Código</div>
                  </div>
                </div>
                {cert.instructorName && (
                  <div className="mt-6 text-sm text-ink-600">
                    Curso ministrado por <span className="font-medium">{cert.instructorName}</span>
                  </div>
                )}
                {cert.pdfUrl && (
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 rounded-md border border-navy-700 px-5 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    Baixar PDF do certificado
                  </a>
                )}
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-ink-500">
              Curso livre conforme LDB 9.394/96 art. 42. Sem reconhecimento MEC. Válido como horas
              complementares.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
