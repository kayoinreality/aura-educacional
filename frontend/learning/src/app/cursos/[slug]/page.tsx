'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../../../lib/auth-client'
import { formatEnrollmentStatus, formatPercent } from '../../../lib/formatters'

export const runtime = 'edge'

type StudyPayload = {
  enrollment: {
    progress: number
    status: string
    completedAt: string | null
  }
  course: {
    slug: string
    title: string
    shortDescription: string
    totalHours: number
    totalLessons: number
    modules: Array<{
      id: string
      title: string
      description: string | null
      order: number
      lessons: Array<{
        id: string
        title: string
        description: string | null
        content: string | null
        videoUrl: string | null
        videoDuration: number | null
        order: number
        attachments: unknown
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
      lastAttempt: {
        score: number
        passed: boolean
        submittedAt: string
      } | null
    } | null
  }
  certificate: {
    code: string
    status: string
  } | null
}

function formatDuration(seconds: number | null) {
  if (!seconds) return 'Leitura'
  const minutes = Math.max(1, Math.round(seconds / 60))
  return `${minutes} min`
}

export default function StudyCoursePage() {
  const params = useParams<{ slug: string }>()
  const [payload, setPayload] = useState<StudyPayload | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [busyLessonId, setBusyLessonId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const lessons = useMemo(
    () => payload?.course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module }))) ?? [],
    [payload]
  )

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0]
  const completedLessons = lessons.filter((lesson) => lesson.progress.completed).length

  async function loadCourse() {
    try {
      const result = await authFetch<StudyPayload>(`/learning/courses/${params.slug}`)
      setPayload(result)
      setActiveLessonId((current) => current ?? result.course.modules[0]?.lessons[0]?.id ?? null)
      setError(null)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível carregar o curso.')
    }
  }

  useEffect(() => {
    void loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug])

  async function updateLesson(lessonId: string, completed: boolean) {
    setBusyLessonId(lessonId)

    try {
      await authFetch(`/learning/lessons/${lessonId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ completed }),
      })
      await loadCourse()
    } finally {
      setBusyLessonId(null)
    }
  }

  if (error) {
    return (
      <main className="learning-page learning-page--centered">
        <section className="empty-state">
          <span className="eyebrow">Curso indisponível</span>
          <h1>Não foi possível abrir este curso</h1>
          <p>{error}</p>
          <Link className="primary-action" href="/login">
            Entrar novamente
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="study-workspace">
      <section className="study-header">
        <div>
          <Link className="back-link" href="/">
            Voltar ao painel
          </Link>
          <h1>{payload?.course.title || 'Carregando curso...'}</h1>
          <p>{payload?.course.shortDescription}</p>
        </div>
        {payload ? (
          <div className="study-summary">
            <strong>{formatPercent(payload.enrollment.progress)}</strong>
            <span>{completedLessons} de {lessons.length} aulas</span>
            <small>{formatEnrollmentStatus(payload.enrollment.status)}</small>
          </div>
        ) : null}
      </section>

      {payload ? (
        <section className="study-layout">
          <aside className="lesson-outline">
            <div className="outline-top">
              <span>Roteiro</span>
              <strong>{payload.course.modules.length} módulos</strong>
            </div>

            {payload.course.modules.map((module) => (
              <div key={module.id} className="outline-module">
                <h2>{module.title}</h2>
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={lesson.id === activeLesson?.id ? 'lesson-button active' : 'lesson-button'}
                    onClick={() => setActiveLessonId(lesson.id)}
                    type="button"
                  >
                    <span>{lesson.progress.completed ? '✓' : String(lesson.order).padStart(2, '0')}</span>
                    <div>
                      <strong>{lesson.title}</strong>
                      <small>{formatDuration(lesson.videoDuration)}</small>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <article className="lesson-stage">
            {activeLesson ? (
              <>
                <div className="lesson-player">
                  {activeLesson.videoUrl ? (
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      src={activeLesson.videoUrl}
                      title={activeLesson.title}
                    />
                  ) : (
                    <div className="lesson-placeholder">
                      <span>Aula</span>
                      <strong>{activeLesson.title}</strong>
                    </div>
                  )}
                </div>

                <div className="lesson-content">
                  <div>
                    <span className="eyebrow">{activeLesson.module.title}</span>
                    <h2>{activeLesson.title}</h2>
                    <p>{activeLesson.description || activeLesson.content || 'Conteúdo da aula em preparação.'}</p>
                  </div>
                  <button
                    className="primary-action"
                    disabled={busyLessonId === activeLesson.id}
                    onClick={() => void updateLesson(activeLesson.id, !activeLesson.progress.completed)}
                    type="button"
                  >
                    {activeLesson.progress.completed ? 'Reabrir aula' : 'Concluir aula'}
                  </button>
                </div>
              </>
            ) : (
              <div className="lesson-placeholder">
                <strong>Curso sem aulas publicadas</strong>
              </div>
            )}
          </article>

          <aside className="study-panel">
            <h2>Progresso</h2>
            <div className="progress-track">
              <div style={{ width: `${payload.enrollment.progress}%` }} />
            </div>
            <p>{formatPercent(payload.enrollment.progress)} concluído</p>

            {payload.course.assessment ? (
              <div className="assessment-box">
                <span>Avaliação final</span>
                <strong>{payload.course.assessment.questionCount} questões</strong>
                <p>Aproveitamento mínimo de {formatPercent(payload.course.assessment.passingScore)}.</p>
                <Link
                  className={payload.course.assessment.available ? 'primary-action' : 'primary-action disabled'}
                  href={payload.course.assessment.available ? `/cursos/${params.slug}/avaliacao` : '#'}
                >
                  Iniciar avaliação
                </Link>
              </div>
            ) : null}

            {payload.certificate ? (
              <div className="certificate-box">
                <span>Certificado emitido</span>
                <strong>{payload.certificate.code}</strong>
              </div>
            ) : null}
          </aside>
        </section>
      ) : (
        <p className="muted-text">Carregando ambiente de estudo...</p>
      )}
    </main>
  )
}
