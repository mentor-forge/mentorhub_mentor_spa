<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Encounters</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <ListPageSearch
          :searchable="true"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="encounter-list-search"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="(encounters ?? []) as unknown as Encounter[]"
            :loading="isLoading as unknown as boolean"
            @click:row="navigateToEncounter"
            hover
            :items-per-page="-1"
            hide-default-footer
          >
            <template v-slot:header.tldr>
              <span>TLDR</span>
            </template>
            <template v-slot:header.summary>
              <span>Summary</span>
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
              data-automation-id="encounter-list-load-more"
            >
              {{ isFetchingNextPageValue ? 'Loading...' : 'Load More' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load encounters: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * Encounters List Page - Showcase of mentorhub_spa_utils ease of use
 * 
 * This page demonstrates how easy it is to build a feature-rich list page with:
 * - Infinite scroll pagination
 * - Server-side sorting
 * - Debounced search
 * - Loading states
 * - Error handling
 * 
 * All of this functionality comes from a single composable: useInfiniteScroll
 * from @mentor-forge/mentorhub_spa_utils. Just provide your API call and you're done!
 */
import { computed } from 'vue'
import { api } from '@/api/client'
import { formatDate, ListPageSearch, useInfiniteScroll } from '@mentor-forge/mentorhub_spa_utils'
import { useRouter } from 'vue-router'
import type { Encounter } from '@/api/types'

const router = useRouter()

// 🎯 One composable call gives you everything you need for infinite scroll:
// - items: The flattened list of all loaded items
// - isLoading: Loading state for initial load
// - isFetchingNextPage: Loading state for "load more"
// - hasMore: Whether there are more pages to load
// - loadMore: Function to load the next page
// - showError/errorMessage: Error handling
// - searchQuery/debouncedSearch: Search with automatic 300ms debouncing
// - sortBy/order/setSortBy/setOrder: Server-side sorting
const {
  items: encounters,
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
} = useInfiniteScroll<Encounter>({
  queryKey: ['encounters'],
  queryFn: (params) => api.getEncounters(params),
  getItemId: (item) => item._id,
  limit: 20,
  sort_by: 'created.at_time',
})

// Simple navigation handler
function navigateToEncounter(_event: unknown, { item }: { item: Encounter }) {
  router.push(`/encounters/${item._id}`)
}

// Create computed properties for template use (TypeScript-friendly)
const sortByValue = computed(() => sortBy.value)
const orderValue = computed(() => order.value)
const hasMoreValue = computed(() => hasMore.value)
const isFetchingNextPageValue = computed(() => isFetchingNextPage.value)

// 🎯 Sorting is simple: just toggle order or set new field
// useInfiniteScroll automatically refetches when sort changes
function handleSort(field: string) {
  if (sortBy.value === field) {
    // Toggle order if same field
    setOrder(order.value === 'asc' ? 'desc' : 'asc')
  } else {
    // New field, default to ascending
    setSortBy(field)
    setOrder('asc')
  }
}

const headers = [
  { title: 'TLDR', key: 'tldr', sortable: false },
  { title: 'Summary', key: 'summary', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Created', key: 'created.at_time', sortable: false },
  { title: 'Last Saved', key: 'saved.at_time', sortable: false },
]

</script>