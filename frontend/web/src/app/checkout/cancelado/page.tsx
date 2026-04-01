import Link from 'next/link'

export default function CheckoutCancelledPage() {
  return (
    <main className="app-shell app-shell--narrow">
      <section className="student-card">
        <span className="tag">Checkout</span>
        <h1 className="section-title serif">Pagamento cancelado</h1>
        <p className="section-sub section-sub--left">
          Nenhuma cobrança foi concluída. Você pode voltar ao catálogo, revisar o curso e tentar
          novamente quando quiser.
        </p>

        <div className="student-card__actions">
          <Link className="public-button" href="/cursos">
            Voltar ao catálogo
          </Link>
          <Link className="public-button public-button--ghost" href="/login">
            Entrar na plataforma
          </Link>
        </div>
      </section>
    </main>
  )
}
