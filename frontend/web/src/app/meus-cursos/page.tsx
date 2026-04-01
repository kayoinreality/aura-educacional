'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { authFetch } from '../../lib/auth-client'

type Enrollment = {
  id: string
  status: string
  progress: number
  completedAt: string | null
  course: {
    slug: string
    title: string
    shortDescription: string
    totalHours: number
    totalLessons: number
    category: {
      name: string
    }
  }
  certificate: {
    code: string
    status: string
  } | null
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Enrollment[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authFetch<Enrollment[]>('/learning/courses')
      .then(setCourses)
      .catch((caughtError) =>
        setError(caughtError instanceof Error ? caughtError.message : 'Falha ao carregar seus cursos.')
      )
  }, [])

  return (
    <main className="app-shell">
      <section className="page-intro">
        <span className="tag">Area do aluno</span>
        <h1 className="section-title serif">Meus cursos</h1>
        <p className="section-sub section-sub--left">
          Acompanhe progresso, entre na area de estudos e avance para a avaliacao final.
        </p>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="catalog-grid">
        {courses.map((enrollment) => (
          <article key={enrollment.id} className="student-card">
            <span className="student-card__eyebrow">{enrollment.course.category.name}</span>
            <h2>{enrollment.course.title}</h2>
            <p>{enrollment.course.shortDescription}</p>

            <div className="progress-bar">
              <div style={{ width: `${enrollment.progress}%` }} />
            </div>

            <div className="student-card__meta">
              <span>{enrollment.progress.toFixed(0)}%</span>
              <span>{enrollment.status}</span>
              {enrollment.certificate ? <span>Certificado pronto</span> : null}
            </div>

            <div className="student-card__actions">
              <Link className="public-button" href={`/estudos/${enrollment.course.slug}`}>
                Continuar estudos
              </Link>
              <Link className="public-button public-button--ghost" href={`/estudos/${enrollment.course.slug}/avaliacao`}>
                Ir para avaliacao
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
