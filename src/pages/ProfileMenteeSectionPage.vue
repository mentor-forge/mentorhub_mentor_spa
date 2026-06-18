<template>
  <v-row v-if="isLoading">
    <v-col class="text-center">
      <v-progress-circular indeterminate color="primary" />
    </v-col>
  </v-row>

  <v-row v-else-if="profile">
    <v-col cols="12" md="8">
      <v-card>
        <v-card-text>
          <v-text-field
            :model-value="profile.name"
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
            :model-value="profile.status || 'N/A'"
            label="Status"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-status"
          />

          <AutoSaveField
            v-if="notesEncounterId"
            :model-value="notesSummary"
            label="Mentor notes"
            textarea
            :rows="4"
            class="mt-4"
            automation-id="mentee-mentor-notes"
            :on-save="saveNotes"
          />
          <v-textarea
            v-else
            v-model="draftNotes"
            label="Mentor notes"
            variant="outlined"
            rows="4"
            class="mt-4"
            data-automation-id="mentee-mentor-notes"
            hint="Save to create your first encounter notes"
            persistent-hint
          />
          <v-btn
            v-if="!notesEncounterId"
            class="mt-2"
            variant="tonal"
            :loading="isSavingNotes"
            data-automation-id="mentee-save-notes-button"
            @click="saveDraftNotes"
          >
            Save notes
          </v-btn>

          <v-text-field
            :model-value="formatDate(profile.schedule?.starting)"
            label="Start date"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-start-date"
          />
          <v-text-field
            :model-value="profile.location || '—'"
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
            :model-value="profile.email || '—'"
            label="Email"
            readonly
            variant="outlined"
            class="mt-4"
            data-automation-id="mentee-email"
          />
          <v-text-field
            :model-value="profile.phone || '—'"
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
import type { Encounter } from '@/api/types'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const profileId = computed(() => route.params.id as string)
const draftNotes = ref('')
const isSavingNotes = ref(false)
const errorRef = ref<Error | null>(null)
const { showError, errorMessage } = useErrorHandler(errorRef as any)

const { data: profile, isLoading } = useQuery({
  queryKey: ['profile', profileId],
  queryFn: () => api.getProfile(profileId.value),
})

const { data: encounterPage } = useQuery({
  queryKey: ['encounters', 'mentee', profileId],
  queryFn: () => api.getEncounters({ limit: 100 }),
})

const menteeEncounters = computed(() =>
  (encounterPage.value?.items ?? [])
    .filter((encounter: Encounter) => encounter.mentee_id === profileId.value)
    .sort((a, b) => (a.date || '').localeCompare(b.date || '')),
)

const firstEncounter = computed(() => menteeEncounters.value[0])
const notesEncounter = computed(() => menteeEncounters.value[menteeEncounters.value.length - 1])
const notesEncounterId = computed(() => notesEncounter.value?._id)
const notesSummary = computed(() => notesEncounter.value?.summary || '')
const firstEncounterLabel = computed(() =>
  firstEncounter.value
    ? `${formatDate(firstEncounter.value.date)} — ${firstEncounter.value.tldr || 'Encounter'}`
    : 'No encounters yet',
)

const currentJob = computed(() => profile.value?.experience?.[0])
const currentRole = computed(() => currentJob.value?.roles?.[0])

function goNewEncounter() {
  router.push({ path: '/encounters/new', query: { menteeId: profileId.value } })
}

async function saveNotes(value: string | number) {
  const id = notesEncounterId.value
  if (!id) {
    return
  }
  try {
    await api.updateEncounter(id, { summary: String(value) })
    await queryClient.invalidateQueries({ queryKey: ['encounters', 'mentee', profileId] })
    errorRef.value = null
  } catch (error) {
    errorRef.value = error as Error
  }
}

async function saveDraftNotes() {
  if (!draftNotes.value.trim()) {
    return
  }
  isSavingNotes.value = true
  try {
    await api.createEncounter({
      mentee_id: profileId.value,
      tldr: 'Session notes',
      summary: draftNotes.value.trim(),
      status: 'active',
    })
    draftNotes.value = ''
    await queryClient.invalidateQueries({ queryKey: ['encounters', 'mentee', profileId] })
    errorRef.value = null
  } catch (error) {
    errorRef.value = error as Error
  } finally {
    isSavingNotes.value = false
  }
}
</script>
