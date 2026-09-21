<template>
  <v-container fluid>
    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="profileDetail">
      <DataCardGrid>
        <!-- Card 1: Mentee Name -->
        <v-card
          class="mh-card"
          :class="{ 'mh-card--collapsed': profileCollapsed }"
          variant="outlined"
          rounded="lg"
          elevation="2"
          data-automation-id="profile-edit-profile-section"
        >
          <v-toolbar
            color="primary"
            density="comfortable"
            class="mh-card__title-bar"
            flat
          >
            <v-toolbar-title class="mh-card__title" data-automation-id="profile-edit-profile-section-title-display">
              <a
                :href="customerProfileHref"
                class="text-white text-decoration-none mentee-title-link"
                title="Open Profile"
                data-automation-id="mentee-edit-customer-profile-link"
              >
                {{ displayName }}
              </a>
            </v-toolbar-title>

            <div class="mh-card__actions" data-automation-id="profile-edit-profile-section-actions-display">
              <v-btn
                v-if="profileEmail"
                :href="`mailto:${profileEmail}`"
                icon
                variant="text"
                size="small"
                data-automation-id="profile-edit-mentee-mailto-link"
                :title="profileEmail"
              >
                <v-icon>mdi-email</v-icon>
              </v-btn>
              <v-btn
                v-if="canStartEncounter && nextScheduledEncounter"
                color="success"
                icon="mdi-timer-play"
                class="ml-2"
                :loading="isStartingEncounter"
                title="Start Encounter"
                data-automation-id="profile-edit-start-encounter-button"
                @click="handleStartEncounter"
              />
            </div>

            <v-btn
              icon
              variant="text"
              size="small"
              data-automation-id="profile-edit-profile-section-collapse-button"
              @click="profileCollapsed = !profileCollapsed"
            >
              <v-icon>{{ profileCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text v-show="!profileCollapsed" class="mh-card__body">
            <!-- Minimal Profile data: Goals and Interests side-by-side -->
            <v-row class="mb-4">
              <v-col cols="12" sm="6">
                <div>
                  <p class="text-subtitle-2 text-medium-emphasis mb-1">Goals</p>
                  <div v-if="profileGoals.length" data-automation-id="profile-edit-goals-display">
                    <v-chip
                      v-for="goal in profileGoals"
                      :key="goal"
                      size="small"
                      class="mr-2 mb-2"
                    >
                      {{ goal }}
                    </v-chip>
                  </div>
                  <p v-else class="text-body-2 text-medium-emphasis" data-automation-id="profile-edit-goals-display">—</p>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div>
                  <p class="text-subtitle-2 text-medium-emphasis mb-1">Interests</p>
                  <div v-if="profileInterests.length" data-automation-id="profile-edit-interests-display">
                    <v-chip
                      v-for="interest in profileInterests"
                      :key="interest"
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="mr-2 mb-2"
                    >
                      {{ interest }}
                    </v-chip>
                  </div>
                  <p v-else class="text-body-2 text-medium-emphasis" data-automation-id="profile-edit-interests-display">—</p>
                </div>
              </v-col>
            </v-row>

            <!-- Editable Mentee collection fields: Summary and Notes -->
            <SentenceEditor
              field="summary"
              label="Summary"
              automation-id="profile-edit-mentee-summary-input"
            />
            <MarkdownSentenceField
              :model-value="notesText"
              label="Notes"
              class="mt-4"
              data-automation-id="profile-edit-mentee-notes-input"
              @update:model-value="handleNotesInput"
              @blur="handleNotesBlur"
            />
          </v-card-text>
        </v-card>

        <!-- Card 2: Encounters -->
        <MhCard
          title="Encounters"
          automation-id="profile-edit-encounters-section"
        >
          <template #actions>
            <v-btn
              color="primary"
              data-automation-id="profile-edit-schedule-encounters-button"
              @click="showScheduleDialog = true"
            >
              <v-icon start>mdi-calendar-clock</v-icon>
              Schedule Encounters
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              data-automation-id="profile-edit-encounters-toggle"
              @click="encountersCollapsed = !encountersCollapsed"
            >
              <v-icon>{{ encountersCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
            </v-btn>
          </template>

          <div v-show="!encountersCollapsed">
            <v-alert
              v-if="completedEncounters.length === 0"
              type="info"
              variant="tonal"
              data-automation-id="profile-edit-encounters-empty"
            >
              No completed encounters recorded for this mentee yet.
            </v-alert>

            <v-list v-else data-automation-id="profile-edit-encounters-list">
              <v-list-item
                v-for="encounter in completedEncounters"
                :key="encounter._id"
                data-automation-id="profile-edit-encounter-item"
              >
                <div class="d-flex align-start py-1 w-100">
                  <router-link
                    :to="`/encounter/${encounter._id}`"
                    class="text-decoration-none text-primary font-weight-medium mr-2 text-no-wrap"
                    data-automation-id="profile-edit-encounter-date-link"
                  >
                    {{ encounterDateDisplay(encounter.appointment?.from || encounter.date || encounter.created?.at_time) }}:
                  </router-link>
                  <div class="flex-grow-1">
                    <MarkdownSentenceField
                      :model-value="encounter.tldr || 'Encounter'"
                      :readonly="true"
                      data-automation-id="profile-edit-encounter-tldr"
                    />
                  </div>
                </div>
              </v-list-item>
            </v-list>
          </div>
        </MhCard>

        <!-- Card 3: Breadcrumbs (admin only) -->
        <DataCard
          v-if="hasAdminRole"
          title="Breadcrumbs"
          :model="breadcrumbsModel"
          automation-id="profile-edit-breadcrumbs-section"
        >
          <v-row>
            <v-col cols="12" md="4">
              <EnumEditor
                field="status"
                enums="status"
                label="Status"
                :editable="false"
                automation-id="profile-edit-status-display"
              />
            </v-col>
            <v-col cols="12" md="4">
              <BreadcrumbDisplay
                field="created"
                label="Created"
                automation-id="profile-edit-created-breadcrumb"
              />
            </v-col>
            <v-col cols="12" md="4">
              <BreadcrumbDisplay
                field="saved"
                label="Saved"
                automation-id="profile-edit-saved-breadcrumb"
              />
            </v-col>
          </v-row>
        </DataCard>
      </DataCardGrid>
    </template>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>

    <ScheduleEncountersDialog
      v-model="showScheduleDialog"
      :loading="isScheduling"
      :mentor-id="mentorId"
      :mentee-id="profileId"
      @submit="handleScheduleEncounters"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  BreadcrumbDisplay,
  DataCard,
  EnumEditor,
  MhCard,
  SentenceEditor,
  buildJourneyUrl,
  formatDate,
  provideDataCardContext,
  useErrorHandler,
} from '@mentor-forge/mentorhub_spa_utils'
import { ScheduleEncountersDialog } from '@/components/dashboard'
import DataCardGrid from '@/components/DataCardGrid.vue'
import MarkdownSentenceField from '@/components/MarkdownSentenceField.vue'
import { api } from '@/api/client'
import { useRoles } from '@/composables/useRoles'
import { isEncounterDateToday, getNextScheduledEncounter } from '@/utils/date'
import type { Encounter, ScheduleEncounterInput, MenteeUpdate } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { hasRole } = useRoles()
const hasAdminRole = hasRole('admin')

const profileId = computed(() => routeLocation.params.id as string)
const customerProfileHref = computed(() => buildJourneyUrl('customer', `profile/${profileId.value}`))

const profileCollapsed = ref(false)
const encountersCollapsed = ref(false)
const showScheduleDialog = ref(false)
const mentorId = computed(() => profileDetail.value?.profile?.mentor_id || '')

const { data: profileDetail, isLoading, error: queryError } = useQuery({
  queryKey: ['profile', profileId],
  queryFn: () => api.getProfile(profileId.value),
})

const displayName = computed(() => {
  const profile = profileDetail.value?.profile
  if (!profile?.display_name) return 'Mentee'
  return profile.display_name.startsWith('Mentee: ')
    ? profile.display_name
    : `Mentee: ${profile.display_name}`
})

const profileEmail = computed(() => profileDetail.value?.profile.email)
const profileGoals = computed(() => profileDetail.value?.profile.goals ?? [])
const profileInterests = computed(() => profileDetail.value?.profile.interests ?? [])

const menteeCardModel = computed<Record<string, unknown>>(() => ({
  ...profileDetail.value?.mentee,
}))

const breadcrumbsModel = computed<Record<string, unknown>>(() => {
  const mentee = profileDetail.value?.mentee
  const profile = profileDetail.value?.profile
  return {
    status: mentee?.status || profile?.status || 'active',
    created: mentee?.created || profile?.created,
    saved: mentee?.saved || profile?.saved,
  }
})

const allEncounters = computed((): Encounter[] => profileDetail.value?.encounters ?? [])

const nextScheduledEncounter = computed(() => getNextScheduledEncounter(allEncounters.value))

const nextScheduledDate = computed(() => {
  const enc = nextScheduledEncounter.value
  if (!enc) return undefined
  return enc.appointment?.from || enc.date || enc.created?.at_time
})

const canStartEncounter = computed(() => isEncounterDateToday(nextScheduledDate.value))

const completedEncounters = computed((): Encounter[] => {
  return allEncounters.value
    .filter((e) => e.status === 'complete')
    .sort((a, b) => {
      const aTime = a.appointment?.from || a.date || a.created?.at_time || ''
      const bTime = b.appointment?.from || b.date || b.created?.at_time || ''
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
})

function encounterDateDisplay(date?: string) {
  return date ? formatDate(date) : '—'
}

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const { mutateAsync: updateMentee } = useMutation({
  mutationFn: (data: MenteeUpdate) => {
    const menteeId = profileDetail.value?.mentee._id
    if (!menteeId) {
      return Promise.reject(new Error('Mentee document not loaded'))
    }
    return api.updateMentee(menteeId, data)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile', profileId.value] })
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateMenteeField(field: string, value: unknown) {
  if (!['summary', 'notes'].includes(field)) {
    throw new Error(`Unsupported mentee field: ${field}`)
  }
  await updateMentee({ [field]: String(value ?? '') } as MenteeUpdate)
}

const notesText = ref('')
watch(
  () => profileDetail.value?.mentee?.notes,
  (val) => {
    notesText.value = val ?? ''
  },
  { immediate: true }
)

let notesDebounceTimer: ReturnType<typeof setTimeout> | null = null
function handleNotesInput(val: string) {
  notesText.value = val
  if (notesDebounceTimer) clearTimeout(notesDebounceTimer)
  notesDebounceTimer = setTimeout(() => {
    updateMenteeField('notes', val)
  }, 500)
}

function handleNotesBlur() {
  if (notesDebounceTimer) {
    clearTimeout(notesDebounceTimer)
    notesDebounceTimer = null
  }
  updateMenteeField('notes', notesText.value)
}

provideDataCardContext({
  model: () => menteeCardModel.value,
  onSave: updateMenteeField,
})

const { mutate: scheduleEncounters, isPending: isScheduling } = useMutation<Encounter[], Error, ScheduleEncounterInput>({
  mutationFn: (payload: ScheduleEncounterInput) => api.scheduleEncounters(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile', profileId.value] })
    showScheduleDialog.value = false
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

function handleScheduleEncounters(payload: ScheduleEncounterInput) {
  if (!payload.mentor_id) {
    errorRef.value = new Error('Mentor is not assigned to this profile.')
    return
  }
  scheduleEncounters(payload)
}

const { mutate: startEncounterMutation, isPending: isStartingEncounter } = useMutation({
  mutationFn: (encounterId: string) => api.startEncounter(encounterId),
  onSuccess: (encounter) => {
    queryClient.invalidateQueries({ queryKey: ['profile', profileId.value] })
    queryClient.invalidateQueries({ queryKey: ['encounter', encounter._id] })
    router.push(`/encounter/${encounter._id}`)
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

function handleStartEncounter() {
  if (!nextScheduledEncounter.value?._id) return
  startEncounterMutation(nextScheduledEncounter.value._id)
}
</script>

<style scoped>
.mentee-title-link:hover {
  text-decoration: underline !important;
}
</style>
