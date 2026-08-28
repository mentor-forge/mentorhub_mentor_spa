# F154 – Cypress e2e under `/mentor/` and full packaging verification

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F153_nginx_mentor_prefix_and_api_client`  
**Description**: Re-point every Cypress visit, intercept, and URL assertion to the `/mentor/` prefix, replace the deleted local drawer coverage with the spa_utils `PageFrame` automation ids, and run the full packaged stack as the acceptance gate for both source issues (F-RS15 and F-RS16).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — `data-automation-id` convention and Cypress selector rules
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame (1.0.0)** automation ids and the role-gated catalog; **Cross-SPA URLs** (direct SPA debug ports are for Cypress and debugging only)
- `../mentorhub_spa_utils/cypress/support/registerAuthCommands.ts` — the `cy.login(roles?)` implementation: `visitPath` defaults to `'/'` and **roles default to `['admin']`** when none are passed
- `README.md` — Testing section
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F149.retire_list_pages_and_forward_to_discovery.md` — locked route table, the specs deleted there, and why auth seeding cannot happen on `/`
- `cypress.config.ts` — `baseUrl: 'http://localhost:8392'`, spa_utils JWT sign task, esbuild preprocessor, `MENTOR_DASHBOARD_USER: 'marti'`
- `cypress/support/e2e.ts` — after F149, `registerAuthCommands({ visitPath: '/paths/new' })`
- `cypress/support/commands.ts` — after F149: `loginAsMentor(visitPath = '/paths/new')` (roles `['mentor','admin']`, `sub` = the seeded mentor), `loginAndVisit(path, roles = ['admin'])`, the mentee-profile-id helper that `cy.request`s `GET /api/profile`, `openNavDrawer`, `closeNavDrawer`
- `cypress/e2e/profile.cy.ts`, `cypress/e2e/encounter.cy.ts`, `cypress/e2e/path.cy.ts`, `cypress/e2e/resource.cy.ts`, `cypress/e2e/plan.cy.ts` — the specs surviving F149/F150, still visiting un-prefixed paths
- `nginx.conf.template`, `Dockerfile` — F153 prefix serving and runtime-config generation

**Ports:** `cypress.config.ts` `baseUrl` stays `http://localhost:8392` (the published container port). Visits become prefixed paths such as `/mentor/profiles/{id}`, `/mentor/paths/new`, and `/mentor/plans/{id}`. Do not point Cypress at the welcome origin on `:8080`; single-SPA e2e runs against the direct port.

**Never visit `/mentor/` in a spec.** This SPA has no default route: `/mentor/` and any unmatched path forward the browser to `http://<host>:8080/discovery/`, a different origin that Cypress cannot follow and that is not in this stack. Auth seeding stays on the benign `/mentor/paths/new` page, and the forward itself stays covered by the `useDiscoveryRedirect` unit test from F149.

`npm run dev` and `npm run service` both bind host port **8392**. Cypress runs against `npm run service`, so no dev server may be running.

**Roles matter here.** `cy.login()` with no argument seeds an **admin** token, which shows Products and Settings in the `PageFrame` hamburger but **not** the three mentor rows. Use `cy.login(['mentor'])` (or `cy.loginAsMentor()`, which seeds `['mentor','admin']` plus the seeded mentor `sub`) for the mentor-row assertions, and pick roles deliberately rather than asserting "only N rows exist" against a default `cy.login()`.

## Goals

- `cypress/support/e2e.ts` passes `registerAuthCommands({ visitPath: '/mentor/paths/new' })` so `cy.login()` seeds `localStorage` on the prefixed origin and its first navigation lands on a page that stays put. Same-origin JWT storage must work when the app is opened under `/mentor/`.
- `cypress/support/commands.ts` uses `/mentor/paths/new` as the `loginAsMentor` default visit path, points the mentee-profile-id helper's `cy.request` at `/mentor/api/profile`, and keeps its drawer helpers working against the `PageFrame` drawer (`nav-drawer-toggle` plus the Vuetify `.v-navigation-drawer--active` classes). Drop `openNavDrawer` / `closeNavDrawer` only if the new navigation spec does not use them.
- Every `cy.visit(...)`, `cy.url().should('include'|'match', ...)`, and `cy.intercept('GET', '/api/...')` in `cypress/e2e/**` uses the `/mentor/` prefix, matching the F149 route table and the F153 API base. Regex URL assertions such as `/\/profiles\/[0-9a-fA-F]{24}$/` still pass under the prefix, but any assertion anchored at the origin must be updated.
- `cypress/e2e/navigation.cy.ts` is recreated against spa_utils ids only, opening the chrome from a stable in-app page such as `/mentor/paths/new`: `nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-home-link`, `nav-resources-link`, `nav-paths-link`, `nav-plans-link`, `nav-notifications-link`, `nav-logout-link`. No SPA-local drawer selector (`nav-dashboard-link`, `nav-learning-paths-link`, `nav-encounter-plans-link`, `nav-admin-link`, `app-bar-title`) survives anywhere in `cypress/`.
  - `page-frame-title` shows `Mentor`.
  - A `cy.loginAsMentor()` (or `cy.login(['mentor'])`) run shows Home, Learning Resources, Learning Paths, Encounter Plans, and Notifications, and each is an absolute `:8080` anchor at `/discovery/`, `/discovery/resources`, `/discovery/paths`, `/discovery/plans`, and `/discovery/notifications` — real `href` anchors, not Vue Router links. Assert the `href` attributes; do not follow the links out of the app.
  - `nav-profile-link` targets `/customer/profile/` on the same `:8080` origin.
  - A `cy.login(['admin'])` run shows `nav-products-link` and `nav-settings-link`; a `cy.login(['mentor'])` run does not.
  - The logout test asserts auth is cleared and the browser leaves for the IdP login URL. `PageFrame`'s built-in logout returns to the **root** origin rather than `/mentor/` (see the F151 note), so assert the IdP `pathname` and the presence of a return parameter, not a prefixed return value.
- Detail coverage is preserved, not thinned: `ProfileEditPage` sections and typed notes editors, the New Encounter plan-dialog flow, encounter detail TLDR autosave and back-to-profile navigation, path and resource create/update, and the plan create plus full checklist add / edit / reorder / delete all keep their existing assertions with prefixed visits.
- The Discovery links added in F149 and F150 stay covered: `resource-edit-browse-resources-link`, `path-edit-browse-paths-link`, `plan-edit-browse-plans-link`, and `plan-edit-checklist-browse-plans-link` have absolute `:8080` hrefs at `/discovery/resources`, `/discovery/paths`, and `/discovery/plans`, and `profile-edit-dashboard-link` points at `/discovery/`. Assert the `href` attributes; do not follow them.
- No spec references a removed route (`/resources`, `/paths`, `/plans`, or `/profiles` as a list), a deleted page's automation ids (`resource-list-*`, `path-list-*`, `plan-list-*`, `profile-dashboard-*`), a `getResources` / `getPaths` / `getProfiles` intercept, or the deleted `NamePromptDialog` ids.
- `README.md` Testing section documents the prefixed Cypress entry point, the mentor-role login helper, the mentee-profile-id helper, the rule that specs never visit `/mentor/`, and that `npm run service` must be running (not `npm run dev`).
- No production source behavior changes in this task. Touch `src/**` only if a spec exposes a missing or wrong `data-automation-id`, and keep any such change to the id attribute.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` and `npm run test:coverage`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)

**Packaging verification (the acceptance gate for this wave):**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); **all** specs must pass against `http://localhost:8392/mentor/...`
- `curl -i http://localhost:8392/mentor/` — still `200 text/html` with `/mentor/` asset URLs (regression check on F153; the shell then forwards to Discovery in a browser, which `curl` will not follow)
- If Developer Edition welcome is up on `:8080`, confirm `http://localhost:8080/mentor/` serves this SPA, that login round-trips through `http://<host>:8080/login.html`, and that API calls from the prefixed origin reach `mentor_api`. Record it as an external check if welcome is not part of the running stack.

Acceptance criteria from the source issues that must hold at the end of this task: `:8080/mentor/` serves this SPA's shell (not welcome's `index.html`) and then forwards to the Discovery dashboard, `:8392/mentor/{page}` works for single-SPA Cypress, API calls from the prefixed origin reach `mentor_api` through this SPA's nginx, the hamburger's Learning Resources / Learning Paths / Encounter Plans rows open Discovery, and the unit plus e2e suites pass. The issues also list `npm run lint`; this repo has no `lint` script — record that gap as a follow-up rather than adding tooling here.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `cypress/e2e/navigation.cy.ts` — `PageFrame` app bar, drawer, profile link, and logout using spa_utils ids

**Update:**

- `cypress/support/e2e.ts` — `visitPath: '/mentor/paths/new'`
- `cypress/support/commands.ts` — prefixed default visit path; drawer helpers kept or dropped
- `cypress/e2e/profile.cy.ts`, `cypress/e2e/encounter.cy.ts`, `cypress/e2e/path.cy.ts`, `cypress/e2e/resource.cy.ts`, `cypress/e2e/plan.cy.ts` — prefixed visits, intercepts, and URL assertions, plus the Discovery browse-link href assertions
- `README.md` — Testing section

Do not change `cypress.config.ts` `baseUrl`, `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `package.json`, `vitest.config.ts`, or `src/api/client.ts` in this task.

## Execution Notes

### Summary
- Created `cypress/e2e/navigation.cy.ts` using `spa_utils` `PageFrame` automation IDs (`page-frame-title`, `nav-drawer-toggle`, `nav-profile-link`, `nav-home-link`, `nav-resources-link`, `nav-paths-link`, `nav-plans-link`, `nav-notifications-link`, `nav-logout-link`, `nav-products-link`, `nav-settings-link`).
- Updated `cypress/support/e2e.ts` to use `visitPath: '/mentor/paths/new'`.
- Updated `cypress/support/commands.ts` to set `defaultVisitPath = '/mentor/paths/new'` and `mentorMenteeProfileId` URL to `/mentor/api/profile`.
- Updated all E2E spec files (`encounter.cy.ts`, `path.cy.ts`, `plan.cy.ts`, `profile.cy.ts`, `resource.cy.ts`) with `/mentor/` visits and URL assertions.
- Updated `README.md` Testing section with prefixed Cypress test documentation.
- Augmented unit test coverage in `PlanChecklistEditor.test.ts`, `PlanSelectDialog.test.ts`, and `useConfig.test.ts` to achieve 100% threshold compliance across all domains.

### Verification Results
- `npm run test`: 14 test files passed (100 tests).
- `npm run test:coverage`: Met all coverage thresholds:
  - `src/api/**`: Lines 98.01%, Funcs 100%, Branches 90.69%, Statements 98.01%
  - `src/components/**`: Lines 95.42%, Funcs 100%, Branches 88.73%, Statements 95.42%
  - `src/composables/**`: Lines 99.09%, Funcs 100%, Branches 75.47%, Statements 99.09%
- `npm run build`: `vue-tsc && vite build` built cleanly.
- `npm run container`: Built Docker image `ghcr.io/mentor-forge/mentorhub_mentor_spa:latest`.
- `npm run service` (`mh down && mh up mentor`): Started db + mentor_api + mentor_spa + welcome stack.
- `curl -i http://localhost:8392/health`: returned `200 OK` `healthy`.
- `curl -i http://localhost:8392/mentor/runtime-config.js`: returned `200 OK` `Cache-Control: no-store` with injected runtime config.
- `curl -i http://localhost:8392/mentor/`: returned `200 OK` `Cache-Control: no-store` with HTML shell.
- `curl -i http://localhost:8392/mentor/api/config`: returned `401 Unauthorized` JSON from `mentor_api`.
- `npm run cypress:run`: All 6 test specs and 19 tests passed headlessly against the containerized stack:
  - `encounter.cy.ts`: 3 passed
  - `navigation.cy.ts`: 3 passed
  - `path.cy.ts`: 2 passed
  - `plan.cy.ts`: 3 passed
  - `profile.cy.ts`: 6 passed
  - `resource.cy.ts`: 2 passed

### Follow-ups
- As noted in source issues, this repository has no `npm run lint` script defined in `package.json` (`vue-tsc` acts as type gate).
