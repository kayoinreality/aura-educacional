'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleLoginButton } from '../../components/google-login-button'
import { loginWithGoogleCredential, loginWithPassword } from '../../lib/auth-client'

export default function LoginPage() {
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
      await loginWithPassword({
        email,
        password,
        rememberMe: true,
      })

      router.push('/meus-cursos')
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível realizar o acesso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell app-shell--narrow">
      <section className="auth-card">
        <span className="tag">Acesso</span>
        <h1 className="section-title serif">Entre para acessar seus cursos, avaliações e certificados</h1>
        <p className="section-sub section-sub--left">
          Utilize seu cadastro na plataforma ou, se disponível, prossiga com autenticação pela conta Google.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="public-button" disabled={loading} type="submit">
            {loading ? 'Validando acesso...' : 'Entrar na plataforma'}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <GoogleLoginButton
          onCredential={async (credential) => {
            try {
              await loginWithGoogleCredential(credential)
              router.push('/meus-cursos')
              router.refresh()
            } catch (caughtError) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : 'Não foi possível concluir o acesso com a conta Google.'
              )
            }
          }}
        />

        {error ? <p className="auth-error">{error}</p> : null}
      </section>
    </main>
  )
}
