<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useApis } from '../composables/useApis'
import { useIntercepts } from '../composables/useIntercepts'
import type { API } from '../types/api'

const props = defineProps<{ apiId: string }>()

const { get: getApi } = useApis()
const { rules, loading, error, load, remove, update } = useIntercepts(props.apiId)
const toggling = ref<Record<string, boolean>>({})

const api = ref<API | null>(null)

onMounted(async () => {
  try {
    api.value = await getApi(props.apiId)
  } catch {
    // ignore — the rules list will still load or show its own error
  }
  await load()
})

async function onDelete(id: string, name: string) {
  if (!confirm(`Delete intercept rule "${name}"?`)) return
  try {
    await remove(id)
    await load()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete')
  }
}

async function onToggle(id: string, next: boolean) {
  toggling.value[id] = true
  const rule = rules.value.find((r) => r.id === id)
  const prev = rule?.enabled
  if (rule) rule.enabled = next
  try {
    await update(id, { enabled: next })
  } catch (e) {
    if (rule && prev !== undefined) rule.enabled = prev
    alert(e instanceof Error ? e.message : 'Failed to update')
  } finally {
    delete toggling.value[id]
  }
}
</script>

<template>
  <div class="header">
    <div>
      <h1>Intercepts</h1>
      <div class="sub">
        <RouterLink :to="{ name: 'list' }">APIs</RouterLink>
        <span> / </span>
        <span>{{ api?.name ?? apiId }}</span>
      </div>
    </div>
    <RouterLink
      class="btn btn-primary"
      :to="{ name: 'intercept-new', params: { apiId } }"
    >
      + New rule
    </RouterLink>
  </div>

  <div v-if="error" class="error" style="margin-bottom: 12px">{{ error }}</div>

  <div class="panel">
    <div v-if="loading" class="empty">Loading…</div>
    <div v-else-if="rules.length === 0" class="empty">
      No rules yet. Requests to this API are forwarded to the upstream as-is.
    </div>
    <ul v-else class="list">
      <li v-for="r in rules" :key="r.id">
        <div>
          <div class="name">{{ r.name }}</div>
          <div class="url">
            <span class="method">{{ r.method }}</span>
            {{ r.path_pattern }}
            →
            <span class="status">{{ r.status_code }}</span>
            <span v-if="r.delay_ms > 0" class="delay">+{{ r.delay_ms }}ms</span>
          </div>
          <div class="meta">
            <span class="badge">priority: {{ r.priority }}</span>
            <label class="toggle" :class="{ on: r.enabled }">
              <input
                type="checkbox"
                :checked="r.enabled"
                :disabled="!!toggling[r.id]"
                @change="onToggle(r.id, ($event.target as HTMLInputElement).checked)"
              />
              <span class="track"><span class="thumb" /></span>
              <span class="toggle-label">{{ r.enabled ? 'enabled' : 'disabled' }}</span>
            </label>
          </div>
        </div>
        <div class="actions">
          <RouterLink
            class="btn"
            :to="{ name: 'intercept-edit', params: { apiId, id: r.id } }"
          >
            Edit
          </RouterLink>
          <button class="btn btn-danger" @click="onDelete(r.id, r.name)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.method {
  display: inline-block;
  font-weight: 600;
  color: var(--accent);
  margin-right: 6px;
}
.status {
  font-weight: 600;
  color: var(--success);
}
.delay {
  margin-left: 8px;
  color: var(--muted);
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}
.toggle .track {
  position: relative;
  display: inline-block;
  width: 28px;
  height: 16px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.toggle .thumb {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 12px;
  height: 12px;
  background: var(--muted);
  border-radius: 50%;
  transition: transform 0.15s ease, background 0.15s ease;
}
.toggle.on .track {
  background: rgba(81, 207, 102, 0.18);
  border-color: var(--success);
}
.toggle.on .thumb {
  transform: translateX(12px);
  background: var(--success);
}
.toggle-label {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.toggle.on .toggle-label {
  color: var(--success);
}
.toggle input:disabled ~ .track {
  opacity: 0.5;
}
</style>
