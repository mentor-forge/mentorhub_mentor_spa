<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-row justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" class="mb-4" />
        <p class="text-body-1 text-medium-emphasis">Returning to the Discovery dashboard...</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { redirectToDiscoveryDashboard } from '@/composables/useDiscoveryRedirect'

onMounted(() => {
  redirectToDiscoveryDashboard()
})
</script>
