<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="6">
        <v-card>
          <v-card-title class="text-h5 text-center pa-4">
            Sign in required
          </v-card-title>
          <v-card-text class="text-body-1">
            <p class="mb-4">
              Use your identity provider or the Developer Edition welcome flow. Tokens can be
              applied via URL hash (<code>bootstrapAuthFromUrl</code> from spa_utils runs in
              <code>src/initAuth.ts</code> before the app mounts).
            </p>
            <p v-if="idpLoginUri" class="mb-4">
              <v-btn
                :href="idpLoginUri"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                data-automation-id="idp-login-link"
              >
                Open sign-in
              </v-btn>
            </p>
            <p class="mb-2">Hash format:</p>
            <pre
              class="text-caption bg-grey-darken-4 pa-2 rounded mb-4"
              data-automation-id="sign-in-hash-hint"
            >#access_token=JWT&amp;expires_at=ISO8601&amp;roles=admin,developer</pre>
            <p v-if="redirectHint" class="mb-4 text-medium-emphasis">
              Next: <strong>{% raw %}{{ redirectHint }}{% endraw %}</strong>
            </p>
            <v-btn
              color="primary"
              block
              :disabled="!isAuthenticated"
              data-automation-id="continue-to-app-button"
              @click="goContinue"
            >
              Continue
            </v-btn>
            <v-alert
              v-if="!isAuthenticated"
              type="info"
              variant="tonal"
              class="mt-4"
              data-automation-id="sign-in-info-alert"
            >
              After you authenticate, return here or refresh so localStorage is set, then click
              Continue.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const idpLoginUri = import.meta.env.VITE_IDP_LOGIN_URI as string | undefined
const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

const redirectHint = computed(() => {
  const r = route.query.redirect as string | undefined
  if (r && r.length > 0) return r
  return '/{{ service.data_domains.controls[0] | lower }}s'
})

function goContinue() {
  router.replace(redirectHint.value)
}
</script>
