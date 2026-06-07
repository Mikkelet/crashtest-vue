<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useApis } from '../composables/useApis'

const { apis, loading, error, load, remove } = useApis()

onMounted(load)

async function onDelete(id: string, name: string) {
  if (!confirm(`Delete API "${name}"? This cannot be undone.`)) return
  try {
    await remove(id)
    await load()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete')
  }
}
</script>

<template>
  <div class="header">
    <div>
      <h1>APIs</h1>
      <div class="sub">Register upstream APIs and the base URL they proxy to.</div>
    </div>
    <RouterLink class="btn btn-primary" :to="{ name: 'new' }">+ New API</RouterLink>
  </div>

  <div v-if="error" class="error">{{ error }}</div>

  <div class="panel">
    <div v-if="loading" class="empty">Loading…</div>
    <div v-else-if="apis.length === 0" class="empty">
      No APIs yet. Click <strong>New API</strong> to register one.
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
          <RouterLink class="btn" :to="{ name: 'intercept-list', params: { apiId: api.id } }">
            Intercepts
          </RouterLink>
          <RouterLink class="btn" :to="{ name: 'edit', params: { id: api.id } }">Edit</RouterLink>
          <button class="btn btn-danger" @click="onDelete(api.id, api.name)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>
