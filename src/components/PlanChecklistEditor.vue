<template>
  <MhCard
    title="Checklist"
    color="primary"
    class="plan-checklist-editor"
    automation-id="plan-edit-checklist-section"
  >
    <div class="plan-checklist-add-row">
      <v-text-field
        ref="addInputRef"
        v-model="newStepText"
        placeholder="Add Todo"
        variant="outlined"
        density="comfortable"
        :error-messages="addError"
        :disabled="saving"
        class="plan-checklist-add-input"
        data-automation-id="plan-edit-checklist-add-input"
        hide-details="auto"
        @keyup.enter="addStep"
      />

      <v-btn
        icon="mdi-plus"
        color="primary"
        variant="flat"
        :disabled="saving"
        data-automation-id="plan-edit-checklist-add-button"
        @click="addStep"
      />
    </div>

    <div
      v-if="localChecklist.length"
      class="plan-checklist-todos"
      data-automation-id="plan-edit-checklist-step-list"
    >
      <div
        v-for="(todo, index) in localChecklist"
        :key="stepKeys[index]"
        class="plan-checklist-todo-row"
        :class="{
          'plan-checklist-todo-row--drag-over': dragOverIndex === index && draggedIndex !== index,
        }"
        @dragover.prevent="onDragOver(index)"
        @drop.prevent="onDrop(index)"
      >
        <v-btn
          icon="mdi-drag-vertical"
          variant="text"
          size="small"
          class="plan-checklist-drag-handle"
          :disabled="saving"
          :data-automation-id="`plan-edit-checklist-step-${index + 1}-drag-handle`"
          draggable="true"
          @dragstart.stop="onDragStart(index, $event)"
          @dragend="onDragEnd"
        />

        <v-text-field
          :model-value="draftTodos[index] ?? todo"
          placeholder="Todo item"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :disabled="saving"
          :error-messages="editErrors[index]"
          class="plan-checklist-todo-input"
          :data-automation-id="`plan-edit-checklist-step-${index + 1}-input`"
          @update:model-value="(value) => setDraftTodo(index, value)"
          @blur="() => saveTodo(index)"
        />

        <v-btn
          icon="mdi-delete"
          variant="text"
          size="small"
          color="error"
          :disabled="saving"
          :data-automation-id="`plan-edit-checklist-step-${index + 1}-delete-button`"
          @click="deleteStep(index)"
        />
      </div>
    </div>
  </MhCard>
</template>

<script lang="ts">
export function stepTextRule(v: string | number): true | string {
  const str = String(v).trim()
  if (!str) return true
  return /^[^\t\n]{1,255}$/.test(str) || 'Max 255 characters, no tabs or newlines'
}

export function appendChecklistItem(checklist: string[], item: string): string[] {
  return [...checklist, item]
}

export function updateChecklistItem(checklist: string[], index: number, value: string): string[] {
  const next = [...checklist]
  next[index] = value
  return next
}

export function removeChecklistItem(checklist: string[], index: number): string[] {
  return checklist.filter((_, i) => i !== index)
}

export function moveChecklistItem(checklist: string[], index: number, direction: -1 | 1): string[] {
  const target = index + direction
  if (target < 0 || target >= checklist.length) {
    return checklist
  }
  const next = [...checklist]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function reorderChecklistItem(checklist: string[], fromIndex: number, toIndex: number): string[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    fromIndex >= checklist.length ||
    toIndex < 0 ||
    toIndex >= checklist.length
  ) {
    return checklist
  }

  const next = [...checklist]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}
</script>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { MhCard } from '@mentor-forge/mentorhub_spa_utils'

const props = defineProps<{
  checklist: string[]
  onSave: (checklist: string[]) => Promise<void>
}>()

const newStepText = ref('')
const addError = ref<string | null>(null)
const editErrors = ref<Record<number, string>>({})
const localChecklist = ref<string[]>([])
const draftTodos = ref<string[]>([])
const saving = ref(false)
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const addInputRef = ref<{ focus: () => void } | null>(null)

let nextStepKey = 0
const stepKeys = ref<string[]>([])

function syncStepKeys(length: number) {
  while (stepKeys.value.length < length) {
    stepKeys.value.push(`step-${nextStepKey++}`)
  }
  if (stepKeys.value.length > length) {
    stepKeys.value = stepKeys.value.slice(0, length)
  }
}

watch(
  () => props.checklist,
  (checklist) => {
    if (saving.value) {
      return
    }

    if (localChecklist.value.length > checklist.length) {
      const extra = localChecklist.value.slice(checklist.length)
      localChecklist.value = [...checklist, ...extra]
      draftTodos.value = [...localChecklist.value]
      syncStepKeys(localChecklist.value.length)
      return
    }

    localChecklist.value = [...checklist]
    draftTodos.value = [...checklist]
    syncStepKeys(checklist.length)
  },
  { immediate: true, deep: true },
)

function setDraftTodo(index: number, value: string) {
  draftTodos.value[index] = value
  delete editErrors.value[index]
}

async function focusAddInput() {
  await nextTick()
  addInputRef.value?.focus()
}

function reorderStepKeys(fromIndex: number, toIndex: number) {
  const nextKeys = [...stepKeys.value]
  const [key] = nextKeys.splice(fromIndex, 1)
  nextKeys.splice(toIndex, 0, key)
  stepKeys.value = nextKeys
}

async function persistChecklist(next: string[]) {
  const previous = [...localChecklist.value]
  applyLocalChecklist(next)
  saving.value = true
  try {
    const persisted = next.filter((item) => item.trim())
    await props.onSave(persisted)
    addError.value = null
  } catch (error) {
    localChecklist.value = previous
    draftTodos.value = [...previous]
    syncStepKeys(previous.length)
    addError.value = error instanceof Error ? error.message : 'Failed to save checklist'
    throw error
  } finally {
    saving.value = false
  }
}

function applyLocalChecklist(next: string[]) {
  localChecklist.value = [...next]
  draftTodos.value = [...next]
  syncStepKeys(next.length)
}

async function addStep() {
  addError.value = null
  const text = newStepText.value.trim()
  const validation = stepTextRule(text)
  if (validation !== true) {
    addError.value = validation
    return
  }

  const next = appendChecklistItem(localChecklist.value, text)
  newStepText.value = ''

  if (!text) {
    applyLocalChecklist(next)
    await focusAddInput()
    return
  }

  try {
    await persistChecklist(next)
    await focusAddInput()
  } catch {
    // Error message shown via addError in persistChecklist
  }
}

async function saveTodo(index: number) {
  const value = draftTodos.value[index] ?? localChecklist.value[index]
  if (value === localChecklist.value[index]) {
    return
  }

  const validation = stepTextRule(value)
  if (validation !== true) {
    editErrors.value[index] = validation
    return
  }

  delete editErrors.value[index]
  const next = updateChecklistItem(localChecklist.value, index, value)

  if (!value.trim()) {
    applyLocalChecklist(next)
    return
  }

  try {
    await persistChecklist(next)
  } catch {
    draftTodos.value[index] = localChecklist.value[index]
  }
}

async function deleteStep(index: number) {
  delete editErrors.value[index]
  const next = removeChecklistItem(localChecklist.value, index)
  const hasPersistedItems = next.some((item) => item.trim())

  if (!hasPersistedItems) {
    applyLocalChecklist(next)
    try {
      await props.onSave([])
    } catch {
      addError.value = 'Failed to save checklist'
    }
    return
  }

  await persistChecklist(next)
}

function onDragStart(index: number, event: DragEvent) {
  if (saving.value) {
    event.preventDefault()
    return
  }

  draggedIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(index: number) {
  if (draggedIndex.value === null || draggedIndex.value === index) {
    return
  }
  dragOverIndex.value = index
}

async function onDrop(index: number) {
  const fromIndex = draggedIndex.value
  if (fromIndex === null || fromIndex === index) {
    return
  }

  const next = reorderChecklistItem(localChecklist.value, fromIndex, index)
  if (next === localChecklist.value) {
    return
  }

  reorderStepKeys(fromIndex, index)
  await persistChecklist(next)
  onDragEnd()
}

function onDragEnd() {
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>
