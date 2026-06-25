<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Plans</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <ListPageSearch
          :searchable="true"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="plan-list-search"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end align-center">
        <v-btn
          color="primary"
          data-automation-id="plan-list-new-button"
          @click="showNewDialog = true"
        >
          <v-icon left>mdi-plus</v-icon>
          New Plan
        </v-btn>
      </v-col>
    </v-row>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-row v-if="!isLoading && (plans ?? []).length === 0">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" data-automation-id="plan-list-empty">
          No plans found.
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="plan in (plans ?? [])"
        :key="plan._id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          hover
          class="h-100"
          data-automation-id="plan-list-card"
          @click="navigateToPlan(plan)"
        >
          <v-card-title>{{ plan.name }}</v-card-title>
          <v-card-text>
            <p class="mb-3 text-medium-emphasis">
              {{ plan.description || 'No description' }}
            </p>
            <v-chip
              size="small"
              color="primary"
              variant="tonal"
              data-automation-id="plan-list-card-step-count"
            >
              {{ stepCount(plan) }} {{ stepCount(plan) === 1 ? 'step' : 'steps' }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="hasMoreValue">
      <v-col>
        <v-btn
          @click="loadMore"
          :loading="isFetchingNextPageValue"
          color="primary"
          block
          data-automation-id="plan-list-load-more"
        >
          {{ isFetchingNextPageValue ? 'Loading...' : 'Load More' }}
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showNewDialog"
      max-width="480"
      data-automation-id="plan-list-new-dialog"
    >
      <v-card>
        <v-card-title>New Plan</v-card-title>
        <v-card-text>
          <v-form ref="newPlanFormRef" @submit.prevent="handleCreatePlan">
            <v-text-field
              v-model="newPlanName"
              label="Plan name *"
              :rules="[rules.required, rules.namePattern]"
              hint="No whitespace, max 40 characters"
              persistent-hint
              autofocus
              data-automation-id="plan-list-new-name-input"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            variant="text"
            data-automation-id="plan-list-new-cancel-button"
            @click="closeNewDialog"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="isCreating"
            data-automation-id="plan-list-new-submit-button"
            @click="handleCreatePlan"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load plans: {{ errorMessage }}
    </v-snackbar>

    <v-snackbar :model-value="showCreateError as unknown as boolean" color="error" :timeout="5000">
      Failed to create plan: {{ createErrorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { ListPageSearch, useInfiniteScroll, useErrorHandler, validationRules } from '@mentor-forge/mentorhub_spa_utils'
import type { Plan, PlanInput } from '@/api/types'

const router = useRouter()
const queryClient = useQueryClient()

const showNewDialog = ref(false)
const newPlanName = ref('')
const newPlanFormRef = ref()

const rules = {
  required: validationRules.required,
  namePattern: validationRules.namePattern,
}

const {
  items: plans,
  isLoading,
  isFetchingNextPage,
  hasMore,
  loadMore,
  showError,
  errorMessage,
  searchQuery,
  debouncedSearch,
} = useInfiniteScroll<Plan>({
  queryKey: ['plans'],
  queryFn: (params) => api.getPlans(params),
  getItemId: (item) => item._id,
  limit: 20,
})

const hasMoreValue = computed(() => hasMore.value)
const isFetchingNextPageValue = computed(() => isFetchingNextPage.value)

const createErrorRef = ref<Error | null>(null)
const { showError: showCreateError, errorMessage: createErrorMessage } = useErrorHandler(createErrorRef as any)

const { mutate: createPlan, isPending: isCreating } = useMutation<{ _id: string }, Error, PlanInput>({
  mutationFn: (data: PlanInput) => api.createPlan(data),
  onSuccess: (response) => {
    queryClient.invalidateQueries({ queryKey: ['plans'] })
    createErrorRef.value = null
    closeNewDialog()
    router.push(`/plans/${response._id}`)
  },
  onError: (error: Error) => {
    createErrorRef.value = error
  },
})

function stepCount(plan: Plan): number {
  const checklist = (plan as Plan & { checklist?: string[] }).checklist
  return plan.steps?.length ?? checklist?.length ?? 0
}

function navigateToPlan(plan: Plan) {
  router.push(`/plans/${plan._id}`)
}

function closeNewDialog() {
  showNewDialog.value = false
  newPlanName.value = ''
  newPlanFormRef.value?.resetValidation()
}

async function handleCreatePlan() {
  const { valid } = await newPlanFormRef.value.validate()
  if (valid) {
    createPlan({ name: newPlanName.value.trim(), status: 'active' })
  }
}
</script>
