# R115 – Remove PlanNewPage and route

**Status**: Pending  
**Type**: Feature  
**Depends On**: R114  
**Description**: Remove the standalone New Plan page (`/plans/new`) now that plan creation is handled by the inline dialog on the Plan List page.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/router/index.ts`
- `src/pages/PlanNewPage.vue` — page to remove
- `src/pages/PlansListPage.vue` — primary create flow from R114
- `src/App.vue` — confirm no drawer link to `/plans/new` (R112 simplified nav)

## Goals

- Remove the `/plans/new` route (`PlanNew` name) from `src/router/index.ts`.
- Delete `src/pages/PlanNewPage.vue`.
- No navigation links in the app point to `/plans/new`.
- Direct visit to `/plans/new` should not render the old form (router may omit the route entirely or redirect to `/plans`; choose the simpler approach consistent with this repo).
- Plan creation is only available via the list-page dialog (R114).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Build**
  - `npm run build` — no broken imports referencing `PlanNewPage`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/plans/new` does not show the legacy New Plan form
  - **New Plan** on `/plans` still creates plans via dialog

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/router/index.ts` — remove `/plans/new` route
- `src/pages/PlanNewPage.vue` — **delete**

The agent must not update files outside this list.

## Execution Notes
