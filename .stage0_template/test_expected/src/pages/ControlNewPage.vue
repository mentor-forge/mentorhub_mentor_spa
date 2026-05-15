<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">New Control</h1>
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
                data-automation-id="control-new-name-input"
              />

              <v-textarea
                v-model="form.description"
                label="Description"
                :rules="[rules.descriptionPattern]"
                hint="Max 255 characters, no tabs or newlines"
                persistent-hint
                rows="3"
                class="mt-4"
                data-automation-id="control-new-description-input"
              />

              <v-select
                v-model="form.status"
                label="Status"
                :items="statusOptions"
                class="mt-4"
                data-automation-id="control-new-status-select"
              />

              <v-card-actions class="px-0 mt-4">
                <v-btn 
                  @click="router.back()" 
                  variant="text"
                  data-automation-id="control-new-cancel-button"
                >
                  Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isPending"
                  :disabled="isPending"
                  data-automation-id="control-new-submit-button"
                >
                  Create Control
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
import { validationRules, useErrorHandler } from '@agile-learning-institute/mentorhub_spa_utils'
import type { ControlInput } from '@/api/types'

const router = useRouter()
const queryClient = useQueryClient()
const formRef = ref()
const errorRef = ref<Error | null>(null)
const { showError, errorMessage } = useErrorHandler(errorRef as any)

const form = ref<ControlInput>({
  name: '',
  description: '',
  status: 'active',
})

const statusOptions = ['active', 'archived']

const rules = {
  required: validationRules.required,
  namePattern: validationRules.namePattern,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutate: createControl, isPending } = useMutation<{ _id: string }, Error, ControlInput>({
  mutationFn: (data: ControlInput) => api.createControl(data),
  onSuccess: (response: { _id: string }) => {
    queryClient.invalidateQueries({ queryKey: ['controls'] })
    router.push(`/controls/${response._id}`)
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (valid) {
    createControl(form.value)
  }
}
</script>