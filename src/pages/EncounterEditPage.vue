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
                <!-- R124 -->
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
                <!-- R125 -->
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
              <!-- R126 -->
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
                <!-- R126 -->
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
                <!-- R126 -->
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
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'

const routeLocation = useRoute()
const router = useRouter()

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

const backLabel = computed(() => (menteeId.value ? 'Back to Profile' : 'Back to Encounters'))

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

function goBack() {
  if (menteeId.value) {
    router.push(`/profiles/${menteeId.value}`)
    return
  }
  router.push('/encounters')
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
