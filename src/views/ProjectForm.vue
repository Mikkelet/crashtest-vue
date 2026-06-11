<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useProjects } from '../composables/useProjects'

const props = defineProps<{ id?: string }>()
const router = useRouter()
const { get, create, update } = useProjects()

const isEdit = computed(() => Boolean(props.id))

const form = reactive({
  id: '',
  name: '',
  description: '',
})

const submitting = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

onMounted(async () => {
  if (!props.id) return
  loading.value = true
  try {
    const p = await get(props.id)
    form.id = p.id
    form.name = p.name
    form.description = p.description ?? ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load project'
  } finally {
    loading.value = false
  }
})

function validate(): string | null {
  if (!isEdit.value && !form.id.trim()) return 'ID is required'
  if (!form.name.trim()) return 'Name is required'
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
        description,
      })
    } else {
      await create({
        id: form.id.trim(),
        name: form.name.trim(),
        description,
      })
    }
    router.push({ name: 'project-list' })
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
      <h1>{{ isEdit ? 'Edit project' : 'New project' }}</h1>
      <div class="sub">A project groups together a set of related APIs.</div>
    </div>
    <RouterLink class="btn" :to="{ name: 'project-list' }">Cancel</RouterLink>
  </div>

  <div v-if="error" class="error" style="margin-bottom: 12px">{{ error }}</div>

  <form class="panel form" @submit.prevent="onSubmit">
    <div v-if="loading" class="empty">Loading…</div>
    <template v-else>
      <div class="field">
        <label for="id">ID</label>
        <input
          id="id"
          v-model="form.id"
          :disabled="isEdit"
          placeholder="e.g. payments"
          autocomplete="off"
        />
        <div class="hint">Stable identifier. Cannot be changed later.</div>
      </div>

      <div class="field">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" placeholder="e.g. Payments" autocomplete="off" />
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

      <div class="form-actions">
        <RouterLink class="btn" :to="{ name: 'project-list' }">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create project' }}
        </button>
      </div>
    </template>
  </form>
</template>
