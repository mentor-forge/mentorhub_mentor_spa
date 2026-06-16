<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Dashboard</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <ListPageSearch
          :searchable="false"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="profile-list-search"
        />
      </v-col>
    </v-row>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-row>
      <v-col
        v-for="profile in profiles ?? []"
        :key="profile._id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          hover
          class="h-100"
          @click="navigateToProfile($event, { item: profile })"
        >
          <v-card-title>
            {{ profile.name || 'Unnamed Profile' }}
          </v-card-title>

          <v-card-text>
            <p class="mb-2">
              {{ profile.description || 'No description' }}
            </p>

            <v-chip size="small">
              {{ profile.status || 'N/A' }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" v-if="hasMoreValue">
        <v-btn
          @click="loadMore"
          :loading="isFetchingNextPageValue"
          color="primary"
          block
          data-automation-id="profile-list-load-more"
        >
          {{ isFetchingNextPageValue ? 'Loading...' : 'Load More' }}
        </v-btn>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load profiles: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { api } from '@/api/client'
import { ListPageSearch, useInfiniteScroll } from '@mentor-forge/mentorhub_spa_utils'
import { useRouter } from 'vue-router'
import type { Profile } from '@/api/types'

const router = useRouter()

const {
  items: profiles,
  isLoading,
  isFetchingNextPage,
  hasMore,
  loadMore,
  showError,
  errorMessage,
  searchQuery,
  debouncedSearch,
} = useInfiniteScroll<Profile>({
  queryKey: ['profiles'],
  queryFn: (params) => api.getProfiles(params),
  getItemId: (item) => item._id,
  limit: 20,
})

function navigateToProfile(_event: unknown, { item }: { item: Profile }) {
  router.push(`/profiles/${item._id}`)
}

const hasMoreValue = computed(() => hasMore.value)
const isFetchingNextPageValue = computed(() => isFetchingNextPage.value)
</script>