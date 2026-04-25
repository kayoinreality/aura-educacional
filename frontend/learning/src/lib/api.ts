const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:3001'

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(fallback || 'Request failed')
  }

  return response.json() as Promise<T>
}

export async function fetchFromApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  return parseResponse<T>(response)
}

export async function fetchFromApiOrDefault<T>(
  path: string,
  fallback: T,
  init?: RequestInit
): Promise<T> {
  try {
    return await fetchFromApi<T>(path, init)
  } catch {
    return fallback
  }
}

export { API_URL }
