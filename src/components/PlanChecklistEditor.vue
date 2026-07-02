<template>
  <div data-automation-id="plan-edit-checklist-section">
    <h2 class="text-h6 mb-4">Steps</h2>

    <div class="plan-checklist-step-row plan-checklist-add-row d-flex ga-2 mb-6">
      <v-text-field
        v-model="newStepText"
        label="Add Step"
        variant="outlined"
        density="comfortable"
        :error-messages="addError"
        :disabled="saving"
        class="plan-checklist-step-input flex-grow-1"
        data-automation-id="plan-edit-checklist-add-input"
        @keyup.enter="addStep"
      />

      <div class="plan-checklist-step-actions d-flex flex-shrink-0 align-center">
        <v-btn
          icon="mdi-plus"
          color="primary"
          variant="flat"
          class="plan-checklist-add-button"
          :disabled="saving"
          data-automation-id="plan-edit-checklist-add-button"
          @click="addStep"
        />
      </div>
    </div>

    <p v-if="!checklist.length" class="text-medium-emphasis text-body-2 mb-2">
      No steps yet. Add your first step above.
    </p>

    <div
      v-if="checklist.length"
      class="plan-checklist-steps"
      data-automation-id="plan-edit-checklist-step-list"
    >
      <div
        v-for="(step, index) in checklist"
        :key="stepKeys[index]"
        class="plan-checklist-step-row d-flex ga-2 align-center"
        :class="{
          'plan-checklist-step-row--drag-over': dragOverIndex === index && draggedIndex !== index,
        }"
        @dragover.prevent="onDragOver(index)"
        @drop.prevent="onDrop(index)"
      >
        <v-btn
          icon="mdi-drag-vertical"
          variant="text"
          size="small"
          class="plan-checklist-drag-handle flex-shrink-0"
          :disabled="saving"
          :data-automation-id="`plan-edit-checklist-step-${index + 1}-drag-handle`"
          draggable="true"
          @dragstart.stop="onDragStart(index, $event)"
          @dragend="onDragEnd"
        />

        <AutoSaveField
          :model-value="step"
          :label="`Step ${index + 1}`"
          :rules="[stepTextRule]"
          :on-save="(value: string | number) => updateStep(index, String(value))"
          :automation-id="`plan-edit-checklist-step-${index + 1}-input`"
          class="plan-checklist-step-input flex-grow-1"
        />

        <div class="plan-checklist-step-actions d-flex flex-shrink-0">
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
    </div>
  </div>
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
import { ref, watch } from 'vue'
import { AutoSaveField } from '@mentor-forge/mentorhub_spa_utils'

const props = defineProps<{
  checklist: string[]
  onSave: (checklist: string[]) => Promise<void>
}>()

const newStepText = ref('')
const addError = ref<string | null>(null)
const saving = ref(false)
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

let nextStepKey = 0
const stepKeys = ref<string[]>([])

watch(
  () => props.checklist.length,
  (length) => {
    while (stepKeys.value.length < length) {
      stepKeys.value.push(`step-${nextStepKey++}`)
    }
    if (stepKeys.value.length > length) {
      stepKeys.value = stepKeys.value.slice(0, length)
    }
  },
  { immediate: true },
)

function reorderStepKeys(fromIndex: number, toIndex: number) {
  const nextKeys = [...stepKeys.value]
  const [key] = nextKeys.splice(fromIndex, 1)
  nextKeys.splice(toIndex, 0, key)
  stepKeys.value = nextKeys
}

async function persistChecklist(next: string[]) {
  saving.value = true
  try {
    await props.onSave(next)
  } finally {
    saving.value = false
  }
}

async function addStep() {
  const validation = stepTextRule(newStepText.value)
  if (validation !== true) {
    addError.value = validation
    return
  }

  addError.value = null
  const text = newStepText.value.trim()
  await persistChecklist(appendChecklistItem(props.checklist, text))
  newStepText.value = ''
}

async function updateStep(index: number, value: string) {
  await persistChecklist(updateChecklistItem(props.checklist, index, value))
}

async function deleteStep(index: number) {
  await persistChecklist(removeChecklistItem(props.checklist, index))
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

  const next = reorderChecklistItem(props.checklist, fromIndex, index)
  if (next === props.checklist) {
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

<style scoped>
.plan-checklist-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.plan-checklist-step-row {
  width: 100%;
}

.plan-checklist-step-row--drag-over {
  border-radius: 4px;
  outline: 2px dashed rgb(var(--v-theme-primary));
  outline-offset: 4px;
}

.plan-checklist-drag-handle {
  cursor: grab;
}

.plan-checklist-drag-handle:active {
  cursor: grabbing;
}

.plan-checklist-step-input :deep(.v-input) {
  margin-bottom: 0;
}

.plan-checklist-add-row {
  align-items: flex-start;
}

.plan-checklist-add-row .plan-checklist-step-actions {
  display: flex;
  align-items: center;
  align-self: flex-start;
  height: var(--v-field-control-height, 56px);
}

.plan-checklist-add-button {
  transform: scale(0.9);
}
</style>
