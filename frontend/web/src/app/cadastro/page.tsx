'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerStudent } from '../../lib/auth-client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await registerStudent(form)
      setMessage(result.message)
      router.push('/login')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Falha ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell app-shell--narrow">
      <section className="auth-card">
        <span className="tag">Cadastro</span>
        <h1 className="section-title serif">Crie sua conta e comece a estudar</h1>
        <p className="section-sub section-sub--left">
          Em ambiente local com envio em modo `log`, a conta ja sai validada para acelerar o fluxo.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              value={form.firstName}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            />
          </label>
          <label>
            Sobrenome
            <input
              value={form.lastName}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>
          <button className="public-button" disabled={loading} type="submit">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {message ? <p className="auth-success">{message}</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}
      </section>
    </main>
  )
}
