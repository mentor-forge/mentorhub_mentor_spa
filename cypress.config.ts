import createBundler from '@bahmutov/cypress-esbuild-preprocessor'
import { defineConfig } from 'cypress'
import { e2eDefaultJwtSecret } from '@{{org.git_org}}/{{info.slug}}_spa_utils/cypress/jwtDefaults'
import { registerJwtSignTask } from '@{{org.git_org}}/{{info.slug}}_spa_utils/cypress/registerJwtSignTask'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:{{repo.port}}',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    env: {
      JWT_SECRET: e2eDefaultJwtSecret(),
    },
    setupNodeEvents(on) {
      registerJwtSignTask(on)
      // Webpack cannot parse TS from spa_utils in node_modules; esbuild bundles it.
      on('file:preprocessor', createBundler())
    },
  },
})
