'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: any
  }
}

export function GoogleLoginButton({
  onCredential,
}: {
  onCredential: (credential: string) => void
}) {
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const rawClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientId =
    rawClientId && !rawClientId.includes('XXXXX') ? rawClientId : undefined

  useEffect(() => {
    if (!clientId || !buttonRef.current) {
      return
    }

    const existing = document.querySelector('script[data-google-identity]')

    const initialize = () => {
      if (!window.google || !buttonRef.current) {
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }: { credential: string }) => onCredential(credential),
      })

      buttonRef.current.innerHTML = ''

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        width: 280,
        text: 'continue_with',
      })
    }

    if (existing) {
      initialize()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = initialize
    document.head.appendChild(script)
  }, [clientId, onCredential])

  if (!clientId) {
    return (
      <div className="google-placeholder">
        Login com Google sera exibido aqui assim que voce me enviar o `GOOGLE_CLIENT_ID`.
      </div>
    )
  }

  return <div ref={buttonRef} />
}
