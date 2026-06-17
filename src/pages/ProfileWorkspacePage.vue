<template>
  <v-container>
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <h1 class="text-h4" data-automation-id="mentee-section-heading">
            {{ profile?.name || 'Mentee' }}
          </h1>
          <div class="d-flex ga-2">
            <v-btn
              v-if="showPropertiesButton"
              variant="outlined"
              data-automation-id="mentee-properties-button"
              @click="router.push(`/profiles/${profileId}/properties`)"
            >
              Properties
            </v-btn>
            <v-btn
              variant="text"
              data-automation-id="mentee-back-dashboard-button"
              @click="router.push('/profiles')"
            >
              Back to Dashboard
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <router-view />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/api/client'

const route = useRoute()
const router = useRouter()

const profileId = computed(() => route.params.id as string)
const showPropertiesButton = computed(() => route.name === 'MenteeSection')

const { data: profile } = useQuery({
  queryKey: ['profile', profileId],
  queryFn: () => api.getProfile(profileId.value),
})
</script>
