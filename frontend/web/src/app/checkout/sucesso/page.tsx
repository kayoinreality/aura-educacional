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
            <span className="tag">Pagamento</span>
            <h1 className="section-title serif">Confirmando inscrição</h1>
            <p className="section-sub section-sub--left">
              Estamos validando as informações do pagamento para liberar o acesso ao curso.
            </p>
          </section>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  )
}
