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
            <v-card-title>Profile</v-card-title>
            <v-card-text>
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
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="profile-edit-notes-section">
            <v-card-title>Notes</v-card-title>
            <v-card-text>
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
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="profile-edit-encounters-section">
            <v-card-title>Encounters</v-card-title>
            <v-card-text>
              <p class="text-medium-emphasis">Section content in R109.</p>
            </v-card-text>
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
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { AutoSaveField, formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { MenteeUpdate, ProfileExperience } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const profileId = computed(() => routeLocation.params.id as string)

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
