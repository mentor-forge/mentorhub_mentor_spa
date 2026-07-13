<template>
  <v-container>
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

    <v-row>
      <v-col>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="paths"
            :loading="isLoading"
            @click:row="navigateToPath"
            hover
            :items-per-page="-1"
            hide-default-footer
          >
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
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load paths: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { formatDate, ListPageSearch, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { Path } from '@/api/types'

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
  queryKey: computed(() => ['paths', debouncedQuery.value]),
  queryFn: () =>
    debouncedQuery.value
      ? api.getPaths({ name: debouncedQuery.value })
      : api.getPaths(),
})

const paths = computed(() => data.value ?? [])

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

function navigateToPath(_event: unknown, { item }: { item: Path }) {
  router.push(`/paths/${item._id}`)
}

const headers = [
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Created', key: 'created.at_time', sortable: false },
  { title: 'Last Saved', key: 'saved.at_time', sortable: false },
]
</script>
