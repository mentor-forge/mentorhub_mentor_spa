<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    data-automation-id="profile-edit-schedule-encounters-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>Schedule Encounters</v-card-title>
      <v-card-text>
        <v-progress-linear v-if="isLoadingPlans" indeterminate color="primary" class="mb-4" />

        <v-select
          v-model="selectedPlanId"
          :items="plans"
          item-title="name"
          item-value="_id"
          label="Plan *"
          placeholder="Select an encounter plan"
          variant="outlined"
          density="comfortable"
          data-automation-id="schedule-encounters-plan-select"
        />

        <v-select
          v-model="selectedDay"
          :items="dayOptions"
          item-title="title"
          item-value="value"
          label="Day of Week *"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          data-automation-id="schedule-encounters-day-select"
        />

        <v-text-field
          v-model="selectedTime"
          type="time"
          label="Time of Day *"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          data-automation-id="schedule-encounters-time-input"
        />

        <v-text-field
          v-model="selectedStartDate"
          type="date"
          label="Start Date *"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          data-automation-id="schedule-encounters-start-date-input"
        />

        <v-text-field
          v-model.number="selectedCount"
          type="number"
          label="Count (1–52) *"
          min="1"
          max="52"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          data-automation-id="schedule-encounters-count-input"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          data-automation-id="schedule-encounters-cancel-button"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!isValid || loading"
          :loading="loading"
          data-automation-id="schedule-encounters-submit-button"
          @click="handleSubmit"
        >
          Schedule
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/api/client'
import type { Plan, ScheduleEncounterInput } from '@/api/types'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    mentorId: string
    menteeId: string
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: ScheduleEncounterInput): void
}>()

const dayOptions = [
  { title: 'Sunday', value: 0 },
  { title: 'Monday', value: 1 },
  { title: 'Tuesday', value: 2 },
  { title: 'Wednesday', value: 3 },
  { title: 'Thursday', value: 4 },
  { title: 'Friday', value: 5 },
  { title: 'Saturday', value: 6 },
]

const { data: plansData, isLoading: isLoadingPlans } = useQuery({
  queryKey: ['plans', 'all'],
  queryFn: () => api.getPlans({ size: 100 }),
  enabled: computed(() => props.modelValue),
})

const plans = computed((): Plan[] => plansData.value ?? [])

const selectedPlanId = ref<string>('')
const selectedDay = ref<number>(new Date().getDay())
const selectedTime = ref<string>('14:00')
const selectedStartDate = ref<string>(new Date().toISOString().slice(0, 10))
const selectedCount = ref<number>(4)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (plans.value.length > 0 && !selectedPlanId.value) {
        selectedPlanId.value = plans.value[0]._id
      }
    }
  },
  { immediate: true },
)

watch(
  plans,
  (loadedPlans) => {
    if (loadedPlans.length > 0 && !selectedPlanId.value) {
      selectedPlanId.value = loadedPlans[0]._id
    }
  },
  { immediate: true },
)

const isValid = computed(() => {
  return (
    Boolean(selectedPlanId.value) &&
    selectedDay.value !== null &&
    selectedDay.value !== undefined &&
    selectedDay.value >= 0 &&
    selectedDay.value <= 6 &&
    Boolean(selectedTime.value) &&
    Boolean(selectedStartDate.value) &&
    typeof selectedCount.value === 'number' &&
    selectedCount.value >= 1 &&
    selectedCount.value <= 52
  )
})

function handleCancel() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!isValid.value) return

  emit('submit', {
    mentor_id: props.mentorId,
    mentee_id: props.menteeId,
    plan_id: selectedPlanId.value,
    start_date: selectedStartDate.value,
    day_of_week: Number(selectedDay.value),
    time_of_day: selectedTime.value,
    recurrence_days: 7,
    count: Number(selectedCount.value),
  })
}
</script>
