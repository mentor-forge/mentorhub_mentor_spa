<template>
  <AdminPage
    :config="config ?? null"
    :is-loading="isLoading"
    :error="error ?? null"
  />
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { AdminPage } from '@agile-learning-institute/mentorhub_spa_utils'
import { api } from '@/api/client'
import type { ConfigResponse } from '@/api/types'

const { data: config, isLoading, error } = useQuery<ConfigResponse>({
  queryKey: ['config'],
  queryFn: () => api.getConfig(),
})
</script>