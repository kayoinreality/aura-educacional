'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchFromApi } from '../../../lib/api'
import { authFetch } from '../../../lib/auth-client'

type CheckoutSummary = {
  course: {
    title: string
    slug: string
    shortDescription: string
    isFree: boolean
  }
  pricing: {
    basePrice: number
    discountAmount: number
    finalPrice: number
    isFree: boolean
    coupon: {
      code: string
      description: string | null
    } | null
  }
}

type PurchaseResponse = {
  mode: string
  redirectUrl?: string
}

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [summary, setSummary] = useState<CheckoutSummary | null>(null)
  const [coupon, setCoupon] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX' | 'BOLETO'>('CREDIT_CARD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const query = coupon ? `?coupon=${encodeURIComponent(coupon)}` : ''
        const payload = await fetchFromApi<CheckoutSummary>(`/checkout/summary/${params.slug}${query}`)
        setSummary(payload)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Falha ao carregar checkout.')
      }
    }

    void run()
  }, [params.slug, coupon])

  async function handlePurchase() {
    setLoading(true)
    setError(null)

    try {
      const response = await authFetch<PurchaseResponse>('/checkout/purchase', {
        method: 'POST',
        body: JSON.stringify({
          courseSlug: params.slug,
          paymentMethod,
          couponCode: coupon || undefined,
        }),
      })

      if (response.redirectUrl) {
        window.location.href = response.redirectUrl
        return
      }

      router.push('/meus-cursos')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Falha ao concluir compra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell app-shell--narrow">
      <section className="checkout-card checkout-card--full">
        <span className="tag">Checkout</span>
        <h1 className="section-title serif">{summary?.course.title || 'Carregando curso...'}</h1>
        <p className="section-sub section-sub--left">{summary?.course.shortDescription}</p>

        <div className="checkout-grid">
          <label>
            Cupom
            <input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} />
          </label>
          <label>
            Forma de pagamento
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as any)}>
              <option value="CREDIT_CARD">Cartao de credito</option>
              <option value="PIX">PIX</option>
              <option value="BOLETO">Boleto</option>
            </select>
          </label>
        </div>

        {summary ? (
          <div className="summary-box">
            <div>
              <span>Valor base</span>
              <strong>R$ {summary.pricing.basePrice.toFixed(2)}</strong>
            </div>
            <div>
              <span>Desconto</span>
              <strong>R$ {summary.pricing.discountAmount.toFixed(2)}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>R$ {summary.pricing.finalPrice.toFixed(2)}</strong>
            </div>
          </div>
        ) : null}

        <button className="public-button" disabled={loading} onClick={() => void handlePurchase()} type="button">
          {loading ? 'Processando...' : 'Finalizar compra'}
        </button>

        {error ? <p className="auth-error">{error}</p> : null}
      </section>
    </main>
  )
}
