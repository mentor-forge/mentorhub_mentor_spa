import createBundler from '@bahmutov/cypress-esbuild-preprocessor'
import { defineConfig } from 'cypress'
import jwt from 'jsonwebtoken'
import { e2eDefaultJwtSecret } from '@mentor-forge/mentorhub_spa_utils/cypress/jwtDefaults'

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
      on('task', {
        signCypressJwt(opts: { roles: string[]; secret: string; sub?: string }) {
          const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
          const token = jwt.sign(
            {
              sub: opts.sub ?? 'cypress-user',
              iss: 'dev-idp',
              aud: 'dev-api',
              roles: opts.roles,
              exp,
            },
            opts.secret,
            { algorithm: 'HS256' },
          )
          return { token, expiresAt: new Date(exp * 1000).toISOString() }
        },
      })
      // Webpack cannot parse TS from spa_utils in node_modules; esbuild bundles it.
      on('file:preprocessor', createBundler())
    },
  },
})