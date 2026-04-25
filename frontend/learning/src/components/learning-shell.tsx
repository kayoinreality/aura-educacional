'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logoutSession } from '../lib/auth-client'
import { usePublicSession } from '../lib/use-public-session'

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'

export function LearningShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const session = usePublicSession()

  async function handleLogout() {
    await logoutSession()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="learning-app">
      <aside className="learning-sidebar">
        <Link className="learning-brand" href="/">
          <span>Aura</span>
          Learning
        </Link>

        <nav className="learning-nav">
          <Link className={pathname === '/' ? 'active' : ''} href="/">
            Painel
          </Link>
          <Link className={pathname.startsWith('/certificados') ? 'active' : ''} href="/certificados">
            Certificados
          </Link>
          <a href={`${PUBLIC_SITE_URL}/cursos`}>Catálogo</a>
          <a href={PUBLIC_SITE_URL}>Site público</a>
        </nav>

        <div className="learning-account">
          {session ? (
            <>
              <span>{session.user.firstName}</span>
              <button onClick={() => void handleLogout()} type="button">
                Sair
              </button>
            </>
          ) : (
            <Link href="/login">Entrar</Link>
          )}
        </div>
      </aside>

      <div className="learning-main">{children}</div>
    </div>
  )
}
