export interface API {
  id: string
  project_id: string
  name: string
  base_url: string
  description?: string | null
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface CreateAPIInput {
  project_id: string
  name: string
  base_url: string
  description?: string | null
  enabled?: boolean
}

export interface UpdateAPIInput {
  name?: string
  base_url?: string
  description?: string | null
  enabled?: boolean
}
