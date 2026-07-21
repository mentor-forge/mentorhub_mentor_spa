<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4" data-automation-id="path-list-heading">Paths</h1>
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
          <v-icon start>mdi-plus</v-icon>
          New Path
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="!isLoading && paths.length === 0">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" data-automation-id="path-list-empty">
          No paths found.
        </v-alert>
      </v-col>
    </v-row>

    <CardGrid automation-id="path-list-grid">
      <MhCard
        v-for="path in paths"
        :key="path._id"
        :title="path.name || 'Unnamed Path'"
        :automation-id="`path-list-card-${path._id}`"
      >
        <template #actions>
          <v-btn
            icon
            variant="text"
            size="small"
            :data-automation-id="`path-list-card-${path._id}-open-button`"
            aria-label="Open"
            @click="navigateToPath(path)"
          >
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </template>

        <p class="text-body-2 text-medium-emphasis">
          {{ path.description || 'No description' }}
        </p>
      </MhCard>
    </CardGrid>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      Failed to load paths: {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { CardGrid, MhCard, ListPageSearch, useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
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

function navigateToPath(path: Path) {
  router.push(`/paths/${path._id}`)
}
</script>
