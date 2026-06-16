<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">New Event</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.name"
                label="Name *"
                :rules="[rules.required, rules.namePattern]"
                hint="No whitespace, max 40 characters"
                persistent-hint
                required
                data-automation-id="event-new-name-input"
              />

              <v-textarea
                v-model="form.description"
                label="Description"
                :rules="[rules.descriptionPattern]"
                hint="Max 255 characters, no tabs or newlines"
                persistent-hint
                rows="3"
                class="mt-4"
                data-automation-id="event-new-description-input"
              />

              <v-text-field
                v-model="form.status"
                label="Status"
                class="mt-4"
                data-automation-id="event-new-status-input"
              />

              <v-card-actions class="px-0 mt-4">
                <v-btn 
                  @click="router.back()" 
                  variant="text"
                  data-automation-id="event-new-cancel-button"
                >
                  Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isPending"
                  :disabled="isPending"
                  data-automation-id="event-new-submit-button"
                >
                  Create
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { validationRules, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import type { EventInput } from '@/api/types'

const router = useRouter()
const queryClient = useQueryClient()
const formRef = ref()
const errorRef = ref<Error | null>(null)
const { showError, errorMessage } = useErrorHandler(errorRef as any)

const form = ref<EventInput>({
  name: '',
  description: '',
  status: '',
})

const rules = {
  required: validationRules.required,
  namePattern: validationRules.namePattern,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutate: createEvent, isPending } = useMutation<{ _id: string }, Error, EventInput>({
  mutationFn: (data: EventInput) => api.createEvent(data),
  onSuccess: (response: { _id: string }) => {
    queryClient.invalidateQueries({ queryKey: ['events'] })
    router.push(`/events/${response._id}`)
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (valid) {
    const payload: EventInput = { name: form.value.name }
    if (form.value.description?.trim()) {
      payload.description = form.value.description.trim()
    }
    createEvent(payload)
  }
}
</script>