<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="name"
            :label="nameLabel"
            :rules="nameRules"
            :hint="nameHint"
            persistent-hint
            required
            :data-automation-id="nameInputAutomationId"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          :data-automation-id="cancelButtonAutomationId"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="loading"
          :data-automation-id="submitButtonAutomationId"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { validationRules } from '@mentor-forge/mentorhub_spa_utils'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  nameLabel?: string
  nameHint?: string
  submitLabel?: string
  loading?: boolean
  nameInputAutomationId: string
  cancelButtonAutomationId: string
  submitButtonAutomationId: string
}>(), {
  title: 'Create',
  nameLabel: 'Name *',
  nameHint: 'No whitespace, max 40 characters',
  submitLabel: 'Create',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [name: string]
}>()

const formRef = ref()
const name = ref('')

const nameRules = [validationRules.required, validationRules.namePattern]

watch(() => props.modelValue, (open) => {
  if (open) {
    name.value = ''
  }
})

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (valid) {
    emit('submit', name.value)
  }
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>
