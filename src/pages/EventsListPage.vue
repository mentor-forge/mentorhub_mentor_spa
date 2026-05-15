<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Events</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <ListPageSearch
          :searchable="true"
          :search-query="searchQuery"
          :debounced-search="debouncedSearch"
          automation-id="event-list-search"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end align-center">
        <v-btn 
          color="primary" 
          to="/events/new"
          data-automation-id="event-list-new-button"
        >
          <v-icon left>mdi-plus</v-icon>
          New Event
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="(events ?? []) as unknown as Event[]"
            :loading="isLoading as unknown as boolean"
            @click:row="navigateToEvent"
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
            <template v-slot:item.status="{ item }">
              <v-chip size="small">
                {{ item.status || 'N/A' }}
              </v-chip>
            </template>
            <template v-slot:item.created.at_time="{ item }">
              {{ formatDate(item.created.at_time) }}
            </template>
          </v-data-table>
          
          <!-- Load more button -->
          <v-card-actions v-if="hasMoreValue">
            <v-btn
              @click="loadMore"
              :loading="isFetchingNextPageValue"
              color="primary"
              block
              data-automation-id="event-list-load-more"
            >
              {{ isFetchingNextPageValue ? 'Loading...' : 'Load More' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load events: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
/**
 * Events List Page - Powered by mentorhub_spa_utils
 * 
 * This page uses useInfiniteScroll from @mentor-forge/mentorhub_spa_utils
 * to get infinite scroll, search, and sorting with minimal code.
 */
import { computed } from 'vue'
import { api } from '@/api/client'
import { formatDate, ListPageSearch, useInfiniteScroll } from '@mentor-forge/mentorhub_spa_utils'
import { useRouter } from 'vue-router'
import type { Event } from '@/api/types'

const router = useRouter()

// 🎯 Single composable provides all list functionality
const {
  items: events,
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
} = useInfiniteScroll<Event>({
  queryKey: ['events'],
  queryFn: (params) => api.getEvents(params),
  getItemId: (item) => item._id,
  limit: 20,
})

function navigateToEvent(_event: unknown, { item }: { item: Event }) {
  router.push(`/events/${item._id}`)
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
  { title: 'Created', key: 'created.at_time', sortable: false },
]

</script>