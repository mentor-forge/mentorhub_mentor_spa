<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    readonly?: boolean
    label?: string
  }>(),
  {
    modelValue: '',
    readonly: false,
    label: undefined,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const renderedMarkdown = computed(() => {
  if (!props.modelValue) return ''
  const escaped = escapeHtml(props.modelValue)
  // Bold **text**
  let result = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic *text*
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Line breaks
  result = result.replace(/\n/g, '<br />')
  return result
})

function adjustHeight() {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  adjustHeight()
}

watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      adjustHeight()
    })
  }
)

onMounted(() => {
  if (!props.readonly) {
    adjustHeight()
  }
})
</script>

<template>
  <div class="markdown-sentence-field" data-automation-id="markdown-sentence-field">
    <label v-if="label" class="markdown-sentence-field__label">{{ label }}</label>
    <div
      v-if="readonly"
      class="markdown-sentence-field__display"
      data-automation-id="markdown-sentence-field-display"
      v-html="renderedMarkdown"
    />
    <textarea
      v-else
      ref="textareaRef"
      class="markdown-sentence-field__input"
      data-automation-id="markdown-sentence-field-input"
      :value="modelValue"
      @input="onInput"
      @blur="emit('blur', $event)"
    />
  </div>
</template>

<style scoped>
.markdown-sentence-field {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.markdown-sentence-field__label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.markdown-sentence-field__display {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.markdown-sentence-field__input {
  width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-height: 40vh;
  resize: vertical;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
}
</style>
