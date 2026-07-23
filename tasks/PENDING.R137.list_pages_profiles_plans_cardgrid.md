# R137 – Profiles and Plans list pages → `CardGrid` + `MhCard`

**Status**: Pending  
**Type**: Feature  
**Depends On**: R135, R136  
**Description**: Replace local `DashboardCard` / `DashboardCardGrid` usage on Profiles and Plans list dashboards with spa_utils `CardGrid` + `MhCard`. Cards show **name** in the title bar and **description** only in the body. Plans use offset/size list fetching from R136 and a page-level Add button. No per-card Delete (Mentor API OpenAPI has no Plan DELETE).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI: Cards; fixed `CardGrid` column contract (no `cols`/`sm`/`md`/`lg` props); demo at `/demo/dashboard`
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue` — reference composition (`#actions` pattern)
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `src/pages/ProfilesListPage.vue`
- `src/pages/PlansListPage.vue`
- `src/components/dashboard/DashboardCard.vue`
- `src/components/dashboard/DashboardCardGrid.vue`
- `src/components/dashboard/DashboardPageLayout.vue` — keep for page shell unless superseded cleanly
- `src/components/dashboard/NamePromptDialog.vue` — keep for Plans create flow
- `src/api/client.ts` — `getPlans` / `getProfiles` after R136
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/plan.cy.ts`
- `cypress/e2e/navigation.cy.ts`

**OpenAPI note:** Reconfirm with `curl -X GET "http://localhost:8391/docs/openapi.yaml"`. `GET /api/profile` remains a non-paginated assignment dashboard array. `GET /api/plan` uses `offset`/`size` headers. There is **no** Plan DELETE — do not invent one.

**Supersedes:** R129 (0.5.4-era list task). Prefer this task if both remain Pending.

## Goals

- **ProfilesListPage** and **PlansListPage** render item cards via spa_utils `CardGrid` + `MhCard` instead of local `DashboardCard` / `DashboardCardGrid`.
- Use spa_utils `CardGrid` as shipped (container-width column contract). Do **not** pass removed breakpoint props (`cols` / `sm` / `md` / `lg`).
- **Simplified card content (both lists):**
  - Title bar: entity **name**.
  - Body: **description only** (fallback “No description” is fine). Remove progress chips, last-encounter blurb, checklist step chips, and other secondary list chrome.
- **Plans list data:** Fetch via R136 `getPlans` with `offset`/`size` headers (sensible default `size`, e.g. 20–100). Prefer a simple `useQuery` / load-more pattern over deprecated `useInfiniteScroll`. Profiles continue to use non-paginated `getProfiles()`.
- **Card actions:** Affordances in `MhCard` `#actions` when needed. **No Delete** on Profiles or Plans (API has no DELETE). Card click / open navigates to edit.
- **Add button:**
  - **Plans:** Page-level **New Plan** / Add opens `NamePromptDialog`, creates via POST, navigates — same create flow as today.
  - **Profiles:** No Add button.
- Preserve stable list `data-automation-id`s (`profile-dashboard-*`, `plan-list-*`, etc.) or update Cypress in the same task.
- Keep `DashboardPageLayout` and `NamePromptDialog` if still useful; do **not** delete local dashboard components yet (R142).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/profiles` and `/plans` show spa_utils card grids: name + description only; Plans has Add; Plans list uses offset/size headers

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
- `src/pages/PlansListPage.vue` — `CardGrid` + `MhCard`; name + description only; Add (New Plan); offset/size list fetch; no Delete
- `cypress/e2e/profile.cy.ts` — align selectors if automation IDs / content assertions change
- `cypress/e2e/plan.cy.ts` — align selectors; cover Add
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
