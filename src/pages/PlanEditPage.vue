<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Edit Plan</h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="plan">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <AutoSaveField
              :model-value="plan.name"
              label="Name *"
              :rules="[rules.required, rules.namePattern]"
              hint="No whitespace, max 40 characters"
              :on-save="(value: string | number) => updateField('name', String(value))"
              automation-id="plan-edit-name-input"
            />

            <AutoSaveField
              :model-value="plan.description || ''"
              label="Description"
              :rules="[rules.descriptionPattern]"
              hint="Max 255 characters, no tabs or newlines"
              :on-save="(value: string | number) => updateField('description', String(value))"
              class="mt-4"
              textarea
              :rows="3"
              automation-id="plan-edit-description-input"
            />

            <AutoSaveSelect
              :model-value="plan.status || 'active'"
              label="Status"
              :items="statusOptions"
              :on-save="(value: string) => updateField('status', value)"
              class="mt-4"
              automation-id="plan-edit-status-select"
            />

            <v-divider class="my-6" />

            <PlanChecklistEditor
              :checklist="plan.checklist ?? []"
              :on-save="updateChecklist"
            />

            <v-divider class="my-6" />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(plan.created.at_time)"
                  label="Created"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="plan.created.by_user"
                  label="Created By"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(plan.saved.at_time)"
                  label="Last Saved"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="plan.saved.by_user"
                  label="Last Saved By"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-0 mt-4">
              <v-btn 
                @click="router.push('/plans')" 
                variant="text"
                data-automation-id="plan-edit-back-button"
              >
                Back to List
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * Plan Edit Page - Showcase of spa_utils AutoSave components
 * 
 * This page demonstrates how easy it is to build an edit page with:
 * - Auto-save on blur (no save button needed!)
 * - Built-in validation rules
 * - Loading/saving/error states
 * - Date formatting utilities
 * - Error handling
 * 
 * All from spa_utils components and utilities!
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
// 🎯 All these utilities come from spa_utils - ready to use!
import { AutoSaveField, AutoSaveSelect, validationRules, formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import type { PlanUpdate } from '@/api/types'
import PlanChecklistEditor from '@/components/PlanChecklistEditor.vue'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

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

// 🎯 Use validation rules from spa_utils - no need to write your own!
const rules = {
  required: validationRules.required,
  namePattern: validationRules.namePattern,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutateAsync: updatePlan } = useMutation({
  mutationFn: (data: PlanUpdate) => api.updatePlan(planId.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['plan', planId.value] })
    queryClient.invalidateQueries({ queryKey: ['plans'] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateField(field: keyof PlanUpdate, value: string) {
  try {
    await updatePlan({ [field]: value })
  } catch (error) {
    throw error
  }
}

async function updateChecklist(checklist: string[]) {
  await updatePlan({ checklist })
}
</script>