<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4" data-automation-id="encounter-detail-heading">
          {{ pageHeading }}
        </h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="encounter">
      <v-row>
        <v-col cols="12">
          <v-card data-automation-id="encounter-detail-profile-section">
            <v-card-title
              class="d-flex align-center cursor-pointer"
              data-automation-id="encounter-detail-profile-toggle"
              @click="profileExpanded = !profileExpanded"
            >
              <v-icon
                :icon="profileExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                class="mr-2"
              />
              <h2 class="text-h4 mb-0 font-italic">Profile</h2>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="profileExpanded">
                <h3 class="text-h6 mb-2">Profile Data</h3>
                <div class="mb-4">
                  <p class="text-body-2 text-medium-emphasis mb-1">Goals</p>
                  <div v-if="profileGoals.length" data-automation-id="encounter-detail-profile-goals">
                    <v-chip
                      v-for="goal in profileGoals"
                      :key="goal"
                      class="mr-2 mb-2"
                      size="small"
                    >
                      {{ goal }}
                    </v-chip>
                  </div>
                  <p v-else data-automation-id="encounter-detail-profile-goals">—</p>
                </div>
                <div class="mb-6">
                  <p class="text-body-2 text-medium-emphasis mb-1">Interests</p>
                  <div v-if="profileInterests.length" data-automation-id="encounter-detail-profile-interests">
                    <v-chip
                      v-for="interest in profileInterests"
                      :key="interest"
                      class="mr-2 mb-2"
                      size="small"
                      color="primary"
                      variant="tonal"
                    >
                      {{ interest }}
                    </v-chip>
                  </div>
                  <p v-else data-automation-id="encounter-detail-profile-interests">—</p>
                </div>

                <h3 class="text-h6 mb-2">Journey Data</h3>
                <p class="text-body-2 text-medium-emphasis mb-1">Resources completed in last 7 days</p>
                <v-alert
                  v-if="recentCompletions.length === 0"
                  type="info"
                  variant="tonal"
                  class="mb-4"
                  data-automation-id="encounter-detail-journey-recent-completions"
                >
                  No resources completed in the last 7 days.
                </v-alert>
                <v-list
                  v-else
                  density="compact"
                  class="mb-4"
                  data-automation-id="encounter-detail-journey-recent-completions"
                >
                  <v-list-item
                    v-for="item in recentCompletions"
                    :key="item.resource_id"
                  >
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(item.completed_at) }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <p class="text-body-2 text-medium-emphasis mb-1">Resources in Now</p>
                <v-alert
                  v-if="nowResources.length === 0"
                  type="info"
                  variant="tonal"
                  class="mb-4"
                  data-automation-id="encounter-detail-journey-now-resources"
                >
                  No resources in Now.
                </v-alert>
                <v-list
                  v-else
                  density="compact"
                  class="mb-4"
                  data-automation-id="encounter-detail-journey-now-resources"
                >
                  <v-list-item
                    v-for="item in nowResources"
                    :key="item.resource_id"
                  >
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle v-if="item.url">{{ item.url }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <AutoSaveField
                  :model-value="menteeNotes"
                  label="Mentor Notes"
                  :on-save="(value: string | number) => updateMenteeNotes(String(value))"
                  textarea
                  :rows="4"
                  automation-id="encounter-detail-mentor-notes-input"
                />
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="encounter-detail-checklist-section">
            <v-card-title
              class="d-flex align-center cursor-pointer"
              data-automation-id="encounter-detail-checklist-toggle"
              @click="checklistExpanded = !checklistExpanded"
            >
              <v-icon
                :icon="checklistExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                class="mr-2"
              />
              <h2 class="text-h4 mb-0 font-italic">Checklist</h2>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="checklistExpanded">
                <v-alert
                  v-if="agendaItems.length === 0"
                  type="info"
                  variant="tonal"
                  data-automation-id="encounter-detail-checklist-empty"
                >
                  No checklist items for this encounter.
                </v-alert>
                <v-list v-else density="compact">
                  <v-list-item
                    v-for="(item, index) in agendaItems"
                    :key="`${index}-${item.step}`"
                    :data-automation-id="`encounter-detail-checklist-item-${index}`"
                  >
                    <template #prepend>
                      <v-checkbox-btn
                        :model-value="item.checked ?? false"
                        :disabled="isUpdatingAgenda"
                        @update:model-value="toggleAgendaItem(index, $event)"
                      />
                    </template>
                    <v-list-item-title>{{ item.step }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="encounter-detail-encounter-section">
            <v-card-title>
              <h2 class="text-h4 mb-0 font-italic">Encounter</h2>
            </v-card-title>
            <v-card-text>
              <AutoSaveField
                :model-value="encounter.tldr || ''"
                label="TLDR *"
                :rules="[rules.required, rules.descriptionPattern]"
                hint="One-sentence summary, max 255 characters"
                :on-save="(value: string | number) => updateField('tldr', String(value))"
                automation-id="encounter-detail-tldr-input"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="encounter-detail-summary-section">
            <v-card-title
              class="d-flex align-center cursor-pointer"
              data-automation-id="encounter-detail-summary-toggle"
              @click="summaryExpanded = !summaryExpanded"
            >
              <v-icon
                :icon="summaryExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                class="mr-2"
              />
              <h2 class="text-h4 mb-0 font-italic">Summary</h2>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="summaryExpanded">
                <AutoSaveField
                  :model-value="encounter.summary || ''"
                  label="Summary"
                  hint="Markdown is accepted"
                  :on-save="(value: string | number) => updateField('summary', String(value))"
                  textarea
                  :rows="12"
                  automation-id="encounter-detail-summary-input"
                />
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="encounter-detail-transcript-section">
            <v-card-title
              class="d-flex align-center cursor-pointer"
              data-automation-id="encounter-detail-transcript-toggle"
              @click="transcriptExpanded = !transcriptExpanded"
            >
              <v-icon
                :icon="transcriptExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                class="mr-2"
              />
              <h2 class="text-h4 mb-0 font-italic">Transcript</h2>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="transcriptExpanded">
                <AutoSaveField
                  :model-value="encounter.transcript || ''"
                  label="Transcript"
                  hint="Markdown is accepted"
                  :on-save="(value: string | number) => updateField('transcript', String(value))"
                  textarea
                  :rows="12"
                  automation-id="encounter-detail-transcript-input"
                />
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col>
          <v-btn
            variant="text"
            data-automation-id="encounter-detail-back-button"
            @click="goBack"
          >
            {{ backLabel }}
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { AutoSaveField, formatDate, useErrorHandler, validationRules } from '@mentor-forge/mentorhub_spa_utils'
import type { CelebrationEntry, EncounterAgendaItem, EncounterUpdate, MenteeUpdate } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const encounterId = computed(() => routeLocation.params.id as string)

const profileExpanded = ref(true)
const checklistExpanded = ref(true)
const summaryExpanded = ref(true)
const transcriptExpanded = ref(false)

const { data: encounter, isLoading, error: queryError } = useQuery({
  queryKey: ['encounter', encounterId],
  queryFn: () => api.getEncounter(encounterId.value),
})

const menteeId = computed(() => encounter.value?.mentee_id ?? '')

const { data: profileDetail } = useQuery({
  queryKey: ['profile', menteeId],
  queryFn: () => api.getProfile(menteeId.value),
  enabled: computed(() => Boolean(menteeId.value)),
})

const { data: profileProperties } = useQuery({
  queryKey: ['profile-properties', menteeId],
  queryFn: () => api.getProfileProperties(menteeId.value),
  enabled: computed(() => Boolean(menteeId.value)),
})

const menteeDisplayName = computed(() => {
  const profile = profileDetail.value?.profile
  if (!profile) return 'Encounter'
  return profile.full_name || profile.name
})

const encounterDateDisplay = computed(() => {
  const date = encounter.value?.date || encounter.value?.created.at_time
  return date ? formatDate(date) : '—'
})

const pageHeading = computed(() => `${menteeDisplayName.value} - ${encounterDateDisplay.value}`)

const profileGoals = computed(() => profileDetail.value?.profile.goals ?? [])
const profileInterests = computed(() => profileDetail.value?.profile.interests ?? [])
const menteeNotes = computed(() => profileDetail.value?.mentee.notes ?? '')

const recentCompletions = computed((): CelebrationEntry[] => {
  const celebrations = profileProperties.value?.celebrations ?? []
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return celebrations.filter((item) => new Date(item.completed_at).getTime() >= cutoff)
})

const nowResources = computed(() => {
  return (profileProperties.value?.sites_and_links ?? []).filter((item) => item.scope === 'now')
})

const agendaItems = computed(() => encounter.value?.agenda ?? [])

const backLabel = computed(() => (menteeId.value ? 'Back to Profile' : 'Back to Dashboard'))

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const rules = {
  required: validationRules.required,
  descriptionPattern: validationRules.descriptionPattern,
}

const { mutateAsync: updateMentee } = useMutation({
  mutationFn: (data: MenteeUpdate) => {
    const menteeDocId = profileDetail.value?.mentee._id
    if (!menteeDocId) {
      return Promise.reject(new Error('Mentee document not loaded'))
    }
    return api.updateMentee(menteeDocId, data)
  },
  onSuccess: () => {
    if (menteeId.value) {
      queryClient.invalidateQueries({ queryKey: ['profile', menteeId.value] })
    }
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateMenteeNotes(value: string) {
  await updateMentee({ notes: value })
}

const { mutateAsync: updateEncounter, isPending: isUpdatingAgenda } = useMutation({
  mutationFn: (data: EncounterUpdate) => api.updateEncounter(encounterId.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['encounter', encounterId.value] })
    if (menteeId.value) {
      queryClient.invalidateQueries({ queryKey: ['profile', menteeId.value] })
    }
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateField(field: keyof EncounterUpdate, value: string) {
  await updateEncounter({ [field]: value })
}

async function toggleAgendaItem(index: number, checked: boolean | null) {
  const currentAgenda = encounter.value?.agenda ?? []
  const updatedAgenda: EncounterAgendaItem[] = currentAgenda.map((item, itemIndex) => {
    if (itemIndex !== index) return { ...item }
    return { ...item, checked: Boolean(checked) }
  })
  await updateEncounter({ agenda: updatedAgenda })
}

function goBack() {
  if (menteeId.value) {
    router.push(`/profiles/${menteeId.value}`)
    return
  }
  router.push('/profiles')
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
