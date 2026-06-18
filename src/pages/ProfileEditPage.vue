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
              <p class="text-medium-emphasis">Section content in R108.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card data-automation-id="profile-edit-notes-section">
            <v-card-title>Notes</v-card-title>
            <v-card-text>
              <p class="text-medium-emphasis">Section content in R108.</p>
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
import { useQuery } from '@tanstack/vue-query'
import { useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'

const routeLocation = useRoute()
const router = useRouter()

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

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)
</script>
