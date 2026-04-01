'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { authFetch } from '../../../lib/auth-client'

export const runtime = 'edge'

type StudyPayload = {
  enrollment: {
    progress: number
    status: string
  }
  course: {
    title: string
    shortDescription: string
    modules: Array<{
      id: string
      title: string
      description: string | null
      lessons: Array<{
        id: string
        title: string
        description: string | null
        content: string | null
        videoDuration: number | null
        progress: {
          completed: boolean
          watchTime: number
          completedAt: string | null
        }
      }>
    }>
    assessment: {
      available: boolean
      questionCount: number
      passingScore: number
    } | null
  }
  certificate: {
    code: string
  } | null
}

export default function StudyPage() {
  const params = useParams<{ slug: string }>()
  const [payload, setPayload] = useState<StudyPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const result = await authFetch<StudyPayload>(`/learning/courses/${params.slug}`)
      setPayload(result)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Falha ao carregar o curso.')
    }
  }

  useEffect(() => {
    void load()
  }, [params.slug])

  async function completeLesson(lessonId: string) {
    await authFetch(`/learning/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({
        completed: true,
      }),
    })

    await load()
  }

  return (
    <main className="app-shell">
      <section className="page-intro">
        <span className="tag">Area de estudos</span>
        <h1 className="section-title serif">{payload?.course.title || 'Carregando curso...'}</h1>
        <p className="section-sub section-sub--left">{payload?.course.shortDescription}</p>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      {payload ? (
        <>
          <section className="student-card">
            <h2>Progresso do curso</h2>
            <div className="progress-bar">
              <div style={{ width: `${payload.enrollment.progress}%` }} />
            </div>
            <div className="student-card__meta student-card__meta--wide">
              <span>{payload.enrollment.progress.toFixed(0)}% concluido</span>
              <span>{payload.enrollment.status}</span>
              {payload.certificate ? <span>Certificado emitido</span> : null}
            </div>
            <div className="student-card__actions">
              <Link className="public-button" href={`/estudos/${params.slug}/avaliacao`}>
                Fazer avaliacao final
              </Link>
              <Link className="public-button public-button--ghost" href="/certificados">
                Ver certificados
              </Link>
            </div>
          </section>

          <section className="module-listing">
            {payload.course.modules.map((module) => (
              <article key={module.id} className="module-card module-card--study">
                <h2>{module.title}</h2>
                <p>{module.description}</p>

                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="lesson-row">
                    <div>
                      <strong>{lesson.title}</strong>
                      <p>{lesson.description || lesson.content || 'Conteudo da aula.'}</p>
                    </div>

                    <div className="lesson-row__actions">
                      <span>{lesson.progress.completed ? 'Concluida' : 'Pendente'}</span>
                      <button className="public-button public-button--ghost" onClick={() => void completeLesson(lesson.id)} type="button">
                        Marcar como concluida
                      </button>
                    </div>
                  </div>
                ))}
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  )
}
