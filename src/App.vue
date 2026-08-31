<template>
  <v-app>
    <PageFrame page-title="Mentor">
      <router-view />
    </PageFrame>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfig } from '@/composables/useConfig'
import {
  PageFrame,
  provideEditorConfig,
  useAuth,
} from '@mentor-forge/mentorhub_spa_utils'
import type { RuntimeEditorConfig } from '@mentor-forge/mentorhub_spa_utils'

const { isAuthenticated } = useAuth()
const { config, loadConfig } = useConfig()

provideEditorConfig(() => config.value as RuntimeEditorConfig | null)

onMounted(async () => {
  // Load config if user is already authenticated (e.g., on page reload)
  if (isAuthenticated.value) {
    try {
      await loadConfig()
    } catch (error) {
      // Silently fail - config will be loaded on next login if needed
      console.warn('Failed to load config on mount:', error)
    }
  }
})
</script>