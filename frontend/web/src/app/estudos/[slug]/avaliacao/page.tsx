'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { authFetch } from '../../../../lib/auth-client'
import { formatPercent } from '../../../../lib/formatters'

export const runtime = 'edge'

type AssessmentPayload = {
  id: string
  title: string
  description: string | null
  passingScore: number
  timeLimitMinutes: number | null
  questions: Array<{
    id: string
    prompt: string
    options: Array<{
      id: string
      label: string
    }>
  }>
}

type AssessmentResult = {
  score: number
  passed: boolean
  passingScore: number
  certificate: {
    code: string
  } | null
}

export default function AssessmentPage() {
  const params = useParams<{ slug: string }>()
  const [assessment, setAssessment] = useState<AssessmentPayload | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authFetch<AssessmentPayload>(`/learning/courses/${params.slug}/assessment`)
      .then(setAssessment)
      .catch((caughtError) =>
        setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível carregar a avaliação.')
      )
  }, [params.slug])

  async function handleSubmit() {
    if (!assessment) return

    try {
      const payload = await authFetch<AssessmentResult>(`/learning/courses/${params.slug}/assessment`, {
        method: 'POST',
        body: JSON.stringify({
          answers: assessment.questions.map((question) => ({
            questionId: question.id,
            optionId: answers[question.id],
          })),
        }),
      })

      setResult(payload)
      setError(null)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível enviar a avaliação.')
    }
  }

  return (
    <main className="app-shell app-shell--narrow">
      <section className="student-card">
        <span className="tag">Avaliação final</span>
        <h1 className="section-title serif">{assessment?.title || 'Carregando avaliação...'}</h1>
        <p className="section-sub section-sub--left">{assessment?.description}</p>

        <div className="student-card__meta student-card__meta--wide">
          <span>Aproveitamento mínimo: {assessment ? formatPercent(assessment.passingScore) : '-'}</span>
          {assessment?.timeLimitMinutes ? <span>Tempo estimado: {assessment.timeLimitMinutes} minutos</span> : null}
        </div>

        {assessment?.questions.map((question) => (
          <article key={question.id} className="question-card">
            <h2>{question.prompt}</h2>
            <div className="option-grid">
              {question.options.map((option) => (
                <label key={option.id} className="option-row">
                  <input
                    checked={answers[question.id] === option.id}
                    name={question.id}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </article>
        ))}

        <button className="public-button" onClick={() => void handleSubmit()} type="button">
          Enviar avaliação
        </button>

        {result ? (
          <div className="result-box">
            <strong>
              Resultado: {formatPercent(result.score)} · {result.passed ? 'Aprovado(a)' : 'Não aprovado(a)'}
            </strong>
            {result.certificate ? (
              <Link className="public-button public-button--ghost" href="/certificados">
                Ver certificado emitido
              </Link>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}
      </section>
    </main>
  )
}
