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
      /** Profile.name for the mentor dashboard seed user (Profile.0.1.0.0.json). */
      MENTOR_DASHBOARD_USER: 'marti',
    },
    setupNodeEvents(on) {
      registerJwtSignTask(on)
      // Webpack cannot parse TS from spa_utils in node_modules; esbuild bundles it.
      on('file:preprocessor', createBundler())
    },
  },
})