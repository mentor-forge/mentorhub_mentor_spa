<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">{{item}}s</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <ListPageSearch
          :searchable="true"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="{{item | lower}}-list-search"
        />
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
            <template v-slot:item.status="{ item }">
              <v-chip size="small">
                {% raw %}{{ item.status || 'N/A' }}{% endraw %}
              </v-chip>
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
 * {{item}}s List Page - Showcase of {{info.slug}}_spa_utils simplicity
 * 
 * Building a list page with infinite scroll, search, and sorting
 * is as simple as calling useInfiniteScroll with your API function.
 */
import { computed } from 'vue'
import { api } from '@/api/client'
import { ListPageSearch, useInfiniteScroll } from '@{{org.git_org}}/{{info.slug}}_spa_utils'
import { useRouter } from 'vue-router'
import type { {{item}} } from '@/api/types'

const router = useRouter()

// 🎯 All list functionality in one composable call
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

function navigateTo{{item}}(_event: unknown, { item }: { item: {{item}} }) {
  router.push(`/{{item | lower}}s/${item._id}`)
}

// Create computed properties for template use (TypeScript-friendly)
const sortByValue = computed(() => sortBy.value)
const orderValue = computed(() => order.value)
const hasMoreValue = computed(() => hasMore.value)
const isFetchingNextPageValue = computed(() => isFetchingNextPage.value)

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
]

</script>