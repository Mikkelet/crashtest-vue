<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useApis } from '../composables/useApis'

const props = defineProps<{ projectId: string; id?: string }>()
const router = useRouter()
const { get, create, update } = useApis()

const isEdit = computed(() => Boolean(props.id))

const form = reactive({
  id: '',
  name: '',
  base_url: '',
  description: '',
  enabled: true,
})

const submitting = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

onMounted(async () => {
  if (!props.id) return
  loading.value = true
  try {
    const a = await get(props.id)
    form.id = a.id
    form.name = a.name
    form.base_url = a.base_url
    form.description = a.description ?? ''
    form.enabled = a.enabled
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load API'
  } finally {
    loading.value = false
  }
})

function validate(): string | null {
  if (!form.name.trim()) return 'Name is required'
  if (!form.base_url.trim()) return 'Base URL is required'
  try {
    const u = new URL(form.base_url.trim())
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return 'Base URL must use http or https'
    }
  } catch {
    return 'Base URL is not a valid URL'
  }
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
    const description = form.description.trim() ? form.description.trim() : null
    if (isEdit.value) {
      await update(props.id!, {
        name: form.name.trim(),
        base_url: form.base_url.trim(),
        description,
        enabled: form.enabled,
      })
    } else {
      await create({
        project_id: props.projectId,
        name: form.name.trim(),
        base_url: form.base_url.trim(),
        description,
        enabled: form.enabled,
      })
    }
    router.push({ name: 'api-list', params: { projectId: props.projectId } })
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
      <h1>{{ isEdit ? 'Edit API' : 'New API' }}</h1>
      <div class="sub">
        Associate a friendly name with the upstream base URL the proxy should forward to.
      </div>
    </div>
    <RouterLink class="btn" :to="{ name: 'api-list', params: { projectId } }">Cancel</RouterLink>
  </div>

  <div v-if="error" class="error" style="margin-bottom: 12px">{{ error }}</div>

  <form class="panel form" @submit.prevent="onSubmit">
    <div v-if="loading" class="empty">Loading…</div>
    <template v-else>
      <div v-if="isEdit" class="field">
        <label for="id">ID</label>
        <input id="id" v-model="form.id" disabled autocomplete="off" />
        <div class="hint">
          Stable identifier. The proxy serves this API at <code>/p/{{ form.id }}/…</code>.
        </div>
      </div>

      <div class="field">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" placeholder="e.g. Stripe Payments" autocomplete="off" />
        <div v-if="!isEdit" class="hint">
          A unique, URL-safe ID is generated automatically from the name and used as the
          proxy path <code>/p/&lt;id&gt;/…</code>.
        </div>
      </div>

      <div class="field">
        <label for="base_url">Base URL</label>
        <input
          id="base_url"
          v-model="form.base_url"
          placeholder="https://api.stripe.com"
          autocomplete="off"
          inputmode="url"
        />
        <div class="hint">Requests to this API will be forwarded here.</div>
      </div>

      <div class="field">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Optional notes"
        />
      </div>

      <div class="field row">
        <input id="enabled" type="checkbox" v-model="form.enabled" />
        <label for="enabled" style="margin: 0; text-transform: none; letter-spacing: 0; color: var(--text)">
          Enabled
        </label>
      </div>

      <div class="form-actions">
        <RouterLink class="btn" :to="{ name: 'api-list', params: { projectId } }">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create API' }}
        </button>
      </div>
    </template>
  </form>
</template>

<style scoped>
code {
  background: var(--panel-2);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
