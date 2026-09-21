<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

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
  <div class="sentence-field" data-automation-id="sentence-field">
    <label v-if="label" class="sentence-field__label">{{ label }}</label>
    <div
      v-if="readonly"
      class="sentence-field__display"
      data-automation-id="sentence-field-display"
    >
      {{ modelValue }}
    </div>
    <textarea
      v-else
      ref="textareaRef"
      class="sentence-field__input"
      data-automation-id="sentence-field-input"
      :value="modelValue"
      rows="1"
      @input="onInput"
      @blur="emit('blur', $event)"
    />
  </div>
</template>

<style scoped>
.sentence-field {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sentence-field__label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.sentence-field__display {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.sentence-field__input {
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
