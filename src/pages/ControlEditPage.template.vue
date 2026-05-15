<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Edit {{item}}</h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="{{item | lower}}">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <AutoSaveField
              :model-value="{{item | lower}}.name"
              label="Name *"
              :rules="[rules.required, rules.namePattern]"
              hint="No whitespace, max 40 characters"
              :on-save="(value: string | number) => updateField('name', String(value))"
              automation-id="{{item | lower}}-edit-name-input"
            />

            <AutoSaveField
              :model-value="{{item | lower}}.description || ''"
              label="Description"
              :rules="[rules.descriptionPattern]"
              hint="Max 255 characters, no tabs or newlines"
              :on-save="(value: string | number) => updateField('description', String(value))"
              class="mt-4"
              textarea
              :rows="3"
              automation-id="{{item | lower}}-edit-description-input"
            />

            <AutoSaveSelect
              :model-value="{{item | lower}}.status || 'active'"
              label="Status"
              :items="statusOptions"
              :on-save="(value: string) => updateField('status', value)"
              class="mt-4"
              automation-id="{{item | lower}}-edit-status-select"
            />

            <v-divider class="my-6" />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate({{item | lower}}.created.at_time)"
                  label="Created"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="{{item | lower}}.created.by_user"
                  label="Created By"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate({{item | lower}}.saved.at_time)"
                  label="Last Saved"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="{{item | lower}}.saved.by_user"
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
                @click="router.push('/{{item | lower}}s')" 
                variant="text"
                data-automation-id="{{item | lower}}-edit-back-button"
              >
                Back to List
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {% raw %}{{ errorMessage }}{% endraw %}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * {{item}} Edit Page - Showcase of spa_utils AutoSave components
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
import { AutoSaveField, AutoSaveSelect, validationRules, formatDate, useErrorHandler } from '@{{org.git_org}}/{{info.slug}}_spa_utils'
import type { {{item}}Update } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const {{item | lower}}Id = computed(() => routeLocation.params.id as string)

const { data: {{item | lower}}, isLoading, error: queryError } = useQuery({
  queryKey: ['{{item | lower}}', {{item | lower}}Id],
  queryFn: () => api.get{{item}}({{item | lower}}Id.value),
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

const { mutateAsync: update{{item}} } = useMutation({
  mutationFn: (data: {{item}}Update) => api.update{{item}}({{item | lower}}Id.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['{{item | lower}}', {{item | lower}}Id.value] })
    queryClient.invalidateQueries({ queryKey: ['{{item | lower}}s'] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateField(field: keyof {{item}}Update, value: string) {
  try {
    await update{{item}}({ [field]: value })
  } catch (error) {
    throw error
  }
}
</script>