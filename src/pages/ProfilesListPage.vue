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
    <CardGrid automation-id="profile-dashboard-grid">
      <div
        v-for="profile in profiles"
        :key="profile._id"
        class="d-flex h-100"
        @click="navigateToProfile(profile)"
      >
        <MhCard
          :title="profile.name || 'Unnamed Profile'"
          automation-id="profile-dashboard-card"
        >
          <template #actions>
            <v-btn
              icon
              variant="text"
              size="small"
              data-automation-id="profile-dashboard-card-open-button"
              aria-label="Open profile"
              @click.stop="navigateToProfile(profile)"
            >
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </template>

          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ profile.description || 'No description' }}
          </p>
        </MhCard>
      </div>
    </CardGrid>
  </DashboardPageLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { CardGrid, MhCard, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { MentorDashboardProfile } from '@/api/types'
import { DashboardPageLayout } from '@/components/dashboard'

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
