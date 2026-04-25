'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { loginWithPassword } from '../../lib/auth-client'

export default function LearningLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('ana@aura.local')
  const [password, setPassword] = useState('Aura@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await loginWithPassword({ email, password, rememberMe: true })
      router.push('/')
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <span className="eyebrow">Aura Learning</span>
        <h1>Acesso do aluno</h1>
        <p>Entre para continuar seus cursos, acompanhar progresso e emitir certificados.</p>

        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Senha
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>
          <button disabled={loading} type="submit">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </section>
    </main>
  )
}
