import { ref } from 'vue'
import type { API, CreateAPIInput, UpdateAPIInput } from '../types/api'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) {
    const msg = body && typeof body === 'object' && 'error' in body ? body.error : res.statusText
    throw new Error(msg || `Request failed: ${res.status}`)
  }
  return body as T
}

export function useApis() {
  const apis = ref<API[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const data = await request<{ apis: API[] }>('/apis')
      apis.value = data.apis
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load APIs'
    } finally {
      loading.value = false
    }
  }

  async function get(id: string): Promise<API> {
    return request<API>(`/apis/${encodeURIComponent(id)}`)
  }

  async function create(input: CreateAPIInput): Promise<API> {
    return request<API>('/apis', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async function update(id: string, input: UpdateAPIInput): Promise<API> {
    return request<API>(`/apis/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }

  async function remove(id: string): Promise<void> {
    await request<void>(`/apis/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  return { apis, loading, error, load, get, create, update, remove }
}
