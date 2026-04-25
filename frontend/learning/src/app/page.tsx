'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../lib/auth-client'
import { formatEnrollmentStatus, formatPercent } from '../lib/formatters'

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
    level: string
    category: {
      name: string
    }
  }
  certificate: {
    code: string
    status: string
  } | null
}

export default function LearningDashboardPage() {
  const [courses, setCourses] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authFetch<Enrollment[]>('/learning/courses')
      .then((payload) => {
        setCourses(payload)
        setError(null)
      })
      .catch((caughtError) =>
        setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível carregar seus cursos.')
      )
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const active = courses.filter((course) => course.status === 'ACTIVE').length
    const completed = courses.filter((course) => course.progress >= 100).length
    const average =
      courses.length === 0
        ? 0
        : courses.reduce((total, enrollment) => total + enrollment.progress, 0) / courses.length

    return { active, completed, average }
  }, [courses])

  if (error) {
    return (
      <main className="learning-page learning-page--centered">
        <section className="empty-state">
          <span className="eyebrow">Sessão necessária</span>
          <h1>Entre para acessar sua área de estudos</h1>
          <p>{error}</p>
          <Link className="primary-action" href="/login">
            Entrar no Aura Learning
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="learning-page">
      <section className="learning-hero">
        <div>
          <span className="eyebrow">Área do aluno</span>
          <h1>Continue aprendendo de onde parou.</h1>
          <p>Seu ambiente agora fica em um app próprio para estudo, progresso, avaliação e certificado.</p>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{courses.length}</strong>
            <span>matrículas</span>
          </div>
          <div>
            <strong>{stats.active}</strong>
            <span>ativas</span>
          </div>
          <div>
            <strong>{formatPercent(stats.average)}</strong>
            <span>média</span>
          </div>
        </div>
      </section>

      {loading ? <p className="muted-text">Carregando cursos...</p> : null}

      <section className="course-grid">
        {courses.map((enrollment) => (
          <article key={enrollment.id} className="course-card">
            <div className="course-card__header">
              <span>{enrollment.course.category.name}</span>
              <small>{formatEnrollmentStatus(enrollment.status)}</small>
            </div>
            <h2>{enrollment.course.title}</h2>
            <p>{enrollment.course.shortDescription}</p>

            <div className="progress-track" aria-label={`Progresso ${formatPercent(enrollment.progress)}`}>
              <div style={{ width: `${enrollment.progress}%` }} />
            </div>

            <div className="course-card__meta">
              <span>{formatPercent(enrollment.progress)}</span>
              <span>{enrollment.course.totalLessons} aulas</span>
              <span>{enrollment.course.totalHours}h</span>
              {enrollment.certificate ? <span>certificado</span> : null}
            </div>

            <Link className="primary-action" href={`/cursos/${enrollment.course.slug}`}>
              Continuar
            </Link>
          </article>
        ))}
      </section>

      {!loading && courses.length === 0 ? (
        <section className="empty-state">
          <h2>Nenhum curso ativo</h2>
          <p>Quando uma matrícula for confirmada, ela aparecerá aqui automaticamente.</p>
          <a className="primary-action" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cursos`}>
            Ver catálogo
          </a>
        </section>
      ) : null}

      {stats.completed > 0 ? (
        <p className="muted-text">{stats.completed} curso(s) já chegaram a 100% de progresso.</p>
      ) : null}
    </main>
  )
}
