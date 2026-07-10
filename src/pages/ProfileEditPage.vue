<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4" data-automation-id="profile-edit-heading">
          {{ displayName }}
        </h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="profileDetail">
      <v-row>
        <v-col cols="12">
          <v-card data-automation-id="profile-edit-profile-section">
            <v-card-title
              class="d-flex align-center cursor-pointer"
              data-automation-id="profile-edit-profile-toggle"
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
                <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="displayName"
                    label="Name"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-name"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileDetail.profile.status || '—'"
                    label="Status"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-status"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="startDateDisplay"
                    label="Start Date"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-start-date"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileDetail.profile.location || '—'"
                    label="Location"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-location"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="employerDisplay"
                    label="Employer"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-employer"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="jobTitleDisplay"
                    label="Job Title"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-job-title"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileDetail.profile.email || '—'"
                    label="Email"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-email"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileDetail.profile.phone || '—'"
                    label="Phone"
                    readonly
                    variant="outlined"
                    density="compact"
                    data-automation-id="profile-edit-profile-phone"
                  />
                </v-col>
              </v-row>
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="profile-edit-notes-section">
            <v-card-title
              class="d-flex align-center cursor-pointer"
              data-automation-id="profile-edit-notes-toggle"
              @click="notesExpanded = !notesExpanded"
            >
              <v-icon
                :icon="notesExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                class="mr-2"
              />
              <h2 class="text-h4 mb-0 font-italic">Notes</h2>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="notesExpanded">
              <AutoSaveField
                :model-value="profileDetail.mentee.description || ''"
                label="Relationship Summary"
                :on-save="(value: string | number) => updateMenteeField('description', String(value))"
                automation-id="profile-edit-notes-description-input"
              />

              <AutoSaveField
                :model-value="profileDetail.mentee.focus || ''"
                label="Focus"
                :on-save="(value: string | number) => updateMenteeField('focus', String(value))"
                class="mt-4"
                automation-id="profile-edit-notes-focus-input"
              />

              <AutoSaveField
                :model-value="profileDetail.mentee.homework || ''"
                label="Homework"
                :on-save="(value: string | number) => updateMenteeField('homework', String(value))"
                class="mt-4"
                textarea
                :rows="3"
                automation-id="profile-edit-notes-homework-input"
              />

              <AutoSaveField
                :model-value="profileDetail.mentee.notes || ''"
                label="Mentor Notes"
                :on-save="(value: string | number) => updateMenteeField('notes', String(value))"
                class="mt-4"
                textarea
                :rows="4"
                automation-id="profile-edit-notes-input"
              />
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="profile-edit-encounters-section">
            <v-card-title class="d-flex align-center">
              <div
                class="d-flex align-center flex-grow-1 cursor-pointer"
                data-automation-id="profile-edit-encounters-toggle"
                @click="encountersExpanded = !encountersExpanded"
              >
                <v-icon
                  :icon="encountersExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                  class="mr-2"
                />
                <h2 class="text-h4 mb-0 font-italic">Encounters</h2>
              </div>
              <v-btn
                color="primary"
                data-automation-id="profile-edit-new-encounter-button"
                @click.stop="showPlanDialog = true"
              >
                <v-icon start>mdi-plus</v-icon>
                New Encounter
              </v-btn>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="encountersExpanded">
              <p
                v-if="firstEncounterDate"
                class="text-body-2 text-medium-emphasis mb-4"
                data-automation-id="profile-edit-first-encounter-date"
              >
                First encounter: {{ firstEncounterDate }}
              </p>

              <v-alert
                v-if="sortedEncounters.length === 0"
                type="info"
                variant="tonal"
                data-automation-id="profile-edit-encounters-empty"
              >
                No encounters recorded for this mentee yet.
              </v-alert>

              <v-list v-else lines="two" data-automation-id="profile-edit-encounters-list">
                <v-list-item
                  v-for="encounter in sortedEncounters"
                  :key="encounter._id"
                  :to="`/encounters/${encounter._id}`"
                  data-automation-id="profile-edit-encounter-item"
                >
                  <v-list-item-title>
                    {{ encounter.tldr || 'Encounter' }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ encounterDateDisplay(encounter.date) }}
                    <span v-if="encounter.status"> · {{ encounter.status }}</span>
                  </v-list-item-subtitle>
                  <template v-if="encounter.summary" #append>
                    <span class="text-caption text-medium-emphasis d-none d-md-inline">
                      {{ encounter.summary }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col>
          <v-btn
            @click="router.push('/profiles')"
            variant="text"
            data-automation-id="profile-edit-back-button"
          >
            Back to Dashboard
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>

    <PlanSelectDialog
      v-model="showPlanDialog"
      automation-prefix="profile-edit-new-encounter-plan"
      :loading="isCreatingEncounter"
      @submit="handleCreateEncounter"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { AutoSaveField, formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { PlanSelectDialog } from '@/components/dashboard'
import { api } from '@/api/client'
import type { Encounter, EncounterInput, MenteeUpdate, ProfileExperience } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const profileId = computed(() => routeLocation.params.id as string)

const profileExpanded = ref(true)
const notesExpanded = ref(true)
const encountersExpanded = ref(true)
const showPlanDialog = ref(false)

const { data: profileDetail, isLoading, error: queryError } = useQuery({
  queryKey: ['profile', profileId],
  queryFn: () => api.getProfile(profileId.value),
})

const displayName = computed(() => {
  const profile = profileDetail.value?.profile
  if (!profile) return 'Profile'
  return profile.full_name || profile.name
})

const latestExperience = computed((): ProfileExperience | undefined => {
  return profileDetail.value?.profile.experience?.[0]
})

const latestRole = computed(() => latestExperience.value?.roles?.[0])

const employerDisplay = computed(() => latestExperience.value?.company || '—')
const jobTitleDisplay = computed(() => latestRole.value?.title || '—')

const startDateDisplay = computed(() => {
  const roleStart = latestRole.value?.start
  if (roleStart) return formatDate(roleStart)

  const created = profileDetail.value?.profile.created?.at_time
  if (created) return formatDate(created)

  return '—'
})

const { mutate: createEncounter, isPending: isCreatingEncounter } = useMutation<{ _id: string }, Error, EncounterInput>({
  mutationFn: (payload: EncounterInput) => api.createEncounter(payload),
  onSuccess: (response) => {
    queryClient.invalidateQueries({ queryKey: ['profile', profileId.value] })
    showPlanDialog.value = false
    errorRef.value = null
    router.push(`/encounters/${response._id}`)
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

function handleCreateEncounter(planId: string) {
  const mentorId = profileDetail.value?.profile.mentor_id
  if (!mentorId) {
    errorRef.value = new Error('Mentor is not assigned to this profile.')
    return
  }

  createEncounter({
    mentor_id: mentorId,
    mentee_id: profileId.value,
    plan_id: planId,
    status: 'active',
  })
}

const sortedEncounters = computed((): Encounter[] => {
  const encounters = profileDetail.value?.encounters ?? []
  return [...encounters].sort((a, b) => {
    const aTime = a.date || a.created.at_time
    const bTime = b.date || b.created.at_time
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
})

const firstEncounterDate = computed(() => {
  if (sortedEncounters.value.length === 0) return null
  const oldest = [...sortedEncounters.value].sort((a, b) => {
    const aTime = a.date || a.created.at_time
    const bTime = b.date || b.created.at_time
    return new Date(aTime).getTime() - new Date(bTime).getTime()
  })[0]
  return encounterDateDisplay(oldest.date || oldest.created.at_time)
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

async function updateMenteeField(field: keyof MenteeUpdate, value: string) {
  await updateMentee({ [field]: value })
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
