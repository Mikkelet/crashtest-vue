import { ref } from 'vue'
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project'
import type { API } from '../types/api'
import { request } from '../api/client'

export function useProjects() {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const data = await request<{ projects: Project[] }>('/projects')
      projects.value = data.projects
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load projects'
    } finally {
      loading.value = false
    }
  }

  async function get(id: string): Promise<Project> {
    return request<Project>(`/projects/${encodeURIComponent(id)}`)
  }

  async function create(input: CreateProjectInput): Promise<Project> {
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async function update(id: string, input: UpdateProjectInput): Promise<Project> {
    return request<Project>(`/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }

  async function remove(id: string): Promise<void> {
    await request<void>(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  async function listAPIs(id: string): Promise<API[]> {
    const data = await request<{ apis: API[] }>(`/projects/${encodeURIComponent(id)}/apis`)
    return data.apis
  }

  return { projects, loading, error, load, get, create, update, remove, listAPIs }
}
