<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useIntercepts } from '../composables/useIntercepts'
import { INTERCEPT_METHODS, type InterceptMethod } from '../types/intercept'

const props = defineProps<{ projectId: string; apiId: string; id?: string }>()
const router = useRouter()
const { get, create, update } = useIntercepts(props.apiId)

const isEdit = computed(() => Boolean(props.id))

interface HeaderRow {
  key: string
  value: string
}

const form = reactive({
  name: '',
  method: 'ANY' as InterceptMethod,
  path_pattern: '/',
  priority: 0,
  status_code: 200,
  response_body: '',
  delay_ms: 0,
  enabled: true,
  headers: [{ key: '', value: '' }] as HeaderRow[],
})

const submitting = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

onMounted(async () => {
  if (!props.id) return
  loading.value = true
  try {
    const r = await get(props.id)
    form.name = r.name
    form.method = r.method
    form.path_pattern = r.path_pattern
    form.priority = r.priority
    form.status_code = r.status_code
    form.response_body = r.response_body
    form.delay_ms = r.delay_ms
    form.enabled = r.enabled
    const entries = Object.entries(r.response_headers ?? {})
    form.headers = entries.length > 0
      ? entries.map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load rule'
  } finally {
    loading.value = false
  }
})

function addHeader() {
  form.headers.push({ key: '', value: '' })
}
function removeHeader(i: number) {
  form.headers.splice(i, 1)
  if (form.headers.length === 0) form.headers.push({ key: '', value: '' })
}

function buildHeaders(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { key, value } of form.headers) {
    const k = key.trim()
    if (k) out[k] = value
  }
  return out
}

function validate(): string | null {
  if (!form.name.trim()) return 'Name is required'
  if (!form.path_pattern.trim()) return 'Path pattern is required'
  if (!form.path_pattern.startsWith('/')) return 'Path pattern must start with /'
  if (form.status_code !== 0 && (form.status_code < 100 || form.status_code > 599))
    return 'Status code must be 0 (forward) or 100–599'
  if (form.delay_ms < 0 || form.delay_ms > 60000) return 'Delay must be 0–60000 ms'
  return null
}

async function onSubmit() {
  error.value = null
  const v = validate()
  if (v) {
    error.value = v
    return
  }
  submitting.value = true
  try {
    const payload = {
      name: form.name.trim(),
      method: form.method,
      path_pattern: form.path_pattern.trim(),
      priority: form.priority,
      status_code: form.status_code,
      response_headers: buildHeaders(),
      response_body: form.response_body,
      delay_ms: form.delay_ms,
      enabled: form.enabled,
    }
    if (isEdit.value) {
      await update(props.id!, payload)
    } else {
      await create(payload)
    }
    router.push({ name: 'intercept-list', params: { projectId: props.projectId, apiId: props.apiId } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="header">
    <div>
      <h1>{{ isEdit ? 'Edit rule' : 'New rule' }}</h1>
      <div class="sub">
        <RouterLink :to="{ name: 'project-list' }">Projects</RouterLink>
        <span> / </span>
        <RouterLink :to="{ name: 'api-list', params: { projectId } }">APIs</RouterLink>
        <span> / </span>
        <RouterLink :to="{ name: 'intercept-list', params: { projectId, apiId } }">Intercepts</RouterLink>
        <span> / </span>
        <span>{{ isEdit ? 'Edit' : 'New' }}</span>
      </div>
    </div>
    <RouterLink class="btn" :to="{ name: 'intercept-list', params: { projectId, apiId } }">Cancel</RouterLink>
  </div>

  <div v-if="error" class="error" style="margin-bottom: 12px">{{ error }}</div>

  <form class="panel form" @submit.prevent="onSubmit">
    <div v-if="loading" class="empty">Loading…</div>
    <template v-else>
      <div class="field">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" placeholder="e.g. Mock checkout 500" autocomplete="off" />
      </div>

      <div class="field-row">
        <div class="field">
          <label for="method">Method</label>
          <select id="method" v-model="form.method">
            <option v-for="m in INTERCEPT_METHODS" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="field grow">
          <div class="label-row">
            <label for="path">Path pattern</label>
            <span class="help" tabindex="0" aria-label="Path pattern syntax help">
              i
              <span class="tooltip" role="tooltip">
                <span class="tip-lead">
                  Matched against the path after <code>/p/{{ apiId }}</code>.
                  <code>*</code> matches one segment, <code>**</code> matches across segments.
                </span>
                <span class="examples">
                  <code>/orders</code><span>exact path</span>
                  <code>/orders/*</code><span>one segment — <code>/orders/42</code></span>
                  <code>/orders/**</code><span>any sub-path — <code>/orders/42/items</code></span>
                  <code>/**</code><span>everything</span>
                </span>
              </span>
            </span>
          </div>
          <input
            id="path"
            v-model="form.path_pattern"
            placeholder="/v1/checkout/*"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="status">Status code</label>
          <input id="status" v-model.number="form.status_code" type="number" min="0" max="599" />
          <div class="hint">Use <code>0</code> to forward the upstream response (still applies delay).</div>
        </div>
        <div class="field">
          <label for="delay">Delay (ms)</label>
          <input id="delay" v-model.number="form.delay_ms" type="number" min="0" max="60000" />
        </div>
        <div class="field">
          <label for="priority">Priority</label>
          <input id="priority" v-model.number="form.priority" type="number" />
          <div class="hint">Higher wins.</div>
        </div>
      </div>

      <div class="field">
        <label>Response headers</label>
        <div v-for="(h, i) in form.headers" :key="i" class="header-row">
          <input v-model="h.key" placeholder="Header name" autocomplete="off" />
          <input v-model="h.value" placeholder="Value" autocomplete="off" />
          <button
            type="button"
            class="btn btn-danger"
            @click="removeHeader(i)"
            :disabled="form.headers.length === 1 && !h.key && !h.value"
          >
            ✕
          </button>
        </div>
        <button type="button" class="btn" @click="addHeader" style="justify-self: start">
          + Add header
        </button>
      </div>

      <div class="field">
        <label for="body">Response body</label>
        <textarea
          id="body"
          v-model="form.response_body"
          rows="6"
          placeholder='{"error": "service unavailable"}'
        />
        <div class="hint">Returned verbatim. Set a matching <code>Content-Type</code> header.</div>
      </div>

      <div class="field row">
        <input id="enabled" type="checkbox" v-model="form.enabled" />
        <label for="enabled" style="margin: 0; text-transform: none; letter-spacing: 0; color: var(--text)">
          Enabled
        </label>
      </div>

      <div class="form-actions">
        <RouterLink class="btn" :to="{ name: 'intercept-list', params: { projectId, apiId } }">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create rule' }}
        </button>
      </div>
    </template>
  </form>
</template>

<style scoped>
.field-row {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 16px;
  /* Top-align so a field without a hint (e.g. Method) keeps its control at its
     natural height instead of stretching to match a taller neighbour. */
  align-items: start;
}
.field-row:has(> .field:nth-child(3)) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.field.grow {
  min-width: 0;
}
.field select {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
}
.field select:focus {
  outline: none;
  border-color: var(--accent);
}
.label-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.help {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 10px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  cursor: help;
}
.help:hover,
.help:focus-visible {
  border-color: var(--accent);
  color: var(--text);
  outline: none;
}
.tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 10;
  width: 300px;
  max-width: 70vw;
  padding: 10px 12px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--muted);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.12s ease;
  pointer-events: none;
}
.tooltip code {
  background: var(--bg);
}
.tip-lead {
  display: block;
}
.examples {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px 12px;
  margin-top: 10px;
  align-items: baseline;
}
.examples > code {
  justify-self: start;
  white-space: nowrap;
}
.examples > span {
  color: var(--muted);
}
.help:hover .tooltip,
.help:focus .tooltip {
  opacity: 1;
  visibility: visible;
}
.header-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 8px;
  margin-bottom: 6px;
}
.header-row input {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  padding: 8px 10px;
  font-size: 13px;
}
.header-row input:focus {
  outline: none;
  border-color: var(--accent);
}
code {
  background: var(--panel-2);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 12px;
}

@media (max-width: 640px) {
  /* Stack method/path and status/delay/priority into a single column
     so number inputs stay comfortably tappable */
  .field-row,
  .field-row:has(> .field:nth-child(3)) {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
}
</style>
