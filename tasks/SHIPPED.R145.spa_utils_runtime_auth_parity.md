# R145 – Align runtime auth with spa_utils (journey SPA parity)

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R136  
**Description**: Finish mentee-style spa_utils auth integration: re-export shared `useAuth` / role helpers, call `syncAuthFromStorage` after URL bootstrap, and use spa_utils auth from App/router/API client. Keep only Mentor-specific Cypress helpers (`loginAsMentor`, `loginAndVisit`, drawer) as thin wrappers over the shared JWT task.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Authentication integration (`bootstrapAuthFromUrl`, `syncAuthFromStorage`, `useAuth`, `redirectToIdpLogin`)
- `../mentorhub_spa_utils/src/composables/useAuth.ts`
- `src/initAuth.ts`
- `src/composables/useAuth.ts` — currently a local duplicate
- `src/composables/useAuth.test.ts`
- `src/App.vue`
- `src/router/index.ts`
- `src/api/client.ts`
- `src/api/client.test.ts`
- `src/composables/useRoles.ts`
- `cypress/support/e2e.ts`
- `cypress/support/commands.ts`
- `cypress/e2e/navigation.cy.ts`
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`
- `tasks/SHIPPED.R136.cypress_auth_spa_utils.md` — Cypress registerJwtSignTask already shipped

**Pattern:** Journey SPAs on spa_utils 0.5.x should not maintain a local `useAuth` implementation. Prefer a thin re-export module (or direct spa_utils imports) and always call `syncAuthFromStorage()` after `bootstrapAuthFromUrl()` so reactive auth state matches `localStorage`.

## Goals

- `src/initAuth.ts` calls `bootstrapAuthFromUrl()` then `syncAuthFromStorage()`.
- `src/composables/useAuth.ts` re-exports `useAuth`, `syncAuthFromStorage`, `getStoredRoles`, and `hasStoredRole` from `@mentor-forge/mentorhub_spa_utils` (no local reactive auth state).
- `App.vue` and `router/index.ts` use spa_utils auth (via the re-export or direct package imports — match existing journey SPA style; prefer spa_utils imports in App/router when practical).
- On API **401**, clear auth via `useAuth().logout()` (not only raw `localStorage.removeItem`) then `redirectToIdpLogin()`.
- Existing `useAuth.test.ts` / `client.test.ts` / `useRoles` tests remain green against the shared composable.
- Cypress: keep `registerAuthCommands` + Mentor-only thin helpers; do not reintroduce a local JWT signer. Specs that need the dashboard seed user continue to use `loginAsMentor` (shared `signCypressJwt` with `sub`).
- Do **not** change Vite/Cypress canonical ports (`8392` / API `8391`).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit / build**
  - `npm run test`
  - `npm run build`

- **E2E**
  - `npm run api` and `npm run dev` (or packaging service) as needed
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - Prefer full `npm run cypress:run` when practical

- **Packaging verification**
  - `npm run container`
  - `npm run service` (if port 8392 is free)
  - `npm run cypress:run`

## Outputs

- `src/initAuth.ts` — bootstrap + syncAuthFromStorage
- `src/composables/useAuth.ts` — re-export spa_utils auth helpers
- `src/composables/useAuth.test.ts` — update only if shared API requires it
- `src/App.vue` — spa_utils / re-export `useAuth`
- `src/router/index.ts` — spa_utils / re-export auth + `hasStoredRole`
- `src/api/client.ts` — 401 uses `logout()` then redirect
- `src/api/client.test.ts` — align 401 mocks for logout
- `src/App.test.ts` — mock spa_utils `useAuth` if App imports from package
- `cypress/support/commands.ts` — keep thin Mentor helpers only
- `cypress/support/e2e.ts` — only if import layout must change
- `cypress/e2e/navigation.cy.ts` — only if helpers change
- `cypress/e2e/profile.cy.ts` — only if helpers change
- `cypress/e2e/encounter.cy.ts` — only if helpers change
- `README.md` — note preferred spa_utils auth integration if docs still describe a local useAuth

The agent must not update files outside this list.

## Execution Notes

Plan:
1. Re-export spa_utils auth from `useAuth.ts`; call `syncAuthFromStorage` after bootstrap in `initAuth.ts`.
2. Point App/router at spa_utils `useAuth` / `hasStoredRole`; API 401 uses `logout()` then IdP redirect.
3. Keep thin Mentor Cypress helpers over shared `signCypressJwt`; update README auth docs.

Completed:
- Runtime auth matches journey SPA pattern (`bootstrapAuthFromUrl` + `syncAuthFromStorage`; no local auth state).
- App/router import spa_utils auth; `useAuth.ts` is a thin re-export; client 401 calls `logout()`.
- Cypress helpers remain Mentor-only wrappers; base `cy.login` still from `registerAuthCommands`.

Verification:
- `npm run test` — 93/93 passed
- `npm run build` — passed
- `npm run container` — passed
- Cypress navigation + profile — passed earlier; full `npm run cypress:run` — **39/39** passed against running API/SPA on 8391/8392
