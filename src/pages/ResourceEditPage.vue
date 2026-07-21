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

    <template v-else-if="resource">
      <CardGrid automation-id="resource-edit-grid">
        <DataCard
          title="Resource"
          name-field="name"
          :model="resource"
          :on-save="handleSave"
          automation-id="resource-edit-card"
        >
          <WordEditor
            field="name"
            label="Name *"
            :rules="[rules.required, rules.wordPattern]"
            hint="No whitespace, max 40 characters"
            automation-id="resource-edit-name-input"
          />

          <SentenceEditor
            field="description"
            label="Description"
            hint="Max 255 characters, no tabs or newlines"
            automation-id="resource-edit-description-input"
            class="mt-4"
          />

          <AutoSaveSelect
            :model-value="resource.status || 'active'"
            label="Status"
            :items="statusOptions"
            :on-save="(value: string) => updateField('status', value)"
            class="mt-4"
            automation-id="resource-edit-status-select"
          />
        </DataCard>

        <DataCard
          title="Audit"
          :model="resource"
          :on-save="handleSave"
          automation-id="resource-edit-audit-card"
        >
          <BreadcrumbDisplay field="created" label="Created" automation-id="resource-edit-created" />
          <BreadcrumbDisplay field="saved" label="Last Saved" automation-id="resource-edit-saved" class="mt-4" />
        </DataCard>
      </CardGrid>

      <v-row class="mt-4">
        <v-col>
          <v-btn
            @click="router.push('/resources')"
            variant="text"
            data-automation-id="resource-edit-back-button"
          >
            Back to List
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * Resource Edit Page - DataCard + typed editors
 *
 * Uses spa_utils DataCard with typed editors (WordEditor / SentenceEditor) bound by
 * `field`, plus AutoSaveSelect for the status enum and BreadcrumbDisplay for read-only
 * created/saved audit metadata. All AutoSave from spa_utils components.
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import {
  CardGrid,
  DataCard,
  WordEditor,
  SentenceEditor,
  AutoSaveSelect,
  BreadcrumbDisplay,
  validationRules,
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

const rules = {
  required: validationRules.required,
  wordPattern: validationRules.wordPattern,
}

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

async function updateField(field: keyof ResourceUpdate, value: string) {
  await updateResource({ [field]: value })
}

async function handleSave(field: string, value: unknown) {
  await updateField(field as keyof ResourceUpdate, String(value))
}
</script>
