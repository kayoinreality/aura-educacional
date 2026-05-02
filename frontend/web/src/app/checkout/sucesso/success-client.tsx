'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authFetch, readSession } from '../../../lib/auth-client'
import { formatCurrency, formatPaymentMethod, formatPaymentStatus } from '../../../lib/formatters'

const LEARNING_URL =
  process.env.NEXT_PUBLIC_LEARNING_URL || 'http://localhost:3003'

type CheckoutStatus = {
  redirectStatus: 'confirmed' | 'processing' | 'pending'
  courseSlug: string | null
  payment: {
    status: string
    amount: number
    method: string
  } | null
  enrollment: {
    id: string
    status: string
    progress: number
  } | null
}

function buildHandoffUrl(courseSlug: string | null) {
  if (typeof window === 'undefined') return null
  const session = readSession()
  if (!session) return null
  const target = courseSlug ? `/cursos/${courseSlug}` : '/'
  const userPayload = btoa(unescape(encodeURIComponent(JSON.stringify(session.user))))
  const params = new URLSearchParams({
    token: session.accessToken,
    user: userPayload,
    redirect: target,
  })
  return `${LEARNING_URL}/auth/handoff#${params.toString()}`
}

export function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<CheckoutStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Não foi possível localizar a sessão de pagamento.')
      return
    }

    authFetch<CheckoutStatus>(`/checkout/session/${sessionId}`)
      .then((result) => {
        setStatus(result)
        if (result.redirectStatus === 'confirmed') {
          const url = buildHandoffUrl(result.courseSlug)
          setHandoffUrl(url)
          if (url) {
            redirectTimer.current = setTimeout(() => {
              window.location.href = url
            }, 2500)
          }
        }
      })
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Não foi possível confirmar o status do pagamento.'
        )
      )

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current)
    }
  }, [sessionId])

  return (
    <main className="app-shell app-shell--narrow">
      <section className="student-card">
        <span className="tag">Pagamento</span>
        <h1 className="section-title serif">Situação da inscrição</h1>

        {status ? (
          <>
            <p className="section-sub section-sub--left">
              {status.redirectStatus === 'confirmed'
                ? 'Pagamento confirmado! Redirecionando para o ambiente de estudos…'
                : status.redirectStatus === 'processing'
                  ? 'O pagamento foi recebido e está em fase final de confirmação.'
                  : 'A compra foi registrada. Aguarde alguns instantes e atualize esta página, se necessário.'}
            </p>

            <div className="student-card__meta student-card__meta--wide">
              <span>
                Status do pagamento:{' '}
                {status.payment?.status ? formatPaymentStatus(status.payment.status) : 'Pendente'}
              </span>
              {status.payment ? <span>Valor: {formatCurrency(status.payment.amount)}</span> : null}
              {status.payment ? (
                <span>Forma de pagamento: {formatPaymentMethod(status.payment.method)}</span>
              ) : null}
            </div>

            <div className="student-card__actions">
              {handoffUrl ? (
                <a className="public-button" href={handoffUrl}>
                  Acessar curso agora
                </a>
              ) : (
                <Link className="public-button" href="/meus-cursos">
                  Ir para a área do aluno
                </Link>
              )}
              {!handoffUrl && status.courseSlug ? (
                <Link
                  className="public-button public-button--ghost"
                  href={`/estudos/${status.courseSlug}`}
                >
                  Abrir área de estudos
                </Link>
              ) : null}
              {handoffUrl ? (
                <Link className="public-button public-button--ghost" href="/meus-cursos">
                  Ver todos os cursos
                </Link>
              ) : null}
            </div>
          </>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}
      </section>
    </main>
  )
}
