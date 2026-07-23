<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Edit Resource</h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="resource">
      <v-col cols="12" md="8">
        <DataCard
          title="Resource"
          name-field="name"
          :model="resource"
          :on-save="updateField"
          automation-id="resource-edit-card"
        >
          <WordEditor
            field="name"
            label="Name *"
            hint="No whitespace, max 40 characters"
            automation-id="resource-edit-name-input"
          />

          <SentenceEditor
            field="description"
            label="Description"
            hint="Max 255 characters, no tabs or newlines"
            class="mt-4"
            automation-id="resource-edit-description-input"
          />

          <AutoSaveSelect
            :model-value="resource.status || 'active'"
            label="Status"
            :items="statusOptions"
            :on-save="(value: string) => updateField('status', value)"
            class="mt-4"
            automation-id="resource-edit-status-select"
          />

          <v-divider class="my-6" />

          <v-row>
            <v-col cols="12" md="6">
              <BreadcrumbDisplay
                field="created"
                label="Created"
                automation-id="resource-edit-created"
              />
            </v-col>
            <v-col cols="12" md="6">
              <BreadcrumbDisplay
                field="saved"
                label="Last Saved"
                automation-id="resource-edit-saved"
              />
            </v-col>
          </v-row>

          <template #actions>
            <v-btn
              @click="router.push('/resources')"
              variant="text"
              data-automation-id="resource-edit-back-button"
            >
              Back to List
            </v-btn>
          </template>
        </DataCard>
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
  AutoSaveSelect,
  BreadcrumbDisplay,
  DataCard,
  SentenceEditor,
  WordEditor,
  useErrorHandler,
} from '@mentor-forge/mentorhub_spa_utils'
import type { ResourceUpdate } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const resourceId = computed(() => routeLocation.params.id as string)

const { data: resource, isLoading, error: queryError } = useQuery({
  queryKey: ['resource', resourceId],
  queryFn: () => api.getResource(resourceId.value),
})

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const statusOptions = ['active', 'archived']

const { mutateAsync: updateResource } = useMutation({
  mutationFn: (data: ResourceUpdate) => api.updateResource(resourceId.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource', resourceId.value] })
    queryClient.invalidateQueries({ queryKey: ['resources'] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateField(field: string, value: unknown) {
  await updateResource({ [field]: value } as ResourceUpdate)
}
</script>