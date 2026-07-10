<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    :data-automation-id="`${automationPrefix}-dialog`"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

        <v-alert
          v-else-if="plans.length === 0"
          type="info"
          variant="tonal"
          :data-automation-id="`${automationPrefix}-empty`"
        >
          No encounter plans yet.
          <router-link to="/plans">Create a plan</router-link>
          to get started.
        </v-alert>

        <v-list
          v-else
          :data-automation-id="`${automationPrefix}-list`"
        >
          <v-list-item
            v-for="plan in plans"
            :key="plan._id"
            :active="selectedPlanId === plan._id"
            :data-automation-id="`${automationPrefix}-item`"
            @click="selectPlan(plan._id)"
          >
            <template #prepend>
              <v-list-item-action start>
                <v-checkbox-btn :model-value="selectedPlanId === plan._id" />
              </v-list-item-action>
            </template>
            <v-list-item-title>{{ plan.name || 'Unnamed Plan' }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ plan.description || 'No description' }}
              · Steps: {{ plan.checklist?.length ?? 0 }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <p
          v-if="validationMessage"
          class="text-error text-caption mt-2"
          :data-automation-id="`${automationPrefix}-validation`"
        >
          {{ validationMessage }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          :data-automation-id="`${automationPrefix}-cancel-button`"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="loading || isLoading || plans.length === 0"
          :data-automation-id="`${automationPrefix}-submit-button`"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { validatePlanSelection } from './planSelectValidation'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  submitLabel?: string
  loading?: boolean
  automationPrefix?: string
}>(), {
  title: 'Select Encounter Plan',
  submitLabel: 'Start Encounter',
  loading: false,
  automationPrefix: 'plan-select',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [planId: string]
}>()

const selectedPlanId = ref('')
const validationMessage = ref('')

const { data, isLoading } = useQuery({
  queryKey: ['plans'],
  queryFn: () => api.getPlans(),
  enabled: computed(() => props.modelValue),
})

const plans = computed(() => data.value ?? [])

watch(() => props.modelValue, (open) => {
  if (open) {
    selectedPlanId.value = ''
    validationMessage.value = ''
  }
})

function selectPlan(planId: string) {
  selectedPlanId.value = planId
  validationMessage.value = ''
}

function handleSubmit() {
  const message = validatePlanSelection(selectedPlanId.value)
  if (message) {
    validationMessage.value = message
    return
  }
  validationMessage.value = ''
  emit('submit', selectedPlanId.value)
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>
