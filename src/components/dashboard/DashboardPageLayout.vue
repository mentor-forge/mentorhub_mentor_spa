<template>
  <v-container>
    <v-row>
      <v-col class="d-flex align-center justify-space-between">
        <h1
          class="text-h4 mb-4"
          :data-automation-id="headingAutomationId"
        >
          {{ title }}
        </h1>
        <slot name="header-actions" />
      </v-col>
    </v-row>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-row v-if="showEmpty">
      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          :data-automation-id="emptyAutomationId"
        >
          {{ emptyMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <slot />

    <v-snackbar
      :model-value="showError as unknown as boolean"
      color="error"
      :timeout="5000"
    >
      {{ errorPrefix }}{{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  headingAutomationId: string
  isLoading?: boolean
  showEmpty?: boolean
  emptyAutomationId?: string
  emptyMessage?: string
  showError?: boolean
  errorMessage?: string
  errorPrefix?: string
}>()
</script>
