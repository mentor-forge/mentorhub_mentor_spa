# R116 – Plan list tests and documentation

**Status**: Pending  
**Type**: Feature  
**Depends On**: R113, R114, R115  
**Description**: Update Cypress E2E tests, unit test fixtures, and README documentation for the Plan List card interface, inline new-plan dialog, and removal of `PlanNewPage`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `tasks/PENDING.R113.plan_list_card_interface.md`
- `tasks/PENDING.R114.plan_list_new_dialog.md`
- `tasks/PENDING.R115.remove_plan_new_page.md`
- `cypress/e2e/plan.cy.ts`
- `src/api/Plan.client.test.ts`

## Goals

- `cypress/e2e/plan.cy.ts` updated:
  - Card list display, step count on cards, card click navigation
  - New-plan dialog create and cancel flows (list-page automation IDs)
  - **Remove** tests that depend on `/plans/new` or `plan-new-*` automation IDs
  - Plan step add/delete and search tests create plans via the **list dialog** instead of the removed new page
- `README.md` **Encounter Plans** section updated:
  - `/plans` — card list with name, description, step count, inline New Plan dialog
  - `/plans/:id` — Plan Detail (unchanged)
  - **Remove** `/plans/new` route row and `PlanNewPage` references
- `Plan.client.test.ts` fixtures include `steps` where relevant (if not already present).
- All unit tests pass.
- Full packaging + E2E pass against containerized runtime where environment permits.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **E2E tests** (dev runtime)
  - `npm run api`
  - `npm run dev`
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run` — full suite against packaged runtime

## Outputs

- `cypress/e2e/plan.cy.ts` — Plan list card and dialog flows; no legacy `/plans/new` coverage
- `README.md` — Encounter Plans section (routes, features, E2E commands)
- `src/api/Plan.client.test.ts` — extend fixtures if needed for `steps` on list responses

The agent must not update files outside this list.

## Execution Notes
