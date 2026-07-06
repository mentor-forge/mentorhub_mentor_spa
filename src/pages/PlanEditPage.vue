<template>
  <v-container>
    <v-row v-if="isLoading" justify="center">
      <v-col cols="12" class="plan-edit-layout text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="plan" justify="center">
      <v-col cols="12" class="plan-edit-layout">
        <h1 class="text-h4 mb-6 text-center">Edit Plan</h1>

        <div class="plan-edit-columns">
          <div class="plan-edit-column">
            <SchemaFieldsCard
              title="An encounter plan"
              :values="fieldValues"
              :status-options="statusOptions"
              :field-defs="fieldDefs"
              :on-save-field="updateField"
              automation-id="plan-edit-fields-section"
            />

            <div
              v-if="hasAdminRole"
              class="plan-edit-metadata"
              data-automation-id="plan-edit-metadata-section"
            >
              <v-text-field
                :model-value="formatDate(plan.created.at_time)"
                label="Created"
                readonly
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                :model-value="formatDate(plan.saved.at_time)"
                label="Last Saved"
                readonly
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                :model-value="plan.created.by_user"
                label="Created By"
                readonly
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                :model-value="plan.saved.by_user"
                label="Last Saved By"
                readonly
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </div>

            <div class="plan-edit-column-actions">
              <v-btn
                @click="router.push('/plans')"
                variant="text"
                data-automation-id="plan-edit-back-button"
              >
                Back to List
              </v-btn>
            </div>
          </div>

          <div class="plan-edit-column">
            <PlanChecklistEditor
              :checklist="plan.checklist ?? []"
              :on-save="updateChecklist"
            />

            <div class="plan-edit-column-actions">
              <v-btn
                @click="router.push('/plans')"
                variant="text"
                data-automation-id="plan-edit-checklist-back-button"
              >
                Back to List
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import {
  validationRules,
  formatDate,
  useErrorHandler,
} from '@mentor-forge/mentorhub_spa_utils'
import type { PlanUpdate } from '@/api/types'
import SchemaFieldsCard, { type SchemaFieldKey } from '@/components/SchemaFieldsCard.vue'
import PlanChecklistEditor from '@/components/PlanChecklistEditor.vue'
import { useRoles } from '@/composables/useRoles'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { hasRole } = useRoles()
const hasAdminRole = hasRole('admin')

const planId = computed(() => routeLocation.params.id as string)

const { data: plan, isLoading, error: queryError } = useQuery({
  queryKey: ['plan', planId],
  queryFn: () => api.getPlan(planId.value),
})

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const statusOptions = ['active', 'archived']

const rules = {
  required: validationRules.required,
  namePattern: validationRules.namePattern,
  descriptionPattern: validationRules.descriptionPattern,
}

const fieldDefs = {
  name: {
    name: 'name',
    hint: 'No whitespace, max 40 characters',
    rules: [rules.required, rules.namePattern],
    automationId: 'plan-edit-name-input',
  },
  description: {
    name: 'description',
    hint: 'Max 255 characters, no tabs or newlines',
    rules: [rules.descriptionPattern],
    textarea: true,
    rows: 3,
    automationId: 'plan-edit-description-input',
  },
  status: {
    name: 'status',
    automationId: 'plan-edit-status-select',
  },
} as const

const fieldValues = computed(() => ({
  name: plan.value?.name ?? '',
  description: plan.value?.description ?? '',
  status: plan.value?.status || 'active',
}))

const { mutateAsync: updatePlan } = useMutation({
  mutationFn: (data: PlanUpdate) => api.updatePlan(planId.value, data),
  onSuccess: (updatedPlan) => {
    queryClient.setQueryData(['plan', planId.value], updatedPlan)
    queryClient.invalidateQueries({ queryKey: ['plan', planId.value] })
    queryClient.invalidateQueries({ queryKey: ['plans'] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateField(field: SchemaFieldKey, value: string) {
  await updatePlan({ [field]: value })
}

async function updateChecklist(checklist: string[]) {
  await updatePlan({ checklist })
}
</script>

<style scoped>
.plan-edit-layout {
  flex: 0 0 100% !important;
  max-width: 100% !important;
  padding-inline: 1rem;
}

.plan-edit-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

.plan-edit-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.plan-edit-column-actions {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 1rem;
}

.plan-edit-metadata {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
}

@media (min-width: 960px) {
  .plan-edit-metadata {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 959px) {
  .plan-edit-columns {
    grid-template-columns: 1fr;
  }
}
</style>
