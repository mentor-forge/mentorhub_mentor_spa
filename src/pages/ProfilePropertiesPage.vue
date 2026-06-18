<template>
  <v-row v-if="isLoading">
    <v-col class="text-center">
      <v-progress-circular indeterminate color="primary" />
    </v-col>
  </v-row>

  <template v-else-if="data">
    <v-row class="mb-4" data-automation-id="profile-properties-summary">
      <v-col class="d-flex flex-wrap ga-2">
        <v-chip v-if="data.status_summary.profile_status">
          Profile: {{ data.status_summary.profile_status }}
        </v-chip>
        <v-chip v-if="data.status_summary.journey_status">
          Journey: {{ data.status_summary.journey_status }}
        </v-chip>
        <v-chip>Library: {{ data.status_summary.library_count }}</v-chip>
        <v-chip>Now: {{ data.status_summary.now_count }}</v-chip>
        <v-chip>Next: {{ data.status_summary.next_count }}</v-chip>
        <v-chip>Encounters: {{ data.status_summary.encounters_count }}</v-chip>
        <v-chip>Resources: {{ data.status_summary.resources_engaged }}</v-chip>
      </v-col>
    </v-row>

    <v-card class="mb-4" data-automation-id="profile-properties-sites">
      <v-card-title>Sites &amp; links</v-card-title>
      <v-card-text>
        <v-alert v-if="data.sites_and_links.length === 0" type="info" variant="tonal">
          No journey resources yet.
        </v-alert>
        <v-list v-else>
          <v-list-item
            v-for="item in data.sites_and_links"
            :key="`${item.resource_id}-${item.scope}`"
          >
            <v-list-item-title>{{ item.name }} ({{ item.scope }})</v-list-item-title>
            <v-list-item-subtitle>
              <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">
                {{ item.url }}
              </a>
              <span v-else>No URL</span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-card class="mb-4" data-automation-id="profile-properties-mentors">
      <v-card-title>Mentor history</v-card-title>
      <v-card-text>
        <v-alert v-if="data.mentor_history.length === 0" type="info" variant="tonal">
          No mentor encounters recorded yet.
        </v-alert>
        <v-list v-else>
          <v-list-item v-for="mentor in data.mentor_history" :key="mentor.mentor_id">
            <v-list-item-title>{{ mentor.mentor_name || mentor.mentor_id }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ mentor.encounter_count }} encounter(s)
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-card class="mb-4" data-automation-id="profile-properties-usage">
      <v-card-title>Resource usage</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="usageHeaders"
          :items="data.resource_usage"
          hide-default-footer
          :items-per-page="-1"
        />
      </v-card-text>
    </v-card>

    <v-card class="mb-4" data-automation-id="profile-properties-celebrations">
      <v-card-title>Celebrations</v-card-title>
      <v-card-text>
        <v-alert v-if="data.celebrations.length === 0" type="info" variant="tonal">
          No completed tasks yet.
        </v-alert>
        <v-list v-else>
          <v-list-item v-for="item in data.celebrations" :key="item.resource_id">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>
              Completed {{ formatDate(item.completed_at) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-btn
      variant="text"
      data-automation-id="profile-properties-back-button"
      @click="router.push(`/profiles/${profileId}`)"
    >
      Back to profile
    </v-btn>
  </template>

  <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
    {{ errorMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { formatDate, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'

const route = useRoute()
const router = useRouter()
const profileId = computed(() => route.params.id as string)

const { data, isLoading, error: queryError } = useQuery({
  queryKey: ['profile', profileId, 'properties'],
  queryFn: () => api.getProfileProperties(profileId.value),
})

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })
const { showError, errorMessage } = useErrorHandler(errorRef as any)

const usageHeaders = [
  { title: 'Resource', key: 'name' },
  { title: 'Times used', key: 'times_used' },
  { title: 'Status', key: 'status' },
]
</script>
