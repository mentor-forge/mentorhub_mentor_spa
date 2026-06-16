<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4" data-automation-id="profile-dashboard-heading">Dashboard</h1>
      </v-col>
    </v-row>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-row v-if="!isLoading && profiles.length === 0">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" data-automation-id="profile-dashboard-empty">
          No mentees are assigned to you yet.
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="profile in profiles"
        :key="profile._id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          hover
          class="h-100"
          data-automation-id="profile-dashboard-card"
          @click="navigateToProfile(profile)"
        >
          <v-card-title>
            {{ profile.name || 'Unnamed Profile' }}
          </v-card-title>

          <v-card-text>
            <p class="mb-3 text-medium-emphasis">
              {{ profile.description || 'No description' }}
            </p>

            <div class="d-flex flex-wrap ga-2 mb-3">
              <v-chip size="small" color="primary" variant="tonal">
                Library: {{ profile.progress.library }}
              </v-chip>
              <v-chip size="small" color="secondary" variant="tonal">
                Now: {{ profile.progress.now }}
              </v-chip>
              <v-chip size="small" variant="tonal">
                Next: {{ profile.progress.next }}
              </v-chip>
            </div>

            <div v-if="profile.last_encounter">
              <p class="text-caption text-medium-emphasis mb-1">
                Last encounter · {{ formatDate(profile.last_encounter.date) }}
              </p>
              <p class="mb-0">
                {{ profile.last_encounter.tldr || profile.last_encounter.summary || 'No summary' }}
              </p>
            </div>
            <p v-else class="text-caption text-medium-emphasis mb-0">
              No encounters yet
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load dashboard: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { MentorDashboardProfile } from '@/api/types'

const router = useRouter()

const { data, isLoading, error: queryError } = useQuery({
  queryKey: ['profiles', 'dashboard'],
  queryFn: () => api.getProfiles(),
})

const profiles = computed(() => data.value ?? [])

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

function navigateToProfile(profile: MentorDashboardProfile) {
  router.push(`/profiles/${profile._id}`)
}
</script>
