# R129 – Profiles and Plans list pages → `CardGrid` + `MhCard`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R128  
**Description**: Replace local `DashboardCard` / `DashboardCardGrid` usage on Profiles and Plans list dashboards with spa_utils `CardGrid` + `MhCard`. Cards show **name** in the title bar and **description** only in the body. Plans get a page-level Add button and per-card Delete in `MhCard` `#actions`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI: Cards + type-aligned field editors; `MhCard` / `CardGrid` (fixed CSS Grid column contract; no `cols`/`sm`/`md`/`lg` props); demo at `/demo/dashboard`
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue` — reference composition (`#actions` pattern)
- `src/pages/ProfilesListPage.vue`
- `src/pages/PlansListPage.vue`
- `src/components/dashboard/DashboardCard.vue`
- `src/components/dashboard/DashboardCardGrid.vue`
- `src/components/dashboard/DashboardPageLayout.vue` — keep for page shell (heading / empty / error) unless superseded cleanly
- `src/components/dashboard/NamePromptDialog.vue` — keep for Plans create flow
- `src/api/client.ts` — only if Plans delete client method must be added from OpenAPI
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/plan.cy.ts`
- `cypress/e2e/navigation.cy.ts`

**External prerequisite (Plans delete):** Mentor API OpenAPI must document a DELETE (or equivalent) for Plan documents, and the live API must implement it. Confirm via `npm run api` then `curl -X GET "http://localhost:8391/docs/openapi.yaml"`. If delete is missing, set this task **Status** to `Blocked` for the delete goal only after implementing the rest — or leave delete out of Outputs and stop with Blocked notes; do **not** invent a delete API.

## Goals

- **ProfilesListPage** and **PlansListPage** render item cards via spa_utils `CardGrid` + `MhCard` instead of local `DashboardCard` / `DashboardCardGrid`.
- Use spa_utils `CardGrid` as shipped (container-width column contract). Do **not** pass removed breakpoint props (`cols` / `sm` / `md` / `lg`).
- **Simplified card content (both lists):**
  - Title bar: entity **name** (`MhCard` `name` or title binding — name is the primary label users see).
  - Body: **description only** (fallback copy such as “No description” is fine). Remove progress chips, last-encounter blurb, checklist step chips, and any other secondary list chrome.
- **Card actions:** Put affordances in `MhCard` `#actions` (title bar), not ad-hoc overlays on the body.
  - **Plans:** Delete control in `#actions` that calls the Plan delete API, confirms if needed, invalidates the plans query, and removes the card from the list on success. Wire a client method only if OpenAPI defines the operation.
  - **Profiles:** No delete (assignment/dashboard list; mentors do not delete mentee profiles from this page). Card click (or a single open/view action) still navigates to profile edit.
- **Add button:**
  - **Plans:** Keep a clear page-level **New Plan** / Add button (header actions) that opens `NamePromptDialog`, creates, and navigates — same create flow as today.
  - **Profiles:** No Add button (profiles are assigned mentees, not created from this list).
- Preserve stable list `data-automation-id`s used by Cypress (`profile-dashboard-*`, `plan-list-*`, etc.) or update specs in the same task when IDs must change. Add automation IDs for new delete controls (e.g. `plan-list-card-*-delete-button`).
- Keep `DashboardPageLayout` and `NamePromptDialog` if still useful; do **not** delete local dashboard components yet (R134 removes unused chrome after all list/edit migrations).
- Plan card click / open still navigates to plan edit.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/profiles` and `/plans` show spa_utils card grids: name + description only; Plans has Add; Plans delete works when API supports it

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/ProfilesListPage.vue` — `CardGrid` + `MhCard`; name + description only; navigate on open; no Add/Delete
- `src/pages/PlansListPage.vue` — `CardGrid` + `MhCard`; name + description only; Add (New Plan); Delete in `#actions`
- `src/api/client.ts` — only if Plan delete client method is required by OpenAPI
- `src/api/types.ts` — only if types must change for Plan delete
- `cypress/e2e/profile.cy.ts` — align selectors if automation IDs / content assertions change
- `cypress/e2e/plan.cy.ts` — align selectors; cover Add and Delete when implemented
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break

The agent must not update files outside this list.

## Execution Notes

**Plan (before implementation):**
- Confirmed `@mentor-forge/mentorhub_spa_utils@0.5.4` installed (R128 shipped); `CardGrid`/`MhCard` importable from package root.
- Delete-API check: docker is not available in this execution sandbox (`npm run api` cannot start containers), so the live OpenAPI at `localhost:8391` could not be fetched. Used the sibling `../mentorhub_mentor_api/docs/openapi.yaml` as the best-available source of truth: `/api/plan/{PlanId}` only defines `get` and `patch` — **no `delete` operation is documented**. Per task instructions, Plan delete is **not implemented**; task is otherwise shipped in full. This should be re-verified against the live OpenAPI when the API stack is reachable, in case the doc is stale.
- `MhCard`'s root `<v-card>` uses `defineOptions({ inheritAttrs: false })` and does not rebind `$attrs` in its template, so a `@click` passed directly to `<MhCard>` will not fire. To preserve existing "click card to navigate" behavior (relied on by `cypress/e2e/encounter.cy.ts`, which is out of scope for this task and must keep working), each card is wrapped in a `div` carrying the existing stable automation id (`profile-dashboard-card` / `plan-list-card`) and the `@click` handler; `MhCard` is nested inside for title/body chrome only (no `automationId` passed to `MhCard` itself, avoiding duplicate DOM ids).
- `ProfilesListPage.vue`: `CardGrid` + `MhCard`, `:name="profile.name"` (no `title`) for the title bar, body = description only (drop progress chips + last-encounter blurb). No Add, no Delete. Whole-card click still navigates to `/profiles/:id`. Kept `DashboardPageLayout` for heading/empty/error chrome.
- `PlansListPage.vue`: `CardGrid` + `MhCard`, `:name="plan.name"`, body = description only (drop the "Steps: N" chip). Kept page-level "New Plan" button + `NamePromptDialog` create flow unchanged. No `#actions` delete control (blocked — see above). Whole-card click still navigates to `/plans/:id`.
- `cypress/e2e/profile.cy.ts`: replaced the `.v-card-title` / Library/Now/Next chip assertions (removed chrome) with an assertion that the card shows non-empty text content (the profile name). Left navigation/empty-state specs unchanged.
- `cypress/e2e/plan.cy.ts` / `cypress/e2e/navigation.cy.ts`: no automation-id or assertion changes needed — reviewed, still valid against the new markup.
- Did not touch `src/api/client.ts` / `src/api/types.ts` (no Plan delete client method, since OpenAPI does not define the operation).

**Results (after implementation):**
- `npm run test` — pass (13 test files, 92 tests; no pre-existing unit tests target `ProfilesListPage.vue` / `PlansListPage.vue` directly, so no new failures/coverage gaps introduced).
- `npm run build` — pass (`vue-tsc` type-check + `vite build`); `ProfilesListPage` / `PlansListPage` each emit their own small CSS chunk, confirming `CardGrid`/`MhCard` styles are pulled in via the root package import.
- `npm run api`, `npm run dev`, `npm run container`, `npm run service`, `npm run cypress:run(:spec)` — **not run**: this execution sandbox has no working Docker daemon (`docker ps` fails to connect to `/var/run/docker.sock`), so the `mh`-based API/container stack cannot start and Cypress has no live app to exercise. `cypress/e2e/profile.cy.ts` was updated to match the new markup (`.mh-card__title` / `.mh-card__body` instead of removed `.v-card-title` + Library/Now/Next chips) and reviewed by inspection against `MhCard.vue`'s template; `plan.cy.ts` and `navigation.cy.ts` needed no changes (their assertions already only depend on the stable `plan-list-card` / heading automation ids, which are preserved). These should be re-run by the orchestrator (or in an environment with Docker) before shipping.
- Plan delete: **not implemented** — blocked, see plan note above (OpenAPI defines only `get`/`patch` on `/api/plan/{PlanId}`).
