<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Resources</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <ListPageSearch
          :searchable="true"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="resource-list-search"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end align-center">
        <v-btn 
          color="primary" 
          to="/resources/new"
          data-automation-id="resource-list-new-button"
        >
          <v-icon left>mdi-plus</v-icon>
          New Resource
        </v-btn>
      </v-col>
    </v-row>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      data-automation-id="resource-list-loading"
    />

    <CardGrid v-else automation-id="resource-list-grid">
      <MhCard
        v-for="resource in resources"
        :key="resource._id"
        :title="resource.name"
        :automation-id="`resource-list-card-${resource._id}`"
      >
        <template #actions>
          <v-btn
            icon
            variant="text"
            size="small"
            :aria-label="`Edit ${resource.name}`"
            :data-automation-id="`resource-list-card-${resource._id}-edit-button`"
            @click="navigateToResource(resource)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>

        <p class="text-body-2">{{ resource.description }}</p>
      </MhCard>
    </CardGrid>

    <div v-if="!isLoading && resources.length === 0" class="text-body-1 text-medium-emphasis py-4">
      No resources found.
    </div>

    <div v-if="hasMore" class="d-flex justify-center mt-4">
      <v-btn
        color="primary"
        :loading="isFetchingNextPage"
        data-automation-id="resource-list-load-more"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load resources: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { api } from '@/api/client'
import { CardGrid, ListPageSearch, MhCard } from '@mentor-forge/mentorhub_spa_utils'
import { useOffsetList } from '@/composables/useOffsetList'
import { useRouter } from 'vue-router'
import type { Resource } from '@/api/types'

const router = useRouter()

const {
  items: resources,
  isLoading,
  isFetchingNextPage,
  hasMore,
  loadMore,
  showError,
  errorMessage,
  searchQuery,
  debouncedSearch,
} = useOffsetList<Resource>({
  queryKey: ['resources'],
  queryFn: (params) => api.getResources(params),
  size: 20,
})

function navigateToResource(resource: Resource) {
  router.push(`/resources/${resource._id}`)
}
</script>