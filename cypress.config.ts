import createBundler from '@bahmutov/cypress-esbuild-preprocessor'
import { defineConfig } from 'cypress'
import { e2eDefaultJwtSecret } from '@mentor-forge/mentorhub_spa_utils/cypress/jwtDefaults'
import { registerJwtSignTask } from '@mentor-forge/mentorhub_spa_utils/cypress/registerJwtSignTask'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8392',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // Vuetify nav drawer uses mobile behaviour below the lg breakpoint (1280px).
    viewportWidth: 1400,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    env: {
      JWT_SECRET: e2eDefaultJwtSecret(),
      /** Seeded mentor persona from welcome-auth.js / Profile test data. */
      MENTOR_DASHBOARD_USER: 'marti',
      MENTOR_DASHBOARD_PROFILE_ID: 'A00000000000000000000006',
    },
    setupNodeEvents(on) {
      registerJwtSignTask(on)
      // Webpack cannot parse TS from spa_utils in node_modules; esbuild bundles it.
      on('file:preprocessor', createBundler())
    },
  },
})