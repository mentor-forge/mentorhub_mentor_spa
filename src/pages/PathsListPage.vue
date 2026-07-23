<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Paths</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <ListPageSearch
          :searchable="true"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="path-list-search"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end align-center">
        <v-btn
          color="primary"
          to="/paths/new"
          data-automation-id="path-list-new-button"
        >
          <v-icon left>mdi-plus</v-icon>
          New Path
        </v-btn>
      </v-col>
    </v-row>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" data-automation-id="path-list-loading" />

    <CardGrid v-else automation-id="path-list-grid">
      <MhCard
        v-for="path in paths"
        :key="path._id"
        :title="path.name"
        :automation-id="`path-list-card-${path._id}`"
      >
        <template #actions>
          <v-btn
            icon
            variant="text"
            size="small"
            :aria-label="`Edit ${path.name}`"
            :data-automation-id="`path-list-card-${path._id}-edit-button`"
            @click="navigateToPath(path)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>

        <p class="text-body-2">{{ path.description }}</p>
      </MhCard>
    </CardGrid>

    <div v-if="!isLoading && paths.length === 0" class="text-body-1 text-medium-emphasis py-4">
      No paths found.
    </div>

    <div v-if="hasMore" class="d-flex justify-center mt-4">
      <v-btn
        color="primary"
        :loading="isFetchingNextPage"
        data-automation-id="path-list-load-more"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load paths: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CardGrid, ListPageSearch, MhCard } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { Path } from '@/api/types'
import { useOffsetList } from '@/composables/useOffsetList'

const router = useRouter()

const {
  items: paths,
  isLoading,
  isFetchingNextPage,
  hasMore,
  loadMore,
  showError,
  errorMessage,
  searchQuery,
  debouncedSearch,
} = useOffsetList<Path>({
  queryKey: ['paths'],
  queryFn: (params) => api.getPaths(params),
  size: 20,
})

function navigateToPath(path: Path) {
  router.push(`/paths/${path._id}`)
}
</script>
