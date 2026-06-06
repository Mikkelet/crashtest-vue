import { ref } from 'vue'
import type {
  CreateInterceptInput,
  InterceptRule,
  UpdateInterceptInput,
} from '../types/intercept'

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

export function useIntercepts(apiId: string) {
  const rules = ref<InterceptRule[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const base = `/apis/${encodeURIComponent(apiId)}/intercepts`

  async function load() {
    loading.value = true
    error.value = null
    try {
      const data = await request<{ intercepts: InterceptRule[] }>(base)
      rules.value = data.intercepts
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load intercept rules'
    } finally {
      loading.value = false
    }
  }

  async function get(id: string): Promise<InterceptRule> {
    return request<InterceptRule>(`${base}/${encodeURIComponent(id)}`)
  }

  async function create(input: CreateInterceptInput): Promise<InterceptRule> {
    return request<InterceptRule>(base, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async function update(id: string, input: UpdateInterceptInput): Promise<InterceptRule> {
    return request<InterceptRule>(`${base}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }

  async function remove(id: string): Promise<void> {
    await request<void>(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  return { rules, loading, error, load, get, create, update, remove }
}
