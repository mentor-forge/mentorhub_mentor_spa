# R136 – Align Cypress auth with spa_utils shared helpers

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R135  
**Description**: Stop maintaining a local `signCypressJwt` Cypress task. Wire `cypress.config.ts` to spa_utils `registerJwtSignTask` and keep `cy.login` via `registerAuthCommands`. Retain only Mentor-specific helpers (`loginAsMentor`, `loginAndVisit`, nav drawer commands) as thin wrappers over the shared JWT task — mirror the lean support-file pattern used by other journey SPAs on spa_utils 0.5.5.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Authentication integration; package `exports` for `./cypress/*`
- `../mentorhub_spa_utils/cypress/support/registerAuthCommands.ts`
- `../mentorhub_spa_utils/cypress/plugins/registerJwtSignTask.ts`
- `../mentorhub_spa_utils/cypress/config/jwtDefaults.ts`
- `cypress.config.ts` — currently inlines `jsonwebtoken` + local `signCypressJwt` task
- `cypress/support/e2e.ts` — already imports `registerAuthCommands`
- `cypress/support/commands.ts` — Mentor-specific `loginAsMentor` / `loginAndVisit` / drawer helpers
- `cypress/e2e/navigation.cy.ts`
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`
- `cypress/e2e/plan.cy.ts`
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`

**Pattern note:** Other journey SPAs on 0.5.5 call `registerJwtSignTask(on)` from spa_utils in `setupNodeEvents` and keep `cypress/support/e2e.ts` limited to `registerAuthCommands({ visitPath: '/' })`. Mentor may keep a non-empty `commands.ts` only for journey-specific helpers that still call `cy.task('signCypressJwt', …)` (or compose `cy.login` when that is sufficient).

## Goals

- `cypress.config.ts` uses `registerJwtSignTask` from `@mentor-forge/mentorhub_spa_utils/cypress/registerJwtSignTask` and `e2eDefaultJwtSecret` from `.../cypress/jwtDefaults`.
- Remove the local `jsonwebtoken` import and inline `signCypressJwt` task implementation from `cypress.config.ts` (rely on the shared spa_utils task, which already accepts optional `sub` / claim fields needed for mentor seeding).
- `cypress/support/e2e.ts` continues to register `cy.login` via `registerAuthCommands`; do not reimplement base login.
- Mentor-only commands remain available and green:
  - `loginAsMentor` — seeds mentor (+ admin) roles with the dashboard seed `sub` from `Cypress.env('MENTOR_DASHBOARD_USER')`
  - `loginAndVisit` — seed + visit a path without depending on `/` redirect alone
  - `openNavDrawer` / `closeNavDrawer`
- Specs that use `cy.login`, `cy.loginAsMentor`, or `cy.loginAndVisit` still pass without IdP UI.
- Do not change application auth bootstrap (`src/initAuth.ts` / router) unless a Cypress-only wiring bug requires a one-line fix listed in Outputs.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit / build**
  - `npm run test`
  - `npm run build`

- **Dev stack for E2E**
  - `npm run api`
  - `npm run dev` (or use packaging service below)

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - Prefer full `npm run cypress:run` if time allows

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `cypress.config.ts` — `registerJwtSignTask` + `e2eDefaultJwtSecret`; drop local JWT sign implementation
- `cypress/support/e2e.ts` — keep/align `registerAuthCommands` only
- `cypress/support/commands.ts` — thin Mentor-specific helpers over shared `signCypressJwt` task
- `cypress/e2e/navigation.cy.ts` — only if command signatures / assertions must change
- `cypress/e2e/profile.cy.ts` — only if login helpers change
- `cypress/e2e/encounter.cy.ts` — only if login helpers change
- `package.json` / `package-lock.json` — only if removing a now-unused direct `jsonwebtoken` Cypress dependency (do not remove it if still required transitively; prefer leaving lock alone unless a direct dep was declared)

The agent must not update files outside this list.

## Execution Notes

- Replaced the inline `jsonwebtoken` Cypress task with spa_utils
  `registerJwtSignTask`; retained shared `registerAuthCommands` registration
  and the existing thin Mentor-specific command wrappers.
- `npm run test && npm run build`: passed (14 test files / 92 tests; production
  build completed).
- Required dev-stack Cypress specs passed: navigation (9/9) and profile (8/8).
- `npm run container`: passed.
- `npm run service` started the packaged API stack, but Cursor's Windows port
  forwarding process already owned host port 8392, so Docker could not publish
  the SPA there; the script's browser-open fallback is also unavailable in WSL.
  The same built image was started on port 8393 against the service stack.
- Full Cypress suite against that packaged image passed (6 specs / 36 tests).
