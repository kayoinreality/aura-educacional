import Link from 'next/link'

export default function CheckoutCancelledPage() {
  return (
    <main className="app-shell app-shell--narrow">
      <section className="student-card">
        <span className="tag">Pagamento</span>
        <h1 className="section-title serif">Pagamento não concluído</h1>
        <p className="section-sub section-sub--left">
          Nenhuma cobrança foi efetivada. Você pode retornar ao catálogo, revisar as informações do curso e tentar novamente quando desejar.
        </p>

        <div className="student-card__actions">
          <Link className="public-button" href="/cursos">
            Voltar ao catálogo
          </Link>
          <Link className="public-button public-button--ghost" href="/login">
            Acessar a plataforma
          </Link>
        </div>
      </section>
    </main>
  )
}
