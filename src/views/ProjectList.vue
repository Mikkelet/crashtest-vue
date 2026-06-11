<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useProjects } from '../composables/useProjects'

const { projects, loading, error, load, remove } = useProjects()

onMounted(load)

async function onDelete(id: string, name: string) {
  if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return
  try {
    await remove(id)
    await load()
    window.dispatchEvent(new Event('crashtest:refresh'))
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete')
  }
}
</script>

<template>
  <div class="header">
    <div>
      <h1>Projects</h1>
      <div class="sub">Group related APIs together. Each project owns its own set of APIs.</div>
    </div>
    <RouterLink class="btn btn-primary" :to="{ name: 'project-new' }">+ New project</RouterLink>
  </div>

  <div v-if="error" class="error">{{ error }}</div>

  <div class="panel">
    <div v-if="loading" class="empty">Loading…</div>
    <div v-else-if="projects.length === 0" class="empty">
      No projects yet. Click <strong>New project</strong> to create one.
    </div>
    <ul v-else class="list">
      <li v-for="p in projects" :key="p.id">
        <div>
          <div class="name">{{ p.name }}</div>
          <div v-if="p.description" class="url">{{ p.description }}</div>
          <div class="meta">
            <span class="badge">id: {{ p.id }}</span>
          </div>
        </div>
        <div class="actions">
          <RouterLink class="btn" :to="{ name: 'api-list', params: { projectId: p.id } }">
            APIs
          </RouterLink>
          <RouterLink class="btn" :to="{ name: 'project-edit', params: { id: p.id } }">
            Edit
          </RouterLink>
          <button class="btn btn-danger" @click="onDelete(p.id, p.name)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>
