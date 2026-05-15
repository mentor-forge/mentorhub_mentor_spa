<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">View Create</h1>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="create">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-text-field
              :model-value="create.name"
              label="Name"
              readonly
              variant="outlined"
            />

            <v-textarea
              :model-value="create.description || 'N/A'"
              label="Description"
              readonly
              variant="outlined"
              rows="3"
              class="mt-4"
            />

            <v-text-field
              :model-value="create.status || 'N/A'"
              label="Status"
              readonly
              variant="outlined"
              class="mt-4"
            />

            <v-divider class="my-6" />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(create.created.at_time)"
                  label="Created"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="create.created.by_user"
                  label="Created By"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="create.created.from_ip"
                  label="From IP"
                  readonly
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  :model-value="create.created.correlation_id"
                  label="Correlation ID"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-0 mt-4">
              <v-btn @click="router.push('/creates')" variant="text">
                Back to List
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { formatDate, useErrorHandler } from '@agile-learning-institute/mentorhub_spa_utils'
import { api } from '@/api/client'

const routeLocation = useRoute()
const router = useRouter()

const createId = computed(() => routeLocation.params.id as string)

const { data: create, isLoading, error: queryError } = useQuery({
  queryKey: ['create', createId],
  queryFn: () => api.getCreate(createId.value),
})

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)
</script>