<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useApis } from '../composables/useApis'
import { useProjects } from '../composables/useProjects'
import type { API } from '../types/api'

const props = defineProps<{ projectId: string }>()

const { remove } = useApis()
const { listAPIs } = useProjects()

const apis = ref<API[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    apis.value = await listAPIs(props.projectId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load APIs'
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function onDelete(id: string, name: string) {
  if (!confirm(`Delete API "${name}"? This cannot be undone.`)) return
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
    <h1>APIs</h1>
    <RouterLink class="btn btn-primary" :to="{ name: 'api-new', params: { projectId } }">
      + New API
    </RouterLink>
  </div>

  <div v-if="error" class="error">{{ error }}</div>

  <div class="panel">
    <div v-if="loading" class="empty">Loading…</div>
    <div v-else-if="apis.length === 0" class="empty">
      No APIs in this project yet. Click <strong>New API</strong> to register one.
    </div>
    <ul v-else class="list">
      <li v-for="api in apis" :key="api.id">
        <div>
          <div class="name">{{ api.name }}</div>
          <div class="url">{{ api.base_url }}</div>
          <div class="meta">
            <span class="badge">id: {{ api.id }}</span>
            <span class="badge">proxy: /p/{{ api.id }}/</span>
            <span :class="['badge', api.enabled ? 'on' : 'off']">
              {{ api.enabled ? 'enabled' : 'disabled' }}
            </span>
          </div>
        </div>
        <div class="actions">
          <RouterLink
            class="btn"
            :to="{ name: 'intercept-list', params: { projectId, apiId: api.id } }"
          >
            Intercepts
          </RouterLink>
          <RouterLink class="btn" :to="{ name: 'api-edit', params: { projectId, id: api.id } }">
            Edit
          </RouterLink>
          <button class="btn btn-danger" @click="onDelete(api.id, api.name)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>
