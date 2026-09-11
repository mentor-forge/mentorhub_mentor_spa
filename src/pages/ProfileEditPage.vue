<template>
  <v-container>
    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="profileDetail">
      <!-- Card 1: Mentee Name -->
      <v-row>
        <v-col cols="12">
          <DataCard
            v-model:collapsed="profileCollapsed"
            :title="displayName"
            :model="menteeCardModel"
            :on-save="updateMenteeField"
            automation-id="profile-edit-profile-section"
          >
            <template #actions>
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
                class="ml-2"
                :loading="isStartingEncounter"
                data-automation-id="profile-edit-start-encounter-button"
                @click="handleStartEncounter"
              >
                <v-icon start>mdi-play</v-icon>
                Start Encounter
              </v-btn>
            </template>

            <!-- Minimal Profile data: Goals and Interests -->
            <div class="mb-4">
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

            <div class="mb-6">
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

            <!-- Editable Mentee collection fields: Summary and Notes -->
            <SentenceEditor
              field="summary"
              label="Summary"
              automation-id="profile-edit-mentee-summary-input"
            />
            <MarkdownEditor
              field="notes"
              label="Notes"
              :rows="4"
              class="mt-4"
              automation-id="profile-edit-mentee-notes-input"
            />
          </DataCard>
        </v-col>
      </v-row>

      <!-- Card 2: Encounters -->
      <v-row class="mt-4">
        <v-col cols="12">
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

              <v-list v-else lines="one" data-automation-id="profile-edit-encounters-list">
                <v-list-item
                  v-for="encounter in completedEncounters"
                  :key="encounter._id"
                  data-automation-id="profile-edit-encounter-item"
                >
                  <v-list-item-title>
                    <router-link
                      :to="`/encounter/${encounter._id}`"
                      class="text-decoration-none text-primary font-weight-medium"
                      data-automation-id="profile-edit-encounter-date-link"
                    >
                      {{ encounterDateDisplay(encounter.appointment?.from || encounter.date || encounter.created?.at_time) }}:
                    </router-link>
                    <span class="ml-1">{{ encounter.tldr || 'Encounter' }}</span>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </MhCard>
        </v-col>
      </v-row>

      <!-- Card 3: Breadcrumbs (admin only) -->
      <v-row v-if="hasRole('admin')" class="mt-4">
        <v-col cols="12">
          <DataCard
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
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col>
          <v-btn
            :href="dashboardHref"
            variant="text"
            data-automation-id="profile-edit-dashboard-link"
          >
            Back to Dashboard
          </v-btn>
        </v-col>
      </v-row>
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
  MarkdownEditor,
  MhCard,
  SentenceEditor,
  buildJourneyUrl,
  formatDate,
  useErrorHandler,
} from '@mentor-forge/mentorhub_spa_utils'
import { ScheduleEncountersDialog } from '@/components/dashboard'
import { api } from '@/api/client'
import { useRoles } from '@/composables/useRoles'
import { isEncounterDateToday, getNextScheduledEncounter } from '@/utils/date'
import type { Encounter, ScheduleEncounterInput, MenteeUpdate } from '@/api/types'

const dashboardHref = buildJourneyUrl('discovery')

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { hasRole } = useRoles()

const profileId = computed(() => routeLocation.params.id as string)

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
  if (!profile) return 'Mentee'
  return profile.display_name || 'Mentee'
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
