# R129 – Profiles and Plans list pages → `CardGrid` + `MhCard`

**Status**: Pending  
**Type**: Feature  
**Depends On**: R128  
**Description**: Replace local `DashboardCard` / `DashboardCardGrid` usage on Profiles and Plans list dashboards with spa_utils `CardGrid` + `MhCard` (default breakpoints `cols=12 sm=6 md=4 lg=3`), including title-bar `#actions` where create/navigate actions belong on the card chrome.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI: Cards + type-aligned field editors; `MhCard` / `CardGrid` demo at `/demo/dashboard`
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue` — reference composition
- `src/pages/ProfilesListPage.vue`
- `src/pages/PlansListPage.vue`
- `src/components/dashboard/DashboardCard.vue`
- `src/components/dashboard/DashboardCardGrid.vue`
- `src/components/dashboard/DashboardPageLayout.vue` — keep for page shell (heading / empty / error) unless superseded cleanly
- `src/components/dashboard/NamePromptDialog.vue` — keep for Plans create flow
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/plan.cy.ts`
- `cypress/e2e/navigation.cy.ts`

## Goals

- **ProfilesListPage** and **PlansListPage** render item cards via spa_utils `CardGrid` + `MhCard` instead of local `DashboardCard` / `DashboardCardGrid`.
- Use `CardGrid` defaults (`cols="12" sm="6" md="4" lg="3"`) unless a documented override is required for content density.
- Put card-level affordances in `MhCard` `#actions` (title bar), not ad-hoc overlays on the body.
- Preserve stable list `data-automation-id`s used by Cypress (`profile-dashboard-*`, `plan-list-*`, etc.) or update specs in the same task when IDs must change.
- Keep `DashboardPageLayout` and `NamePromptDialog` if still useful; do **not** delete local dashboard components yet (R134 removes unused chrome after all list/edit migrations).
- Behavior unchanged: profile cards navigate to profile edit; plan cards navigate to plan edit; Plans “New Plan” dialog still creates and navigates.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/profiles` and `/plans` show spa_utils card grids with prior navigation/create behavior

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/ProfilesListPage.vue` — `CardGrid` + `MhCard`
- `src/pages/PlansListPage.vue` — `CardGrid` + `MhCard`
- `cypress/e2e/profile.cy.ts` — align selectors if automation IDs change
- `cypress/e2e/plan.cy.ts` — align selectors if automation IDs change
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
