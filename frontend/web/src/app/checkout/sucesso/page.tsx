import { Suspense } from 'react'
import { CheckoutSuccessClient } from './success-client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell app-shell--narrow">
          <section className="student-card">
            <span className="tag">Checkout</span>
            <h1 className="section-title serif">Confirmando pagamento</h1>
            <p className="section-sub section-sub--left">
              Estamos validando sua sessao de checkout.
            </p>
          </section>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  )
}
