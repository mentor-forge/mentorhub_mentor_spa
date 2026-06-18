<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">New Encounter</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.tldr"
                label="TLDR *"
                :rules="[rules.required, rules.descriptionPattern]"
                hint="One-sentence summary, max 255 characters"
                persistent-hint
                required
                data-automation-id="encounter-new-tldr-input"
              />

              <v-textarea
                v-model="form.summary"
                label="Summary"
                hint="Brief summary of the encounter"
                persistent-hint
                rows="3"
                class="mt-4"
                data-automation-id="encounter-new-summary-input"
              />

              <v-select
                v-model="form.status"
                label="Status"
                :items="statusOptions"
                class="mt-4"
                data-automation-id="encounter-new-status-select"
              />

              <v-card-actions class="px-0 mt-4">
                <v-btn 
                  @click="router.back()" 
                  variant="text"
                  data-automation-id="encounter-new-cancel-button"
                >
                  Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isPending"
                  :disabled="isPending"
                  data-automation-id="encounter-new-submit-button"
                >
                  Create Encounter
                </v-btn>
              </v-card-actions>
            </v-form>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { validationRules, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import type { EncounterInput } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const formRef = ref()
const errorRef = ref<Error | null>(null)
const { showError, errorMessage } = useErrorHandler(errorRef as any)

const form = ref<EncounterInput>({
  tldr: '',
  summary: '',
  status: 'active',
})

onMounted(() => {
  const menteeId = routeLocation.query.menteeId
  if (typeof menteeId === 'string' && menteeId) {
    form.value.mentee_id = menteeId
  }
})

const statusOptions = ['active', 'archived']

const rules = {
  required: validationRules.required,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutate: createEncounter, isPending } = useMutation<{ _id: string }, Error, EncounterInput>({
  mutationFn: (data: EncounterInput) => api.createEncounter(data),
  onSuccess: (response: { _id: string }) => {
    queryClient.invalidateQueries({ queryKey: ['encounters'] })
    if (form.value.mentee_id) {
      queryClient.invalidateQueries({ queryKey: ['profile', form.value.mentee_id] })
    }
    router.push(`/encounters/${response._id}`)
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (valid) {
    const payload: EncounterInput = {
      status: form.value.status ?? 'active',
      tldr: form.value.tldr?.trim(),
    }
    if (form.value.summary?.trim()) {
      payload.summary = form.value.summary.trim()
    }
    if (form.value.mentee_id) {
      payload.mentee_id = form.value.mentee_id
    }
    createEncounter(payload)
  }
}
</script>
