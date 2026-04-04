'use client'

import { API_URL } from './api'

export type PublicSession = {
  accessToken: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: string
    emailVerified: string | null
  }
}

const STORAGE_KEY = 'aura_public_session'

function ensureBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('A sessão do navegador não está disponível no servidor.')
  }
}

export function readSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as PublicSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function writeSession(session: PublicSession) {
  ensureBrowser()
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new CustomEvent('aura-auth-changed'))
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('aura-auth-changed'))
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || 'Não foi possível concluir a solicitação.')
  }

  return payload as T
}

export async function loginWithPassword(input: {
  email: string
  password: string
  rememberMe?: boolean
}) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const payload = await parseJson<PublicSession>(response)
  writeSession(payload)
  return payload
}

export async function registerStudent(input: {
  firstName: string
  lastName: string
  email: string
  password: string
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      acceptTerms: true,
    }),
  })

  return parseJson<{
    message: string
    user: PublicSession['user']
  }>(response)
}

export async function loginWithGoogleCredential(credential: string) {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credential,
    }),
  })

  const payload = await parseJson<PublicSession>(response)
  writeSession(payload)
  return payload
}

export async function logoutSession() {
  const session = readSession()

  if (!session) {
    clearSession()
    return
  }

  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).catch(() => null)

  clearSession()
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  const payload = await parseJson<PublicSession>(response)
  writeSession(payload)
  return payload.accessToken
}

export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = readSession()

  if (!session) {
    throw new Error('É necessário entrar na plataforma para continuar.')
  }

  const makeRequest = async (token: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    })

  let response = await makeRequest(session.accessToken)

  if (response.status === 401) {
    const freshToken = await refreshAccessToken()
    response = await makeRequest(freshToken)
  }

  return parseJson<T>(response)
}
