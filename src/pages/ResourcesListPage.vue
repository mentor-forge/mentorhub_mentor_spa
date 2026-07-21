<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4" data-automation-id="resource-list-heading">Resources</h1>
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
          <v-icon start>mdi-plus</v-icon>
          New Resource
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="!isLoading && resources.length === 0">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" data-automation-id="resource-list-empty">
          No resources found.
        </v-alert>
      </v-col>
    </v-row>

    <CardGrid automation-id="resource-list-grid">
      <MhCard
        v-for="resource in resources"
        :key="resource._id"
        :title="resource.name || 'Unnamed Resource'"
        :automation-id="`resource-list-card-${resource._id}`"
      >
        <template #actions>
          <v-btn
            icon
            variant="text"
            size="small"
            :data-automation-id="`resource-list-card-${resource._id}-open-button`"
            aria-label="Open"
            @click="navigateToResource(resource)"
          >
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </template>

        <p class="text-body-2 text-medium-emphasis">
          {{ resource.description || 'No description' }}
        </p>
      </MhCard>
    </CardGrid>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load resources: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { CardGrid, MhCard, ListPageSearch, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { Resource } from '@/api/types'

// GET /api/resource is still cursor-paginated (items/limit/has_more/next_cursor) rather than a
// plain array or offset/size headers. Until that endpoint is reshaped, this page fetches a single
// batch at the API's max page size and does not re-page — see Execution Notes below.
const RESOURCE_FETCH_LIMIT = 100

const router = useRouter()
const searchQuery = ref('')
const debouncedQuery = ref('')

let searchTimeout: ReturnType<typeof setTimeout>
function debouncedSearch(value: string | null) {
  searchQuery.value = value || ''
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedQuery.value = value || ''
  }, 300)
}

const { data, isLoading, error: queryError } = useQuery({
  queryKey: computed(() => ['resources', debouncedQuery.value]),
  queryFn: () =>
    api.getResources({
      name: debouncedQuery.value || undefined,
      limit: RESOURCE_FETCH_LIMIT,
    }),
})

const resources = computed(() => data.value?.items ?? [])

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

function navigateToResource(resource: Resource) {
  router.push(`/resources/${resource._id}`)
}
</script>
