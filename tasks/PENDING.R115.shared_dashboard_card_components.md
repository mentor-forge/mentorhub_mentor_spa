# R115 – Shared dashboard and card components

**Status**: Pending  
**Type**: Feature  
**Depends On**: R113, R114  
**Description**: Extract reusable dashboard layout, card grid, and create-dialog patterns from `ProfilesListPage` so list/dashboard pages share one implementation. Establish local shared styling hooks so future visual changes apply everywhere from a single place.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/pages/ProfilesListPage.vue` — reference dashboard implementation
- `src/plugins/` — Vuetify theme configuration
- `../mentorhub_spa_utils/README.md` — existing shared library components (do not duplicate AutoSaveField, ListPageSearch, etc.)

**Scope note:** Tasks in this repo modify the mentor SPA only. Implement shared components under `src/components/` here. Document any strong candidates for promotion to `mentorhub_spa_utils` in Execution Notes; do not modify sibling repos in this task.

## Goals

- Introduce reusable components (names may vary; behavior must match):
  - **Dashboard layout** — page heading, loading indicator, empty-state alert, error snackbar pattern used by card dashboards.
  - **Dashboard card grid** — responsive `v-row` / `v-col` grid wrapper (cols 12 / sm-6 / md-4).
  - **Dashboard card** — clickable `v-card` with title slot, body slot, and optional footer/chip slot; consistent hover, height, and spacing.
  - **Name prompt dialog** — reusable dialog for “create resource with name only” flows (used by Plan list in R117; pattern should be generic).
- Add a **shared styles** module (e.g. `src/styles/dashboard.scss` or Vuetify utility classes in a single import) for card/dashboard spacing, typography, and chip styling so list dashboards do not duplicate inline classes.
- Refactor `ProfilesListPage.vue` to consume the new shared components without changing user-visible behavior (same automation IDs on equivalent elements).
- Preserve `data-automation-id` values on `ProfilesListPage` (`profile-dashboard-heading`, `profile-dashboard-empty`, `profile-dashboard-card`, etc.).
- List in Execution Notes other duplication candidates observed (editors, markdown fields, list tables) for future tasks — **do not** refactor Plan or other domains in this task.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - Add component unit tests for new shared components if non-trivial logic exists

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Mentor dashboard at `/profiles` looks and behaves as before (cards, navigation to edit page)

- **E2E**
  - `npm run cypress:run`

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/components/dashboard/DashboardPageLayout.vue` — **create** (or equivalent name)
- `src/components/dashboard/DashboardCardGrid.vue` — **create**
- `src/components/dashboard/DashboardCard.vue` — **create**
- `src/components/dashboard/NamePromptDialog.vue` — **create**
- `src/components/dashboard/index.ts` — **create** barrel export
- `src/styles/dashboard.scss` — **create** shared dashboard/card styles (imported from main entry or layout)
- `src/main.ts` or `src/App.vue` — import shared styles if needed
- `src/pages/ProfilesListPage.vue` — refactor to use shared components
- `src/pages/ProfilesListPage.test.ts` — **create or update** if ProfilesListPage logic moves to components

The agent must not update files outside this list.

## Execution Notes

_(Reserved for task execution agent.)_
