<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useProjects } from '../composables/useProjects'
import type { API } from '../types/api'

const route = useRoute()
const router = useRouter()
const { projects, load: loadProjects, listAPIs } = useProjects()

const apis = ref<API[]>([])
const apisLoading = ref(false)
const apisError = ref<string | null>(null)

// The project in scope is the one in the URL. While editing a project there is
// no `projectId` param, so fall back to that route's `id`.
const currentProjectId = computed(() => {
  if (route.params.projectId) return route.params.projectId as string
  if (route.name === 'project-edit') return route.params.id as string
  return ''
})

// Highlight the API whose intercepts or edit form is open.
const currentApiId = computed(() => {
  if (route.params.apiId) return route.params.apiId as string
  if (route.name === 'api-edit') return route.params.id as string
  return ''
})

async function loadApis(projectId: string) {
  if (!projectId) {
    apis.value = []
    return
  }
  apisLoading.value = true
  apisError.value = null
  try {
    apis.value = await listAPIs(projectId)
  } catch (e) {
    apisError.value = e instanceof Error ? e.message : 'Failed to load APIs'
  } finally {
    apisLoading.value = false
  }
}

function onSelectProject(e: Event) {
  const id = (e.target as HTMLSelectElement).value
  if (id) router.push({ name: 'api-list', params: { projectId: id } })
  else router.push({ name: 'project-list' })
}

// Keep the dropdown and API menu in sync as the user navigates (e.g. after
// creating, editing, or deleting a project or API).
function refresh() {
  loadProjects()
  loadApis(currentProjectId.value)
}

// In-place deletes (which don't change the route) signal via this event.
onMounted(() => {
  refresh()
  window.addEventListener('crashtest:refresh', refresh)
})
onUnmounted(() => window.removeEventListener('crashtest:refresh', refresh))

watch(() => route.fullPath, refresh)
</script>

<template>
  <aside class="sidebar">
    <RouterLink class="brand" :to="{ name: 'project-list' }">
      <span class="logo" />
      <span>crashtest</span>
    </RouterLink>

    <div class="side-section">
      <span class="side-section-label">Project</span>
      <select class="project-select" :value="currentProjectId" @change="onSelectProject">
        <option value="" disabled>Select a project…</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      <div class="side-actions">
        <RouterLink class="btn" :to="{ name: 'project-new' }">+ New</RouterLink>
        <RouterLink
          v-if="currentProjectId"
          class="btn"
          :to="{ name: 'project-edit', params: { id: currentProjectId } }"
        >
          Edit
        </RouterLink>
        <RouterLink class="btn" :to="{ name: 'project-list' }">All</RouterLink>
      </div>
    </div>

    <div class="side-section">
      <div class="side-head">
        <span>APIs</span>
        <RouterLink
          v-if="currentProjectId"
          class="side-add"
          :to="{ name: 'api-new', params: { projectId: currentProjectId } }"
        >
          + New
        </RouterLink>
      </div>

      <div v-if="!currentProjectId" class="side-empty">Select a project to see its APIs.</div>
      <div v-else-if="apisLoading" class="side-empty">Loading…</div>
      <div v-else-if="apisError" class="side-empty">{{ apisError }}</div>
      <div v-else-if="apis.length === 0" class="side-empty">No APIs yet.</div>
      <nav v-else class="side-nav">
        <RouterLink
          v-for="a in apis"
          :key="a.id"
          class="side-link"
          :class="{ active: a.id === currentApiId }"
          :to="{ name: 'intercept-list', params: { projectId: currentProjectId, apiId: a.id } }"
        >
          <span class="dot" :class="a.enabled ? 'on' : 'off'" :title="a.enabled ? 'enabled' : 'disabled'" />
          <span class="side-link-name">{{ a.name }}</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  flex: 0 0 260px;
  background: var(--panel);
  border-right: 1px solid var(--border);
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
  color: var(--text);
  text-decoration: none;
}
.brand:hover {
  text-decoration: none;
}
.brand .logo {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}

.side-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.side-section-label,
.side-head span {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.project-select {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  padding: 9px 10px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}
.project-select:focus {
  outline: none;
  border-color: var(--accent);
}

.side-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.side-actions .btn {
  padding: 6px 10px;
  font-size: 12px;
}

.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.side-add {
  font-size: 12px;
}

.side-empty {
  font-size: 12px;
  color: var(--muted);
  padding: 4px 2px;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.side-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius);
  color: var(--text);
  text-decoration: none;
  font-size: 13px;
  border: 1px solid transparent;
}
.side-link:hover {
  background: var(--panel-2);
  text-decoration: none;
}
.side-link.active {
  background: var(--panel-2);
  border-color: var(--border);
}
.side-link-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
  background: var(--muted);
}
.dot.on {
  background: var(--success);
}
.dot.off {
  background: var(--danger);
}

@media (max-width: 760px) {
  .sidebar {
    width: auto;
    flex: 1 1 auto;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
</style>
