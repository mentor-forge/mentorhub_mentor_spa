<template>
  <v-row v-if="isLoading">
    <v-col class="text-center">
      <v-progress-circular indeterminate color="primary" />
    </v-col>
  </v-row>

  <v-row v-else-if="detail">
    <v-col cols="12" md="8">
      <v-card>
        <v-card-text>
          <v-text-field
            :model-value="detail.profile.name"
            label="Name"
            readonly
            variant="outlined"
            data-automation-id="mentee-profile-name"
          />

          <div class="d-flex align-center ga-2 mt-4 flex-wrap">
            <v-text-field
              :model-value="firstEncounterLabel"
              label="First encounter"
              readonly
              variant="outlined"
              class="flex-grow-1"
              data-automation-id="mentee-first-encounter"
            />
            <v-btn
              color="primary"
              data-automation-id="mentee-new-encounter-button"
              @click="goNewEncounter"
            >
              New encounter
            </v-btn>
          </div>

          <v-text-field
            :model-value="detail.profile.status || 'N/A'"
            label="Status"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-status"
          />

          <AutoSaveField
            v-if="detail.mentee._id"
            :model-value="detail.mentee.notes || ''"
            label="Mentor notes"
            textarea
            :rows="4"
            class="mt-4"
            automation-id="mentee-mentor-notes"
            :on-save="saveNotes"
          />

          <v-text-field
            :model-value="formatDate(startDate)"
            label="Start date"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-start-date"
          />
          <v-text-field
            :model-value="detail.profile.location || '—'"
            label="Location"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-location"
          />
          <v-text-field
            :model-value="currentJob?.company || '—'"
            label="Where they work"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-employer"
          />
          <v-text-field
            :model-value="currentRole?.title || '—'"
            label="Job title"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-job-title"
          />
          <v-text-field
            :model-value="detail.profile.email || '—'"
            label="Email"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-email"
          />
          <v-text-field
            :model-value="detail.profile.phone || '—'"
            label="Phone"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-phone"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
    {{ errorMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { AutoSaveField, formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const profileId = computed(() => route.params.id as string)
const errorRef = ref<Error | null>(null)
const { showError, errorMessage } = useErrorHandler(errorRef as any)

const { data: detail, isLoading } = useQuery({
  queryKey: ['profile', profileId],
  queryFn: () => api.getProfile(profileId.value),
})

const sortedEncounters = computed(() =>
  [...(detail.value?.encounters ?? [])].sort((a, b) =>
    (a.date || '').localeCompare(b.date || ''),
  ),
)

const firstEncounter = computed(() => sortedEncounters.value[0])
const firstEncounterLabel = computed(() =>
  firstEncounter.value
    ? `${formatDate(firstEncounter.value.date)} — ${firstEncounter.value.tldr || 'Encounter'}`
    : 'No encounters yet',
)

const startDate = computed(
  () => detail.value?.mentee.schedule?.starting || detail.value?.profile.schedule?.starting,
)

const currentJob = computed(() => detail.value?.profile.experience?.[0])
const currentRole = computed(() => currentJob.value?.roles?.[0])

function goNewEncounter() {
  router.push({ path: '/encounters/new', query: { menteeId: profileId.value } })
}

async function saveNotes(value: string | number) {
  const menteeId = detail.value?.mentee._id
  if (!menteeId) {
    return
  }
  try {
    await api.updateMentee(menteeId, { notes: String(value) })
    await queryClient.invalidateQueries({ queryKey: ['profile', profileId] })
    errorRef.value = null
  } catch (error) {
    errorRef.value = error as Error
  }
}
</script>
