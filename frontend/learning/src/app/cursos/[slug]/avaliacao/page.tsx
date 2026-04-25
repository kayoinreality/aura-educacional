'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../../../../lib/auth-client'
import { formatPercent } from '../../../../lib/formatters'

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
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    authFetch<AssessmentPayload>(`/learning/courses/${params.slug}/assessment`)
      .then((payload) => {
        setAssessment(payload)
        setError(null)
      })
      .catch((caughtError) =>
        setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível carregar a avaliação.')
      )
  }, [params.slug])

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers])

  async function handleSubmit() {
    if (!assessment) return

    setSubmitting(true)
    setError(null)

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
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível enviar a avaliação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="learning-page">
      <section className="assessment-header">
        <div>
          <Link className="back-link" href={`/cursos/${params.slug}`}>
            Voltar ao curso
          </Link>
          <span className="eyebrow">Avaliação final</span>
          <h1>{assessment?.title || 'Carregando avaliação...'}</h1>
          <p>{assessment?.description}</p>
        </div>
        <div className="study-summary">
          <strong>{assessment ? `${answeredCount}/${assessment.questions.length}` : '0/0'}</strong>
          <span>respondidas</span>
          <small>{assessment ? `mínimo ${formatPercent(assessment.passingScore)}` : '-'}</small>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="assessment-list">
        {assessment?.questions.map((question, index) => (
          <article key={question.id} className="question-card">
            <span>Questão {index + 1}</span>
            <h2>{question.prompt}</h2>
            <div className="option-list">
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
      </section>

      {assessment ? (
        <div className="assessment-submit">
          <button
            className="primary-action"
            disabled={submitting || answeredCount < assessment.questions.length}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </div>
      ) : null}

      {result ? (
        <section className="result-box">
          <span>Resultado</span>
          <h2>{formatPercent(result.score)}</h2>
          <p>{result.passed ? 'Aprovado(a)' : 'Ainda não atingiu a nota mínima.'}</p>
          {result.certificate ? <strong>Certificado {result.certificate.code}</strong> : null}
        </section>
      ) : null}
    </main>
  )
}
