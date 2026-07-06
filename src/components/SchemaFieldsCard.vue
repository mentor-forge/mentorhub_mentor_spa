<template>
  <div class="schema-fields-card" :data-automation-id="automationId">
    <div class="schema-fields-card__header">
      <div class="schema-fields-card__title">{{ title }}</div>
    </div>

    <div class="schema-fields-card__body">
      <div
        v-for="(fieldKey, index) in fieldOrder"
        :key="fieldKey"
        class="schema-field-row"
        :class="{
          'schema-field-row--multiline': fieldDefs[fieldKey].textarea,
          'schema-field-row--drag-over': dragOverIndex === index && draggedIndex !== index,
        }"
        @dragover.prevent="onDragOver(index)"
        @drop.prevent="onDrop(index)"
      >
        <v-btn
          icon="mdi-drag-vertical"
          variant="text"
          size="x-small"
          density="compact"
          class="schema-field-row__drag-handle"
          :disabled="saving"
          draggable="true"
          @dragstart.stop="onDragStart(index, $event)"
          @dragend="onDragEnd"
        />

        <div class="schema-field-row__name">{{ fieldDefs[fieldKey].name }}</div>

        <div class="schema-field-row__value">
          <AutoSaveField
            v-if="fieldKey !== 'status'"
            :model-value="values[fieldKey]"
            label=""
            :rules="fieldDefs[fieldKey].rules"
            :hint="fieldDefs[fieldKey].hint"
            :textarea="fieldDefs[fieldKey].textarea"
            :rows="fieldDefs[fieldKey].rows"
            :on-save="(value: string | number) => onSaveField(fieldKey, String(value))"
            :automation-id="fieldDefs[fieldKey].automationId"
          />

          <AutoSaveSelect
            v-else
            :model-value="values.status"
            label=""
            :items="statusOptions"
            :on-save="(value: string) => onSaveField('status', value)"
            :automation-id="fieldDefs.status.automationId"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AutoSaveField, AutoSaveSelect } from '@mentor-forge/mentorhub_spa_utils'

export type SchemaFieldKey = 'name' | 'description' | 'status'

export interface SchemaFieldValues {
  name: string
  description: string
  status: string
}

interface SchemaFieldDef {
  name: string
  hint?: string
  rules?: Array<(v: string | number) => boolean | string>
  textarea?: boolean
  rows?: number
  automationId: string
}

const props = defineProps<{
  title: string
  values: SchemaFieldValues
  statusOptions: string[]
  fieldDefs: Record<SchemaFieldKey, SchemaFieldDef>
  onSaveField: (field: SchemaFieldKey, value: string) => Promise<void>
  automationId?: string
}>()

const saving = ref(false)
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const fieldOrder = ref<SchemaFieldKey[]>(['name', 'description', 'status'])

function reorderFields(fromIndex: number, toIndex: number) {
  const next = [...fieldOrder.value]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  fieldOrder.value = next
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

function onDrop(index: number) {
  const fromIndex = draggedIndex.value
  if (fromIndex === null || fromIndex === index) {
    return
  }

  reorderFields(fromIndex, index)
  onDragEnd()
}

function onDragEnd() {
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>
