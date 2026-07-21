<template>
  <v-container>
    <v-row v-if="isLoading" justify="center">
      <v-col cols="12" class="plan-edit-layout text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="plan" justify="center">
      <v-col cols="12" class="plan-edit-layout">
        <h1 class="text-h4 mb-6 text-center">Edit Plan</h1>

        <CardGrid automation-id="plan-edit-grid">
          <DataCard
            title="An encounter plan"
            color="primary"
            name-field="name"
            :model="metadataModel"
            :on-save="saveMetadataField"
            automation-id="plan-edit-fields-section"
          >
            <WordEditor
              field="name"
              label="Name"
              hint="No whitespace, max 40 characters"
              automation-id="plan-edit-name-input"
            />
            <SentenceEditor
              field="description"
              label="Description"
              hint="Max 255 characters, no tabs or newlines"
              automation-id="plan-edit-description-input"
              class="mt-4"
            />
            <div class="plan-edit-status-row mt-4">
              <AutoSaveSelect
                :model-value="plan.status || 'active'"
                label="Status"
                :items="statusOptions"
                :on-save="saveStatus"
                automation-id="plan-edit-status-select"
              />
            </div>
          </DataCard>

          <DataCard
            v-if="hasAdminRole"
            title="Audit"
            color="secondary"
            :model="auditModel"
            :on-save="noopSave"
            automation-id="plan-edit-metadata-section"
          >
            <BreadcrumbDisplay
              field="created"
              label="Created"
              automation-id="plan-edit-metadata-created"
            />
            <BreadcrumbDisplay
              field="saved"
              label="Last Saved"
              automation-id="plan-edit-metadata-saved"
              class="mt-4"
            />
          </DataCard>

          <PlanChecklistEditor
            :checklist="plan.checklist ?? []"
            :on-save="updateChecklist"
          />
        </CardGrid>

        <div class="plan-edit-actions">
          <v-btn
            @click="router.push('/plans')"
            variant="text"
            data-automation-id="plan-edit-back-button"
          >
            Back to List
          </v-btn>
        </div>
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
  CardGrid,
  DataCard,
  WordEditor,
  SentenceEditor,
  BreadcrumbDisplay,
  AutoSaveSelect,
  useErrorHandler,
} from '@mentor-forge/mentorhub_spa_utils'
import type { PlanUpdate } from '@/api/types'
import PlanChecklistEditor from '@/components/PlanChecklistEditor.vue'
import { useRoles } from '@/composables/useRoles'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { hasRole } = useRoles()
const hasAdminRole = hasRole('admin')

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

const metadataModel = computed(() => ({
  name: plan.value?.name ?? '',
  description: plan.value?.description ?? '',
}))

const auditModel = computed(() => ({
  created: plan.value?.created,
  saved: plan.value?.saved,
}))

const { mutateAsync: updatePlan } = useMutation({
  mutationFn: (data: PlanUpdate) => api.updatePlan(planId.value, data),
  onSuccess: (updatedPlan) => {
    queryClient.setQueryData(['plan', planId.value], updatedPlan)
    queryClient.invalidateQueries({ queryKey: ['plan', planId.value] })
    queryClient.invalidateQueries({ queryKey: ['plans'] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function saveMetadataField(field: string, value: unknown) {
  await updatePlan({ [field]: value } as PlanUpdate)
}

async function saveStatus(value: string) {
  await updatePlan({ status: value as 'active' | 'archived' })
}

// Audit card is display-only (BreadcrumbDisplay defaults to editable=false and never
// calls onSave), but DataCard requires the prop to satisfy its context contract.
async function noopSave() {}

async function updateChecklist(checklist: string[]) {
  await updatePlan({ checklist })
}
</script>

<style scoped>
.plan-edit-layout {
  flex: 0 0 100% !important;
  max-width: 100% !important;
  padding-inline: 1rem;
}

.plan-edit-status-row {
  max-width: 320px;
}

.plan-edit-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}
</style>
