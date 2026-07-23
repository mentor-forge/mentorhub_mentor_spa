<template>
  <v-container>
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

    <v-row>
      <v-col>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="(resources ?? []) as unknown as Resource[]"
            :loading="isLoading as unknown as boolean"
            @click:row="navigateToResource"
            hover
            :items-per-page="-1"
            hide-default-footer
          >
            <template v-slot:header.name>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('name')">
                Name
                <v-icon v-if="sortByValue === 'name'" size="small">
                  {{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </span>
            </template>
            <template v-slot:header.status>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('status')">
                Status
                <v-icon v-if="sortByValue === 'status'" size="small">
                  {{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </span>
            </template>
            <template v-slot:header.created.at_time>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('created.at_time')">
                Created
                <v-icon v-if="sortByValue === 'created.at_time'" size="small">
                  {{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </span>
            </template>
            <template v-slot:header.saved.at_time>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('saved.at_time')">
                Last Saved
                <v-icon v-if="sortByValue === 'saved.at_time'" size="small">
                  {{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </span>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.status === 'active' ? 'success' : 'grey'"
                size="small"
              >
                {{ item.status || 'N/A' }}
              </v-chip>
            </template>
            <template v-slot:item.created.at_time="{ item }">
              {{ formatDate(item.created.at_time) }}
            </template>
            <template v-slot:item.saved.at_time="{ item }">
              {{ formatDate(item.saved.at_time) }}
            </template>
          </v-data-table>
          
          <!-- Load more button -->
          <v-card-actions v-if="hasMoreValue">
            <v-btn
              @click="loadMore"
              :loading="isFetchingNextPageValue"
              color="primary"
              block
              data-automation-id="resource-list-load-more"
            >
              {{ isFetchingNextPageValue ? 'Loading...' : 'Load More' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load resources: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * Resources List Page
 *
 * Temporary adapter: spa_utils useInfiniteScroll still expects cursor-shaped
 * responses. getResources now returns a plain array with offset/size headers
 * (OpenAPI). R138 will replace this with CardGrid + offset list.
 */
import { computed } from 'vue'
import { api } from '@/api/client'
import { formatDate, ListPageSearch, useInfiniteScroll } from '@mentor-forge/mentorhub_spa_utils'
import type { InfiniteScrollParams, InfiniteScrollResponse } from '@mentor-forge/mentorhub_spa_utils'
import { useRouter } from 'vue-router'
import type { Resource } from '@/api/types'

const router = useRouter()

/** Bridge InfiniteScrollParams → offset/size ListParams until R138. */
async function fetchResourcesPage(
  params: InfiniteScrollParams
): Promise<InfiniteScrollResponse<Resource>> {
  const items = await api.getResources({
    name: params.name,
    offset: 0,
    size: params.limit,
    sort_by: params.sort_by,
    order: params.order,
  })
  // Disable cursor load-more; first page only until CardGrid offset list (R138).
  return {
    items,
    limit: params.limit,
    has_more: false,
    next_cursor: null,
  }
}

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
  sortBy,
  order,
  setSortBy,
  setOrder,
} = useInfiniteScroll<Resource>({
  queryKey: ['resources'],
  queryFn: fetchResourcesPage,
  getItemId: (item) => item._id,
  limit: 20,
})

// Simple navigation handler
function navigateToResource(_event: unknown, { item }: { item: Resource }) {
  router.push(`/resources/${item._id}`)
}

// Create computed properties for template use (TypeScript-friendly)
const sortByValue = computed(() => sortBy.value)
const orderValue = computed(() => order.value)
const hasMoreValue = computed(() => hasMore.value)
const isFetchingNextPageValue = computed(() => isFetchingNextPage.value)

function handleSort(field: string) {
  if (sortBy.value === field) {
    setOrder(order.value === 'asc' ? 'desc' : 'asc')
  } else {
    setSortBy(field)
    setOrder('asc')
  }
}

const headers = [
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Created', key: 'created.at_time', sortable: false },
  { title: 'Last Saved', key: 'saved.at_time', sortable: false },
]

</script>