<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">New Create</h1>
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
                data-automation-id="create-new-name-input"
              />

              <v-textarea
                v-model="form.description"
                label="Description"
                :rules="[rules.descriptionPattern]"
                hint="Max 255 characters, no tabs or newlines"
                persistent-hint
                rows="3"
                class="mt-4"
                data-automation-id="create-new-description-input"
              />

              <v-text-field
                v-model="form.status"
                label="Status"
                class="mt-4"
                data-automation-id="create-new-status-input"
              />

              <v-card-actions class="px-0 mt-4">
                <v-btn 
                  @click="router.back()" 
                  variant="text"
                  data-automation-id="create-new-cancel-button"
                >
                  Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isPending"
                  :disabled="isPending"
                  data-automation-id="create-new-submit-button"
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
import { validationRules, useErrorHandler } from '@agile-learning-institute/mentorhub_spa_utils'
import type { CreateInput } from '@/api/types'

const router = useRouter()
const queryClient = useQueryClient()
const formRef = ref()
const errorRef = ref<Error | null>(null)
const { showError, errorMessage } = useErrorHandler(errorRef as any)

const form = ref<CreateInput>({
  name: '',
  description: '',
  status: '',
})

const rules = {
  required: validationRules.required,
  namePattern: validationRules.namePattern,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutate: createCreate, isPending } = useMutation<{ _id: string }, Error, CreateInput>({
  mutationFn: (data: CreateInput) => api.createCreate(data),
  onSuccess: (response: { _id: string }) => {
    queryClient.invalidateQueries({ queryKey: ['creates'] })
    router.push(`/creates/${response._id}`)
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (valid) {
    createCreate(form.value)
  }
}
</script>