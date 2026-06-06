export type InterceptMethod =
  | 'ANY'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

export const INTERCEPT_METHODS: InterceptMethod[] = [
  'ANY',
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

export interface InterceptRule {
  id: string
  api_id: string
  name: string
  method: InterceptMethod
  path_pattern: string
  priority: number
  status_code: number
  response_headers: Record<string, string>
  response_body: string
  delay_ms: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface CreateInterceptInput {
  name: string
  method: InterceptMethod
  path_pattern: string
  priority?: number
  status_code: number
  response_headers?: Record<string, string>
  response_body?: string
  delay_ms?: number
  enabled?: boolean
}

export interface UpdateInterceptInput {
  name?: string
  method?: InterceptMethod
  path_pattern?: string
  priority?: number
  status_code?: number
  response_headers?: Record<string, string>
  response_body?: string
  delay_ms?: number
  enabled?: boolean
}
