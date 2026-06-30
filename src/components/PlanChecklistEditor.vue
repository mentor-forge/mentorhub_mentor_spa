<template>
  <div data-automation-id="plan-edit-checklist-section">
    <h2 class="text-h6 mb-4">Steps</h2>

    <div class="d-flex ga-2 mb-4 align-start">
      <v-text-field
        v-model="newStepText"
        label="Add step"
        variant="outlined"
        density="compact"
        hide-details="auto"
        :error-messages="addError"
        :disabled="saving"
        class="flex-grow-1"
        data-automation-id="plan-edit-checklist-add-input"
        @keyup.enter="addStep"
      />
      <v-btn
        color="primary"
        :disabled="saving"
        data-automation-id="plan-edit-checklist-add-button"
        @click="addStep"
      >
        Add
      </v-btn>
    </div>

    <p v-if="!checklist.length" class="text-medium-emphasis text-body-2 mb-2">
      No steps yet. Add your first step above.
    </p>

    <v-list
      v-if="checklist.length"
      density="compact"
      class="pa-0"
      data-automation-id="plan-edit-checklist-step-list"
    >
      <v-list-item
        v-for="(step, index) in checklist"
        :key="`${index}-${step}`"
        class="px-0"
      >
        <AutoSaveField
          :model-value="step"
          :label="`Step ${index + 1}`"
          :rules="[stepTextRule]"
          :on-save="(value: string | number) => updateStep(index, String(value))"
          :automation-id="`plan-edit-checklist-step-${index + 1}-input`"
          class="flex-grow-1"
        />

        <template #append>
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            :disabled="saving"
            :data-automation-id="`plan-edit-checklist-step-${index + 1}-delete-button`"
            @click="deleteStep(index)"
          />
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
export function stepTextRule(v: string | number): true | string {
  const str = String(v).trim()
  if (!str) return 'Step text is required'
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
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { AutoSaveField } from '@mentor-forge/mentorhub_spa_utils'

const props = defineProps<{
  checklist: string[]
  onSave: (checklist: string[]) => Promise<void>
}>()

const newStepText = ref('')
const addError = ref<string | null>(null)
const saving = ref(false)

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
</script>
