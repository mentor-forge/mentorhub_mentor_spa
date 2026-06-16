<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Edit Encounter</h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="encounter">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <AutoSaveField
              :model-value="encounter.tldr || ''"
              label="TLDR *"
              :rules="[rules.required, rules.descriptionPattern]"
              hint="One-sentence summary, max 255 characters"
              :on-save="(value: string | number) => updateField('tldr', String(value))"
              automation-id="encounter-edit-tldr-input"
            />

            <AutoSaveField
              :model-value="encounter.summary || ''"
              label="Summary"
              :on-save="(value: string | number) => updateField('summary', String(value))"
              class="mt-4"
              textarea
              :rows="3"
              automation-id="encounter-edit-summary-input"
            />

            <AutoSaveSelect
              :model-value="encounter.status || 'active'"
              label="Status"
              :items="statusOptions"
              :on-save="(value: string) => updateField('status', value)"
              class="mt-4"
              automation-id="encounter-edit-status-select"
            />

            <v-divider class="my-6" />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(encounter.created.at_time)"
                  label="Created"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="encounter.created.by_user"
                  label="Created By"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(encounter.saved.at_time)"
                  label="Last Saved"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="encounter.saved.by_user"
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
                @click="router.push('/encounters')" 
                variant="text"
                data-automation-id="encounter-edit-back-button"
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { AutoSaveField, AutoSaveSelect, validationRules, formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import type { EncounterUpdate } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const encounterId = computed(() => routeLocation.params.id as string)

const { data: encounter, isLoading, error: queryError } = useQuery({
  queryKey: ['encounter', encounterId],
  queryFn: () => api.getEncounter(encounterId.value),
})

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const statusOptions = ['active', 'archived']

const rules = {
  required: validationRules.required,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutateAsync: updateEncounter } = useMutation({
  mutationFn: (data: EncounterUpdate) => api.updateEncounter(encounterId.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['encounter', encounterId.value] })
    queryClient.invalidateQueries({ queryKey: ['encounters'] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateField(field: keyof EncounterUpdate, value: string) {
  try {
    await updateEncounter({ [field]: value })
  } catch (error) {
    throw error
  }
}
</script>
