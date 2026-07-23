<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon
        v-if="isAuthenticated"
        @click="drawer = !drawer"
        data-automation-id="nav-drawer-toggle"
        aria-label="Open navigation drawer"
      />
      <v-app-bar-title>Mentor</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      temporary
    >
      <v-list density="compact" nav>
        <v-list-item
          to="/profiles"
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          data-automation-id="nav-dashboard-link"
        />
        <v-list-item
          to="/resources"
          prepend-icon="mdi-book-open-page-variant"
          title="Resources"
          data-automation-id="nav-resources-link"
        />
        <v-list-item
          to="/paths"
          prepend-icon="mdi-map-marker-path"
          title="Learning Paths"
          data-automation-id="nav-learning-paths-link"
        />
        <v-list-item
          to="/plans"
          prepend-icon="mdi-clipboard-list-outline"
          title="Encounter Plans"
          data-automation-id="nav-encounter-plans-link"
        />
      </v-list>

      <template v-slot:append>
        <v-divider />
        <v-list density="compact" nav>
          <v-list-item
            v-if="hasAdminRole"
            to="/admin"
            prepend-icon="mdi-cog"
            title="Admin"
            data-automation-id="nav-admin-link"
          />
          <v-list-item
            @click="handleLogout"
            prepend-icon="mdi-logout"
            title="Logout"
            data-automation-id="nav-logout-link"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useConfig } from '@/composables/useConfig'
import { useRoles } from '@/composables/useRoles'
import {
  provideEditorConfig,
  redirectToIdpLogin,
} from '@mentor-forge/mentorhub_spa_utils'
import type { RuntimeEditorConfig } from '@mentor-forge/mentorhub_spa_utils'

const router = useRouter()
const { isAuthenticated, logout } = useAuth()
const { config, loadConfig } = useConfig()
const { hasRole } = useRoles()
const drawer = ref(false)

provideEditorConfig(() => config.value as RuntimeEditorConfig | null)

const hasAdminRole = hasRole('admin')

// Close temporary drawer when route changes (e.g. after clicking nav link)
router.afterEach(() => {
  drawer.value = false
})

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

function handleLogout() {
  logout()
  drawer.value = false
  redirectToIdpLogin(window.location.origin + '/')
}
</script>