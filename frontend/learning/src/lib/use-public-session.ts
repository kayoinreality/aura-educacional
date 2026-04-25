'use client'

import { useEffect, useState } from 'react'
import { readSession, type LearningSession } from './auth-client'

export function usePublicSession() {
  const [session, setSession] = useState<LearningSession | null>(null)

  useEffect(() => {
    const sync = () => setSession(readSession())

    sync()
    window.addEventListener('aura-auth-changed', sync as EventListener)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('aura-auth-changed', sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return session
}
