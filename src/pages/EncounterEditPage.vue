<template>
  <v-container>
    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="encounter">
      <v-row>
        <v-col cols="12">
          <v-card
            class="mh-card"
            :class="{ 'mh-card--collapsed': profileCollapsed }"
            variant="outlined"
            rounded="lg"
            elevation="2"
            data-automation-id="encounter-detail-profile-section"
          >
            <v-toolbar
              color="primary"
              density="comfortable"
              class="mh-card__title-bar"
              flat
            >
              <v-toolbar-title class="mh-card__title" data-automation-id="encounter-detail-profile-section-title-display">
                <a
                  :href="menteeProfileHref"
                  class="text-white text-decoration-none"
                  title="Open Profile"
                  data-automation-id="encounter-detail-profile-link"
                  @click.prevent="goToMenteeProfile"
                >
                  {{ menteeTitleText }}
                </a>
                <span
                  v-if="planCounts"
                  class="encounter-detail-plan-counts ml-2"
                  data-automation-id="encounter-detail-plan-counts"
                >
                  (<span title="Library">{{ planCounts.library }}</span>,
                  <span title="Now">{{ planCounts.now }}</span>,
                  <span title="Next">{{ planCounts.next }}</span>)
                </span>
              </v-toolbar-title>

              <div class="mh-card__actions" data-automation-id="encounter-detail-profile-section-actions-display">
                <v-btn
                  icon="mdi-arrow-left"
                  variant="text"
                  size="small"
                  title="Back to Mentee"
                  data-automation-id="encounter-detail-back-button"
                  @click="goBack"
                />
                <v-btn
                  v-if="isEncounterActive"
                  color="error"
                  size="small"
                  class="ml-2"
                  :loading="isFinishingEncounter"
                  data-automation-id="encounter-detail-end-button"
                  @click="handleFinishEncounter"
                >
                  <v-icon start>mdi-stop</v-icon>
                  End Encounter
                </v-btn>
              </div>

              <v-btn
                icon
                variant="text"
                size="small"
                data-automation-id="encounter-detail-profile-section-collapse-button"
                @click="profileCollapsed = !profileCollapsed"
              >
                <v-icon>{{ profileCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
              </v-btn>
            </v-toolbar>

            <v-card-text v-show="!profileCollapsed" class="mh-card__body">
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

              <MarkdownEditor
                field="notes"
                label="Mentor Notes"
                :rows="4"
                :editable="isEncounterActive"
                automation-id="encounter-detail-mentor-notes-input"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <MhCard
            title="Checklist"
            automation-id="encounter-detail-checklist-section"
          >
            <template #actions>
              <v-btn
                icon
                variant="text"
                size="small"
                data-automation-id="encounter-detail-checklist-toggle"
                @click="checklistCollapsed = !checklistCollapsed"
              >
                <v-icon>{{ checklistCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
              </v-btn>
            </template>

            <div v-show="!checklistCollapsed">
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
                      :disabled="!isEncounterActive || isUpdatingAgenda"
                      @update:model-value="toggleAgendaItem(index, $event)"
                    />
                  </template>
                  <v-list-item-title>{{ item.step }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </MhCard>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <DataCard
            title="Encounter"
            name-field="tldr"
            :model="encounterCardModel"
            :on-save="updateEncounterField"
            automation-id="encounter-detail-encounter-section"
          >
            <DateTimeEditor
              field="date"
              label="Encounter Date"
              :editable="false"
              automation-id="encounter-detail-date-input"
            />
            <EnumEditor
              field="status"
              enums="status"
              label="Status"
              :editable="false"
              class="mt-4"
              automation-id="encounter-detail-status-select"
            />
            <SentenceEditor
              field="tldr"
              label="TLDR *"
              :rules="[rules.required, rules.sentencePattern]"
              hint="One-sentence summary, max 255 characters"
              :editable="isEncounterActive"
              class="mt-4"
              automation-id="encounter-detail-tldr-input"
            />
          </DataCard>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <DataCard
            v-model:collapsed="summaryCollapsed"
            title="Summary"
            :model="encounterCardModel"
            :on-save="updateEncounterField"
            automation-id="encounter-detail-summary-section"
          >
            <MarkdownEditor
              field="summary"
              label="Summary"
              hint="Markdown is accepted"
              :rows="12"
              :editable="isEncounterActive"
              automation-id="encounter-detail-summary-input"
            />
          </DataCard>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <DataCard
            v-model:collapsed="transcriptCollapsed"
            title="Transcript"
            :model="encounterCardModel"
            :on-save="updateEncounterField"
            automation-id="encounter-detail-transcript-section"
          >
            <MarkdownEditor
              field="transcript"
              label="Transcript"
              hint="Markdown is accepted"
              :rows="12"
              :editable="isEncounterActive"
              automation-id="encounter-detail-transcript-input"
            />
          </DataCard>
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
import { redirectToDiscoveryDashboard } from '@/composables/useDiscoveryRedirect'
import {
  DataCard,
  DateTimeEditor,
  EnumEditor,
  MarkdownEditor,
  MhCard,
  SentenceEditor,
  formatDate,
  provideDataCardContext,
  useErrorHandler,
  validationRules,
} from '@mentor-forge/mentorhub_spa_utils'
import type { CelebrationEntry, EncounterAgendaItem, EncounterUpdate, MenteeUpdate } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const encounterId = computed(() => routeLocation.params.id as string)

const profileCollapsed = ref(false)
const checklistCollapsed = ref(false)
const summaryCollapsed = ref(false)
const transcriptCollapsed = ref(true)

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
  return profile.display_name
})

const encounterDateDisplay = computed(() => {
  const date = encounter.value?.date || encounter.value?.created.at_time
  return date ? formatDate(date) : '—'
})

const menteeTitleText = computed(() => `${menteeDisplayName.value} — ${encounterDateDisplay.value}`)

const menteeProfileHref = computed(() => (menteeId.value ? `/mentee/${menteeId.value}` : '#'))

function goToMenteeProfile() {
  if (menteeId.value) {
    router.push(`/mentee/${menteeId.value}`)
  }
}

const planCounts = computed(() => profileDetail.value?.mentee?.plan_counts)

const profileGoals = computed(() => profileDetail.value?.profile.goals ?? [])
const profileInterests = computed(() => profileDetail.value?.profile.interests ?? [])

const menteeCardModel = computed<Record<string, unknown>>(() => ({
  ...profileDetail.value?.mentee,
}))

provideDataCardContext({
  model: () => menteeCardModel.value,
  onSave: (field, value) => updateMenteeField(field, value),
})

const encounterCardModel = computed<Record<string, unknown>>(() => ({
  ...encounter.value,
  date: encounter.value?.date || encounter.value?.created.at_time,
}))

const recentCompletions = computed((): CelebrationEntry[] => {
  const celebrations = profileProperties.value?.celebrations ?? []
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return celebrations.filter((item) => new Date(item.completed_at).getTime() >= cutoff)
})

const nowResources = computed(() => {
  return (profileProperties.value?.sites_and_links ?? []).filter((item) => item.scope === 'now')
})

const agendaItems = computed(() => encounter.value?.agenda ?? [])

const isEncounterActive = computed(() => encounter.value?.status === 'active')

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const rules = {
  required: validationRules.required,
  sentencePattern: validationRules.sentencePattern,
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

async function updateMenteeField(field: string, value: unknown) {
  if (!isEncounterActive.value) return
  if (field !== 'notes') {
    throw new Error(`Unsupported mentee field: ${field}`)
  }
  await updateMentee({ notes: String(value ?? '') })
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

async function updateEncounterField(field: string, value: unknown) {
  if (!isEncounterActive.value) return
  if (!['date', 'status', 'tldr', 'summary', 'transcript'].includes(field)) {
    throw new Error(`Unsupported encounter field: ${field}`)
  }
  await updateEncounter({ [field]: value } as EncounterUpdate)
}

async function toggleAgendaItem(index: number, checked: boolean | null) {
  if (!isEncounterActive.value) return
  const currentAgenda = encounter.value?.agenda ?? []
  const updatedAgenda: EncounterAgendaItem[] = currentAgenda.map((item, itemIndex) => {
    if (itemIndex !== index) return { ...item }
    return { ...item, checked: Boolean(checked) }
  })
  await updateEncounter({ agenda: updatedAgenda })
}

function goBack() {
  if (menteeId.value) {
    router.push(`/mentee/${menteeId.value}`)
    return
  }
  redirectToDiscoveryDashboard()
}

const { mutate: finishEncounterMutation, isPending: isFinishingEncounter } = useMutation({
  mutationFn: () => api.finishEncounter(encounterId.value),
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

function handleFinishEncounter() {
  finishEncounterMutation()
}
</script>
