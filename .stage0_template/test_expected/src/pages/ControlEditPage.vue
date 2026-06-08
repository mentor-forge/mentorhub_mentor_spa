<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Edit Control</h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="control">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <AutoSaveField
              :model-value="control.name"
              label="Name *"
              :rules="[rules.required, rules.namePattern]"
              hint="No whitespace, max 40 characters"
              :on-save="(value: string | number) => updateField('name', String(value))"
              automation-id="control-edit-name-input"
            />

            <AutoSaveField
              :model-value="control.description || ''"
              label="Description"
              :rules="[rules.descriptionPattern]"
              hint="Max 255 characters, no tabs or newlines"
              :on-save="(value: string | number) => updateField('description', String(value))"
              class="mt-4"
              textarea
              :rows="3"
              automation-id="control-edit-description-input"
            />

            <AutoSaveSelect
              :model-value="control.status || 'active'"
              label="Status"
              :items="statusOptions"
              :on-save="(value: string) => updateField('status', value)"
              class="mt-4"
              automation-id="control-edit-status-select"
            />

            <v-divider class="my-6" />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(control.created.at_time)"
                  label="Created"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="control.created.by_user"
                  label="Created By"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(control.saved.at_time)"
                  label="Last Saved"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="control.saved.by_user"
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
                @click="router.push('/controls')" 
                variant="text"
                data-automation-id="control-edit-back-button"
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
 * Control Edit Page - Showcase of spa_utils AutoSave components
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
import { AutoSaveField, AutoSaveSelect, validationRules, formatDate, useErrorHandler } from '@agile-learning-institute/mentorhub_spa_utils'
import type { ControlUpdate } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const controlId = computed(() => routeLocation.params.id as string)

const { data: control, isLoading, error: queryError } = useQuery({
  queryKey: ['control', controlId],
  queryFn: () => api.getControl(controlId.value),
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

const { mutateAsync: updateControl } = useMutation({
  mutationFn: (data: ControlUpdate) => api.updateControl(controlId.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['control', controlId.value] })
    queryClient.invalidateQueries({ queryKey: ['controls'] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateField(field: keyof ControlUpdate, value: string) {
  try {
    await updateControl({ [field]: value })
  } catch (error) {
    throw error
  }
}
</script>