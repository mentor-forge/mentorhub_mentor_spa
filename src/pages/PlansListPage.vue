<template>
  <DashboardPageLayout
    title="Plans"
    heading-automation-id="plan-list-heading"
    :is-loading="isLoading"
    :show-empty="!isLoading && plans.length === 0"
    empty-automation-id="plan-list-empty"
    empty-message="No encounter plans yet. Create one to get started."
    :show-error="showError as unknown as boolean"
    :error-message="errorMessage"
    error-prefix="Failed to load plans: "
  >
    <template #header-actions>
      <v-btn
        color="primary"
        data-automation-id="plan-list-new-button"
        @click="showCreateDialog = true"
      >
        <v-icon start>mdi-plus</v-icon>
        New Plan
      </v-btn>
    </template>

    <DashboardCardGrid>
      <v-col
        v-for="plan in plans"
        :key="plan._id"
        cols="12"
        sm="6"
        md="4"
      >
        <DashboardCard
          automation-id="plan-list-card"
          @click="navigateToPlan(plan)"
        >
          <template #title>
            {{ plan.name || 'Unnamed Plan' }}
          </template>

          <p class="dashboard-card__description text-medium-emphasis">
            {{ plan.description || 'No description' }}
          </p>

          <v-chip size="small" color="primary" variant="tonal">
            Steps: {{ plan.checklist?.length ?? 0 }}
          </v-chip>
        </DashboardCard>
      </v-col>
    </DashboardCardGrid>

    <NamePromptDialog
      v-model="showCreateDialog"
      title="New Plan"
      name-label="Plan Name *"
      submit-label="Create Plan"
      :loading="isCreating"
      name-input-automation-id="plan-list-new-name-input"
      cancel-button-automation-id="plan-list-new-cancel-button"
      submit-button-automation-id="plan-list-new-submit-button"
      @submit="handleCreatePlan"
    />
  </DashboardPageLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { Plan, PlanInput } from '@/api/types'
import {
  DashboardPageLayout,
  DashboardCardGrid,
  DashboardCard,
  NamePromptDialog,
} from '@/components/dashboard'

const router = useRouter()
const queryClient = useQueryClient()
const showCreateDialog = ref(false)

const { data, isLoading, error: queryError } = useQuery({
  queryKey: ['plans'],
  queryFn: () => api.getPlans(),
})

const plans = computed(() => data.value ?? [])

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const { mutate: createPlan, isPending: isCreating } = useMutation<{ _id: string }, Error, PlanInput>({
  mutationFn: (payload: PlanInput) => api.createPlan(payload),
  onSuccess: (response) => {
    queryClient.invalidateQueries({ queryKey: ['plans'] })
    showCreateDialog.value = false
    errorRef.value = null
    router.push(`/plans/${response._id}`)
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

function navigateToPlan(plan: Plan) {
  router.push(`/plans/${plan._id}`)
}

function handleCreatePlan(name: string) {
  createPlan({ name })
}
</script>
