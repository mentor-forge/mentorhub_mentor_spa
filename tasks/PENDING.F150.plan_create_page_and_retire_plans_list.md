# F150 – Add the Plan create page, retire the Plans CardGrid dashboard

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F149_retire_list_pages_and_forward_to_discovery`  
**Description**: Plan creation currently lives **on** the plans list dashboard, so the plans list cannot be deleted until create has its own route. Add `PlanNewPage.vue` at `/plans/new` (mirroring the kept path and resource create pages), then delete `PlansListPage.vue`, the `/plans` list route, and the dashboard-only components it was the last consumer of. Repoint the plan edit page's two "Back to List" actions to Discovery. `api.getPlans` stays — the New Encounter plan picker needs it.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — `data-automation-id` convention `{domain}-{page}-{element}`
- `../mentorhub_spa_utils/README.md` — **List cards** (Discovery hosts the CardGrid dashboards; other journey SPAs keep detail, edit, and create pages); **Cross-SPA URLs** (`buildJourneyUrl`)
- `README.md` — "Encounter Plans Dashboard" section
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F149.retire_list_pages_and_forward_to_discovery.md` — the locked route table this task completes
- `src/pages/PlansListPage.vue` — the dashboard being deleted; hosts **New Plan** (`NamePromptDialog` → `POST /api/plan` → `router.push('/plans/{id}')`)
- `src/pages/PathNewPage.vue` and `src/pages/ResourceNewPage.vue` — the create-page pattern to mirror (v-form + `validationRules` + `useErrorHandler` + create mutation + redirect to the edit page)
- `src/pages/PlanEditPage.vue` — kept; has `plan-edit-back-button` and `plan-edit-checklist-back-button`, both `router.push('/plans')`; also uses local `useRoles` for admin-only audit fields
- `src/components/dashboard/index.ts`, `src/components/dashboard/NamePromptDialog.vue`, `src/components/dashboard/DashboardPageLayout.vue` — after F149 deleted `ProfilesListPage.vue`, `PlansListPage.vue` is the **last** consumer of both components, so both go with it
- `src/components/dashboard/PlanSelectDialog.vue` — calls `api.getPlans()` for the New Encounter flow; keep it and its test
- `src/api/client.ts` — `getPlans`, `getPlan`, `createPlan`, `updatePlan`, plus `listHeaders` / `appendListQuery`
- `src/api/types.ts` — `Plan`, `PlanInput`, `PlanUpdate`, `ListParams`
- `src/router/index.ts` — after F149: `/plans` and `/plans/:id` are the remaining plan routes
- `src/App.vue` — drawer still has `nav-encounter-plans-link`
- `cypress/e2e/plan.cy.ts`, `cypress/e2e/profile.cy.ts`, `cypress/e2e/encounter.cy.ts`

**Source issue**: F-RS16 — remove local CardGrid list pages for resources, paths, and plans; **keep** detail, edit, and create pages so Discovery `buildJourneyUrl` card targets resolve.

**External prerequisite**: none beyond F149. This task changes no dependency versions and no API contract.

### Why create moves before the dashboard is deleted

The path and resource domains already have standalone `/{domain}/new` pages, which is why F149 could delete their dashboards outright. Plans do not: **New Plan** is a dialog owned by `PlansListPage.vue`. Adding `/plans/new` first keeps plan creation — and its Cypress coverage — working in the same commit that removes the dashboard, instead of leaving a gap.

### Locked decisions

- `/plans/new` is a **page**, not a dialog, and follows `PathNewPage.vue` so the three create flows stay consistent. Its automation ids are `plan-new-name-input`, `plan-new-description-input`, `plan-new-status-select`, `plan-new-cancel-button`, and `plan-new-submit-button`.
- The `/plans/new` route must be declared **before** `/plans/:id` so `new` is not captured as an id.
- `api.getPlans` and `ListParams` **stay**. `PlanSelectDialog.vue` is the remaining caller; do not inline a replacement fetch there and do not change its request shape.
- The plan edit page keeps both of its bottom actions; only their targets and labels change. Discovery plan browsing is `buildJourneyUrl('discovery', 'plans')` — an absolute welcome / ALB href on `:8080`, rendered as an anchor (`:href`), never `router.push`.

## Goals

- `src/pages/PlanNewPage.vue` exists and mirrors `PathNewPage.vue`: a `v-form` with a required Name (`validationRules.required` + `validationRules.namePattern`), an optional Description (`validationRules.descriptionPattern`), a Status select defaulting to `active`, a Cancel action, and a submit that calls `api.createPlan(...)`, invalidates the `['plans']` query key, and `router.push`es to `/plans/{_id}`. Errors surface through `useErrorHandler` in a snackbar, matching the sibling pages.
- `src/router/index.ts` registers `/plans/new` (name `PlanNew`, `meta: { requiresAuth: true }`) ahead of `/plans/:id`, and the `/plans` list route is gone. No other route changes; `createWebHistory()` still takes no argument — F152 adds the base.
- `src/pages/PlansListPage.vue` is deleted, and no source, test, or Cypress file references it or its `plan-list-*` automation ids.
- `src/components/dashboard/NamePromptDialog.vue` and `src/components/dashboard/DashboardPageLayout.vue` are deleted — the plans dashboard was the last consumer of each — and `src/components/dashboard/index.ts` exports only `PlanSelectDialog` afterwards. A grep for `NamePromptDialog` and `DashboardPageLayout` across `src/` and `cypress/` returns nothing. If the `dashboard` folder now holds only the plan-select dialog and its validation helper, leave the folder name alone; renaming it is churn this wave does not need.
- `src/pages/PlanEditPage.vue` replaces both "Back to List" buttons with absolute Discovery links (ids `plan-edit-browse-plans-link` and `plan-edit-checklist-browse-plans-link`, label "Browse Plans"). The admin-gated audit fields, the `DataCard` editors, and the `PlanChecklistEditor` behavior are unchanged, and the page keeps `useRouter` only if something else still needs it (`noUnusedLocals` is on).
- `src/App.vue` drops the `nav-encounter-plans-link` drawer row. The remaining rows (`nav-dashboard-link`, admin, logout) stay untouched — F151 deletes this chrome wholesale.
- `src/api/client.ts` and `src/api/types.ts` are unchanged in this task.
- `cypress/e2e/plan.cy.ts` covers the new shape at the un-prefixed origin:
  - create by visiting `/plans/new`, filling `plan-new-name-input`, submitting, and asserting the URL matches `/plans/{24-hex}` with `plan-edit-name-input` pre-filled
  - the existing edit assertions (name, description, status, `plan-edit-fields-section`) reached by visiting `/plans/{id}` directly after a create
  - the full `plan-edit-checklist-*` add / edit / reorder / delete coverage, unchanged
  - `plan-edit-browse-plans-link` has an absolute `:8080` href ending in `/discovery/plans`; assert the attribute, do not follow it
  - every `it` that visited `/plans`, used `plan-list-*` ids, or drove the New Plan dialog is gone
- `cypress/e2e/profile.cy.ts` and `cypress/e2e/encounter.cy.ts` still pass unchanged: the New Encounter plan dialog reads seeded plans through `api.getPlans()`, which this task preserves.
- `README.md` "Encounter Plans Dashboard" becomes a plans section without a dashboard: `/plans/new` creates, `/plans/:id` edits, plan browsing lives on Discovery, and the `GET /api/plan` list call now serves only the New Encounter plan picker.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` — unchanged suites must pass; add or adjust unit coverage only if a shared component changes
- `npm run test:coverage` — `src/components/**` thresholds must still hold after `NamePromptDialog.vue` and `DashboardPageLayout.vue` are deleted (neither has a test file, so removing them should help)
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)
- `npm run api` then `npm run dev` — manual check at `http://localhost:8392/`:
  - `/plans` no longer resolves to a page
  - `/plans/new` creates a plan and lands on `/plans/{id}`
  - the plan edit page's browse actions point at `http://<host>:8080/discovery/plans`
  - the drawer has no Encounter Plans row
  - **New Encounter** from a profile still lists plans in the picker and creates an encounter

**Packaging verification:**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running). All specs must pass at the un-prefixed origin; prefixed visits arrive in F154.

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8392**.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `src/pages/PlanNewPage.vue` — `/plans/new` create page modeled on `PathNewPage.vue`

**Update:**

- `src/router/index.ts` — `/plans/new` added before `/plans/:id`; `/plans` list route removed
- `src/pages/PlanEditPage.vue` — Discovery browse links replace both "Back to List" buttons
- `src/components/dashboard/index.ts` — `NamePromptDialog` and `DashboardPageLayout` exports removed
- `src/App.vue` — `nav-encounter-plans-link` drawer row removed
- `cypress/e2e/plan.cy.ts` — create via `/plans/new`, list coverage removed, browse-link assertion added
- `README.md` — plans section without a local dashboard

**Delete:**

- `src/pages/PlansListPage.vue`
- `src/components/dashboard/NamePromptDialog.vue`
- `src/components/dashboard/DashboardPageLayout.vue`

Do not change `src/api/client.ts`, `src/api/types.ts`, `src/components/dashboard/PlanSelectDialog.vue`, `src/components/PlanChecklistEditor.vue`, `package.json`, `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `cypress.config.ts`, or `vitest.config.ts` in this task.

## Execution Notes

_Reserved for the task execution agent: plan, commands run, test results, follow-ups._
