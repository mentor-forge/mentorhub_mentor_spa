<template>
  <DashboardPageLayout
    title="Dashboard"
    heading-automation-id="profile-dashboard-heading"
    :is-loading="isLoading"
    :show-empty="!isLoading && profiles.length === 0"
    empty-automation-id="profile-dashboard-empty"
    empty-message="No mentees are assigned to you yet."
    :show-error="showError as unknown as boolean"
    :error-message="errorMessage"
    error-prefix="Failed to load dashboard: "
  >
    <DashboardCardGrid>
      <v-col
        v-for="profile in profiles"
        :key="profile._id"
        cols="12"
        sm="6"
        md="4"
      >
        <DashboardCard
          automation-id="profile-dashboard-card"
          @click="navigateToProfile(profile)"
        >
          <template #title>
            {{ profile.name || 'Unnamed Profile' }}
          </template>

          <p class="dashboard-card__description text-medium-emphasis">
            {{ profile.description || 'No description' }}
          </p>

          <div class="dashboard-card__chips">
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
            <p class="dashboard-card__caption">
              {{ profile.last_encounter.tldr || profile.last_encounter.summary || 'No summary' }}
            </p>
          </div>
          <p v-else class="text-caption text-medium-emphasis dashboard-card__caption">
            No encounters yet
          </p>
        </DashboardCard>
      </v-col>
    </DashboardCardGrid>
  </DashboardPageLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { MentorDashboardProfile } from '@/api/types'
import {
  DashboardPageLayout,
  DashboardCardGrid,
  DashboardCard,
} from '@/components/dashboard'

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
