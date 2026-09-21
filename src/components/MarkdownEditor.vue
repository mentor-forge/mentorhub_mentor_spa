<template>
  <template v-if="visible">
    <v-textarea
      v-if="editable"
      :model-value="currentValue"
      @update:model-value="handleInput"
      @blur="handleBlur"
      :label="label"
      :disabled="saving"
      :error="!!error"
      :error-messages="error"
      :hint="hint"
      :rules="resolvedRules"
      :rows="rows"
      auto-grow
      variant="outlined"
      density="comfortable"
      class="markdown-editor"
      :data-automation-id="props.automationId"
    >
      <template v-if="saving" #append-inner>
        <v-progress-circular size="16" width="2" indeterminate color="primary" />
      </template>
      <template v-else-if="saved" #append-inner>
        <v-icon size="16" color="success">mdi-check</v-icon>
      </template>
    </v-textarea>

    <div
      v-else
      class="markdown-editor markdown-editor--display"
      :data-automation-id="props.automationId"
    >
      <div
        class="markdown-editor__container"
        :data-automation-id="resolvedDisplayAutomationId"
      >
        <div v-if="label" class="markdown-editor__display-label text-caption text-medium-emphasis mb-1">
          {{ label }}
        </div>
        <div
          class="markdown-editor__display-value"
          data-automation-id="markdown-field-display"
          v-html="renderedMarkdown"
        />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import {
  useDataCardContext,
  resolveDataCardModel,
  validationRules,
} from '@mentor-forge/mentorhub_spa_utils'

// GFM line breaks and formatting
marked.setOptions({
  breaks: true,
  gfm: true,
})

export interface MarkdownEditorProps {
  field?: string
  modelValue?: string | number
  onSave?: (value: any) => Promise<void> | void
  editable?: boolean
  visible?: boolean
  automationId?: string
  label?: string
  hint?: string
  rules?: Array<(v: any) => true | string>
  rows?: number
}

const props = withDefaults(defineProps<MarkdownEditorProps>(), {
  editable: true,
  visible: true,
  rows: 4,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
}>()

const context = useDataCardContext()

/** Prefer injected DataCard context model over standalone modelValue. */
const sourceValue = computed<string | number | undefined>(() => {
  if (props.field && context) {
    const model = resolveDataCardModel(context)
    return model?.[props.field] as string | number | undefined
  }
  return props.modelValue
})

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)
const currentValue = ref<string | number | undefined>(sourceValue.value)

watch(sourceValue, (newValue) => {
  currentValue.value = newValue
})

const resolvedRules = computed(() => props.rules ?? [validationRules.markdownPattern])

const resolvedDisplayAutomationId = computed(() => {
  if (!props.automationId) return undefined
  return props.automationId.endsWith('-display')
    ? props.automationId
    : `${props.automationId}-display`
})

const renderedMarkdown = computed(() => {
  const raw = currentValue.value
  if (raw === undefined || raw === null || raw === '') {
    return '—'
  }
  const str = String(raw)
  try {
    const rawHtml = marked.parse(str) as string
    return DOMPurify.sanitize(rawHtml)
  } catch (err) {
    console.error('Markdown parse error:', err)
    return DOMPurify.sanitize(str)
  }
})

function handleInput(value: string | number) {
  currentValue.value = value
  saved.value = false
  error.value = null
  emit('update:modelValue', String(value))
}

async function handleBlur(event?: FocusEvent) {
  if (event) {
    emit('blur', event)
  }

  if (currentValue.value === sourceValue.value) {
    return
  }

  saving.value = true
  error.value = null
  saved.value = false

  try {
    if (props.field && context) {
      await context.onSave(props.field, currentValue.value)
    } else if (props.onSave) {
      await props.onSave(currentValue.value)
    }
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 2000)
  } catch (err: any) {
    error.value = err?.message || 'Failed to save'
    console.error('Auto-save error:', err)
  } finally {
    saving.value = false
  }
}

defineExpose({
  currentValue,
  saving,
  saved,
  error,
  handleInput,
  handleBlur,
})
</script>

<style scoped>
.markdown-editor {
  width: 100%;
}

.markdown-editor--display {
  width: 100%;
}

.markdown-editor__container {
  width: 100%;
}

.markdown-editor__display-label {
  line-height: 1.2;
}

.markdown-editor__display-value {
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-editor__display-value :deep(h1),
.markdown-editor__display-value :deep(h2),
.markdown-editor__display-value :deep(h3),
.markdown-editor__display-value :deep(h4),
.markdown-editor__display-value :deep(h5),
.markdown-editor__display-value :deep(h6) {
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  line-height: 1.25;
}

.markdown-editor__display-value :deep(h1) { font-size: 1.4rem; }
.markdown-editor__display-value :deep(h2) { font-size: 1.25rem; }
.markdown-editor__display-value :deep(h3) { font-size: 1.1rem; }
.markdown-editor__display-value :deep(h4) { font-size: 1rem; }

.markdown-editor__display-value :deep(p) {
  margin-bottom: 0.5rem;
}

.markdown-editor__display-value :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-editor__display-value :deep(ul),
.markdown-editor__display-value :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.markdown-editor__display-value :deep(code) {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-editor__display-value :deep(pre) {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.markdown-editor__display-value :deep(blockquote) {
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  padding-left: 0.75rem;
  margin-left: 0;
  margin-bottom: 0.5rem;
  color: rgba(0, 0, 0, 0.7);
}
</style>
