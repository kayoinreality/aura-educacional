'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logoutSession } from '../lib/auth-client'
import { usePublicSession } from '../lib/use-public-session'

export function PublicHeader() {
  const router = useRouter()
  const session = usePublicSession()

  async function handleLogout() {
    await logoutSession()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link className="public-header__brand" href="/">
          Aura Educacional
        </Link>

        <nav className="public-header__nav">
          <Link href="/cursos">Cursos</Link>
          <Link href="/meus-cursos">Meus cursos</Link>
          <Link href="/certificados">Certificados</Link>
        </nav>

        <div className="public-header__actions">
          {session ? (
            <>
              <span className="public-header__welcome">
                {session.user.firstName} {session.user.lastName}
              </span>
              <button
                className="public-button public-button--ghost"
                onClick={() => void handleLogout()}
                type="button"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link className="public-button public-button--ghost" href="/login">
                Entrar
              </Link>
              <Link className="public-button" href="/cadastro">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
