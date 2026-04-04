'use client'

import { useEffect, useState } from 'react'
import { API_URL } from '../../lib/api'
import { authFetch } from '../../lib/auth-client'

type Certificate = {
  id: string
  code: string
  status: string
  issuedAt: string | null
  pdfUrl: string | null
  course: {
    title: string
    slug: string
    totalHours: number
    certificateHours: number | null
  }
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authFetch<Certificate[]>('/certificates/mine')
      .then(setCertificates)
      .catch((caughtError) =>
        setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível carregar os certificados.')
      )
  }, [])

  return (
    <main className="app-shell">
      <section className="page-intro">
        <span className="tag">Certificados</span>
        <h1 className="section-title serif">Certificados emitidos</h1>
        <p className="section-sub section-sub--left">
          Cada certificado pode ser consultado em PDF e validado por código público de verificação.
        </p>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="catalog-grid">
        {certificates.map((certificate) => (
          <article key={certificate.id} className="student-card">
            <span className="student-card__eyebrow">{certificate.code}</span>
            <h2>{certificate.course.title}</h2>
            <p>
              Carga horária certificada: {certificate.course.certificateHours ?? certificate.course.totalHours} horas
            </p>

            <div className="student-card__actions">
              <a className="public-button" href={`${API_URL}/certificates/${certificate.code}/pdf`} rel="noreferrer" target="_blank">
                Abrir PDF
              </a>
              <a className="public-button public-button--ghost" href={`${API_URL}/certificates/verify/${certificate.code}`} rel="noreferrer" target="_blank">
                Validar certificado
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
