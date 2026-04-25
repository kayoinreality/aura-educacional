'use client'

import Link from 'next/link'

export default function CertificatesPage() {
  return (
    <main className="learning-page learning-page--centered">
      <section className="empty-state">
        <span className="eyebrow">Certificados</span>
        <h1>Consulte certificados emitidos pela Aura.</h1>
        <p>A validação pública continua no site principal. O painel do aluno destaca certificados dentro de cada curso concluído.</p>
        <a className="primary-action" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'}/certificados`}>
          Abrir validação pública
        </a>
        <Link className="secondary-action" href="/">
          Voltar ao painel
        </Link>
      </section>
    </main>
  )
}
