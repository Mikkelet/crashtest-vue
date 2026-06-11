export interface Project {
  id: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  id: string
  name: string
  description?: string | null
}

export interface UpdateProjectInput {
  name?: string
  description?: string | null
}
