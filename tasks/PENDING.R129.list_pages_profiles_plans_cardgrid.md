# R129 – Profiles and Plans list pages → `CardGrid` + `MhCard`

**Status**: Pending  
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

_Reserved for the task execution agent._
