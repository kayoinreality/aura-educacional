'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { writeSession, type LearningSession } from '../../../lib/auth-client'

export function HandoffClient() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash.slice(1)
    if (!hash) {
      router.replace('/login')
      return
    }

    const params = new URLSearchParams(hash)
    const token = params.get('token')
    const userPayload = params.get('user')
    const target = params.get('redirect') ?? '/'

    if (!token || !userPayload) {
      router.replace('/login')
      return
    }

    try {
      const decoded = JSON.parse(
        decodeURIComponent(escape(atob(userPayload)))
      ) as LearningSession['user']
      writeSession({ accessToken: token, user: decoded })
      router.replace(target)
    } catch {
      router.replace('/login')
    }
  }, [router])

  return (
    <main className="app-shell app-shell--narrow">
      <section className="student-card">
        <p className="section-sub">Iniciando sessão, aguarde…</p>
      </section>
    </main>
  )
}
