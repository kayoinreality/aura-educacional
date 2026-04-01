'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authFetch } from '../../../lib/auth-client'

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

export function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<CheckoutStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Sessao de checkout nao encontrada.')
      return
    }

    authFetch<CheckoutStatus>(`/checkout/session/${sessionId}`)
      .then(setStatus)
      .catch((caughtError) =>
        setError(caughtError instanceof Error ? caughtError.message : 'Nao foi possivel confirmar seu pagamento.')
      )
  }, [sessionId])

  return (
    <main className="app-shell app-shell--narrow">
      <section className="student-card">
        <span className="tag">Checkout</span>
        <h1 className="section-title serif">Retorno do pagamento</h1>

        {status ? (
          <>
            <p className="section-sub section-sub--left">
              {status.redirectStatus === 'confirmed'
                ? 'Pagamento confirmado e acesso liberado.'
                : status.redirectStatus === 'processing'
                  ? 'O Stripe confirmou o pagamento, e a plataforma esta finalizando a liberacao.'
                  : 'Sua compra foi recebida. Aguarde alguns segundos e atualize a pagina se necessario.'}
            </p>

            <div className="student-card__meta student-card__meta--wide">
              <span>Status local: {status.payment?.status ?? 'pendente'}</span>
              {status.payment ? <span>Valor: R$ {status.payment.amount.toFixed(2)}</span> : null}
              {status.payment ? <span>Metodo: {status.payment.method}</span> : null}
            </div>

            <div className="student-card__actions">
              <Link className="public-button" href="/meus-cursos">
                Ir para meus cursos
              </Link>
              {status.courseSlug ? (
                <Link className="public-button public-button--ghost" href={`/estudos/${status.courseSlug}`}>
                  Abrir area de estudos
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
