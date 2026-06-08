<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">{{item}}s</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <ListPageSearch
          :searchable="true"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="{{item | lower}}-list-search"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end align-center">
        <v-btn 
          color="primary" 
          to="/{{item | lower}}s/new"
          data-automation-id="{{item | lower}}-list-new-button"
        >
          <v-icon left>mdi-plus</v-icon>
          New {{item}}
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="({{item | lower}}s ?? []) as unknown as {{item}}[]"
            :loading="isLoading as unknown as boolean"
            @click:row="navigateTo{{item}}"
            hover
            :items-per-page="-1"
            hide-default-footer
          >
            <template v-slot:header.name>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('name')">
                Name
                <v-icon v-if="sortByValue === 'name'" size="small">
                  {% raw %}{{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}{% endraw %}
                </v-icon>
              </span>
            </template>
            <template v-slot:header.status>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('status')">
                Status
                <v-icon v-if="sortByValue === 'status'" size="small">
                  {% raw %}{{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}{% endraw %}
                </v-icon>
              </span>
            </template>
            <template v-slot:header.created.at_time>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('created.at_time')">
                Created
                <v-icon v-if="sortByValue === 'created.at_time'" size="small">
                  {% raw %}{{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}{% endraw %}
                </v-icon>
              </span>
            </template>
            <template v-slot:header.saved.at_time>
              <span style="cursor: pointer; user-select: none;" @click="handleSort('saved.at_time')">
                Last Saved
                <v-icon v-if="sortByValue === 'saved.at_time'" size="small">
                  {% raw %}{{ orderValue === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}{% endraw %}
                </v-icon>
              </span>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.status === 'active' ? 'success' : 'grey'"
                size="small"
              >
                {% raw %}{{ item.status || 'N/A' }}{% endraw %}
              </v-chip>
            </template>
            <template v-slot:item.created.at_time="{ item }">
              {% raw %}{{ formatDate(item.created.at_time) }}{% endraw %}
            </template>
            <template v-slot:item.saved.at_time="{ item }">
              {% raw %}{{ formatDate(item.saved.at_time) }}{% endraw %}
            </template>
          </v-data-table>
          
          <!-- Load more button -->
          <v-card-actions v-if="hasMoreValue">
            <v-btn
              @click="loadMore"
              :loading="isFetchingNextPageValue"
              color="primary"
              block
              data-automation-id="{{item | lower}}-list-load-more"
            >
              {% raw %}{{ isFetchingNextPageValue ? 'Loading...' : 'Load More' }}{% endraw %}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load {{item | lower}}s: {% raw %}{{ errorMessage }}{% endraw %}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * {{item}}s List Page - Showcase of {{info.slug}}_spa_utils ease of use
 * 
 * This page demonstrates how easy it is to build a feature-rich list page with:
 * - Infinite scroll pagination
 * - Server-side sorting
 * - Debounced search
 * - Loading states
 * - Error handling
 * 
 * All of this functionality comes from a single composable: useInfiniteScroll
 * from @{{org.git_org}}/{{info.slug}}_spa_utils. Just provide your API call and you're done!
 */
import { computed } from 'vue'
import { api } from '@/api/client'
import { formatDate, ListPageSearch, useInfiniteScroll } from '@{{org.git_org}}/{{info.slug}}_spa_utils'
import { useRouter } from 'vue-router'
import type { {{item}} } from '@/api/types'

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
  items: {{item | lower}}s,
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
} = useInfiniteScroll<{{item}}>({
  queryKey: ['{{item | lower}}s'],
  queryFn: (params) => api.get{{item}}s(params),
  getItemId: (item) => item._id,
  limit: 20,
})

// Simple navigation handler
function navigateTo{{item}}(_event: unknown, { item }: { item: {{item}} }) {
  router.push(`/{{item | lower}}s/${item._id}`)
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
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Created', key: 'created.at_time', sortable: false },
  { title: 'Last Saved', key: 'saved.at_time', sortable: false },
]

</script>