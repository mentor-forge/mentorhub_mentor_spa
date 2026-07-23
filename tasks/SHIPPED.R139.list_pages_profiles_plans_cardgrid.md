# R139 – Profiles and Plans list pages → `CardGrid` + `MhCard`

**Status**: Shipped
**Type**: Feature  
**Depends On**: R135, R137  
**Description**: Replace local `DashboardCard` / `DashboardCardGrid` usage on Profiles and Plans list dashboards with spa_utils `CardGrid` + `MhCard`. Cards show **name** in the title bar and **description** only in the body. Plans keep a page-level Add button. Use the OpenAPI-aligned Plan list client from R137 (offset/size when present; Profiles remain a full array fetch if unpaginated).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI: Cards; `MhCard` / `CardGrid` (fixed CSS Grid column contract; no `cols`/`sm`/`md`/`lg` props); demo at `/demo/dashboard`
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue` — reference composition (`#actions` pattern)
- `src/pages/ProfilesListPage.vue`
- `src/pages/PlansListPage.vue`
- `src/components/dashboard/DashboardCard.vue`
- `src/components/dashboard/DashboardCardGrid.vue`
- `src/components/dashboard/DashboardPageLayout.vue` — keep for page shell unless superseded cleanly
- `src/components/dashboard/NamePromptDialog.vue` — keep for Plans create flow
- `src/api/client.ts` — consume R137 list signatures
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/plan.cy.ts`
- `cypress/e2e/navigation.cy.ts`

**OpenAPI check (before wiring delete or paging UX):** `npm run api` then `curl -X GET "http://localhost:8391/docs/openapi.yaml"`. Planning-time spec: Plan list has offset/size pagination; Profile list does not. DELETE for Plan was **not** present — do **not** invent delete UI unless the live spec documents it when this task runs.

## Goals

- **ProfilesListPage** and **PlansListPage** render item cards via spa_utils `CardGrid` + `MhCard` instead of local `DashboardCard` / `DashboardCardGrid`.
- Use spa_utils `CardGrid` as shipped (container-width column contract). Do **not** pass removed breakpoint props (`cols` / `sm` / `md` / `lg`).
- **Simplified card content (both lists):**
  - Title bar: entity **name**.
  - Body: **description only** (fallback “No description” is fine). Remove progress chips, last-encounter blurb, checklist step chips, and other secondary list chrome.
- **Card actions:** Put affordances in `MhCard` `#actions` (title bar), not ad-hoc overlays on the body.
  - **Plans:** Delete in `#actions` **only if** OpenAPI documents Plan DELETE; otherwise omit delete.
  - **Profiles:** No delete. Card open navigates to profile edit.
- **Add button:**
  - **Plans:** Page-level **New Plan** / Add opens `NamePromptDialog`, creates, navigates — same create flow as today.
  - **Profiles:** No Add button.
- Plans list fetch uses the R137 client (offset/size headers when fetching pages, or a single page sized for the dashboard). Profiles use the non-paginated list if OpenAPI still has none.
- Preserve stable list `data-automation-id`s or update Cypress in the same task.
- Keep `DashboardPageLayout` / `NamePromptDialog`; do **not** delete local dashboard card components yet (R144).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/profiles` and `/plans` show spa_utils card grids: name + description only; Plans has Add

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
- `src/pages/PlansListPage.vue` — `CardGrid` + `MhCard`; name + description only; Add (New Plan); Delete only if OpenAPI defines it
- `src/api/client.ts` — only if a tiny list helper adjustment is required beyond R137
- `cypress/e2e/profile.cy.ts` — align selectors if automation IDs / content assertions change
- `cypress/e2e/plan.cy.ts` — align selectors; cover Add (and Delete only if implemented)
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break

The agent must not update files outside this list.

## Execution Notes

- Confirm the live OpenAPI contract before implementation; use offset/size headers for the Plan dashboard and omit Plan delete unless the contract exposes DELETE.
- Replace each local dashboard grid/card composition with spa_utils `CardGrid` + `MhCard`, retaining the existing page shell, stable card automation IDs, and Plans create dialog.
- Keep card bodies to description-only content and expose navigation through title-bar `#actions`.
- Update only affected Cypress selectors/assertions, then run the full unit, build, dev/E2E, and packaging verification requested above.
- Live OpenAPI confirmed Plan GET pagination via `offset`/`size` request headers and no Plan DELETE operation. The dashboard requests a single 100-item page and exposes no delete UI.
- Implemented `CardGrid` + `MhCard` on Profiles and Plans with name-only title bars, description-only bodies, title-bar Open actions, and backwards-compatible whole-card navigation. Plans retains the page-level `NamePromptDialog` create flow.
- Verification passed: `npm run test` (92/92), `npm run build`, the three requested Cypress specs (22/22 total), `npm run container`, packaged stack startup/HTTP checks, and `npm run cypress:run` (38/38). `npm run service` brought up the stack but its trailing browser-open helper is unavailable in WSL; direct `mh down && mh up mentor` completed successfully and the packaged SPA/API endpoints responded.
