# R117 – Plans list card dashboard with create dialog

**Status**: Pending  
**Type**: Feature  
**Depends On**: R115, R116  
**Description**: Replace the Plans table/list/search page with a card dashboard matching the mentor profile dashboard pattern. Add a “New Plan” dialog (name only) that creates a plan and navigates to `PlanEditPage`. Remove `PlanNewPage` and the `/plans/new` route.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/pages/ProfilesListPage.vue` — layout/behavior reference (post-R115 shared components)
- `src/components/dashboard/` — shared components from R115
- `src/pages/PlansListPage.vue` — page to rewrite
- `src/pages/PlanNewPage.vue` — page to remove
- `src/pages/PlanEditPage.vue` — **navigation target only**; do not modify page content (future Plan Detail/editor feature)
- `src/router/index.ts`
- `cypress/e2e/plan.cy.ts`
- `src/api/client.ts` — `getPlans(): Plan[]`, `createPlan()` from R116

## Goals

- **PlansListPage** uses shared dashboard components (R115) with the same grid/card layout feel as the mentor dashboard.
- **No search**, **no pagination**, **no infinite scroll**, **no data table**.
- Fetch all plans via just GET plans.
- Each card displays:
  - Plan **name** (title)
  - Plan **description** (body; fallback text when empty)
  - **Step count** — `plan.checklist?.length ?? 0` (label e.g. “Steps: N”)
- Card click navigates to `/plans/{id}` (`PlanEditPage`).
- **New Plan** button opens `NamePromptDialog` (or shared equivalent):
  - Prompts for **plan name only** (required; validate with existing `validationRules.namePattern`)
  - On submit: `POST /api/plan` with `{ name }`, invalidate `['plans']`, navigate to `/plans/{newId}`
  - Dialog uses automation IDs: `plan-list-new-button`, `plan-list-new-name-input`, `plan-list-new-submit-button`, `plan-list-new-cancel-button`
- Page heading: “Plans” with `data-automation-id="plan-list-heading"`.
- Cards use `data-automation-id="plan-list-card"`.
- Empty state alert when no plans exist (`data-automation-id="plan-list-empty"`).
- Remove `PlanNewPage.vue` and delete `/plans/new` route from router.
- Update `cypress/e2e/plan.cy.ts`:
  - Remove table/search/`/plans/new` navigation tests
  - Test card dashboard visibility, create-via-dialog flow, navigation to edit page
  - Keep or adapt plan update test if it still applies via edit page (minimal changes to stay green)
- Update `README.md` if it documents Plans list/new flow.

**Out of scope:** Changes to `PlanEditPage.vue` content or behavior (future Plan Detail/editor tasks).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/plans` shows card grid (not table)
  - New Plan dialog creates plan and opens edit page
  - `/plans/new` is not a valid route

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PlansListPage.vue` — rewrite as card dashboard
- `src/pages/PlanNewPage.vue` — **delete**
- `src/router/index.ts` — remove `/plans/new` route
- `cypress/e2e/plan.cy.ts` — update for card UI and dialog create flow
- `README.md` — update Plans section if present or add brief Encounter Plans dashboard note

The agent must not update files outside this list.

## Execution Notes

_(Reserved for task execution agent.)_
