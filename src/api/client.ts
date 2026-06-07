const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.crashtest.mthy.dev').replace(/\/$/, '')

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }
  if (!res.ok) {
    let msg: string | undefined
    if (body && typeof body === 'object' && 'error' in body) {
      msg = (body as { error?: string }).error
    } else if (typeof body === 'string') {
      msg = body
    }
    throw new Error(msg || res.statusText || `Request failed: ${res.status}`)
  }
  return body as T
}
