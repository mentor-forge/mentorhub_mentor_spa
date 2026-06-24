# R113 – Plan list page cards and new-plan dialog

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Refactor Plans list page to a card interface with step count and inline new-plan dialog per `Specifications/features.md`.

## Context

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub/Specifications/features.md` — Plan List page item
- `src/pages/PlansListPage.vue`
- `src/pages/ProfilesListPage.vue` — card layout reference
- `cypress/e2e/plan.cy.ts`

## Goals

- Plans list uses clickable cards showing name, description, and step count.
- **New Plan** opens a dialog prompting for plan name only; on create, navigates to Plan Detail.
- Search and load-more behavior preserved via `useInfiniteScroll`.
- Automation IDs: `plan-list-card`, `plan-list-card-step-count`, `plan-list-new-dialog`, etc.

## Testing Expectations

- `npm run test` — pass
- `npm run build` — pass
- `npm run cypress:run` — plan list E2E (when API available)

## Outputs

- `src/pages/PlansListPage.vue`
- `src/api/types.ts` — optional `steps` on Plan types
- `cypress/e2e/plan.cy.ts`

## Execution Notes

- Replaced data table with card grid modeled on `ProfilesListPage`.
- New Plan uses `v-dialog` with name-only prompt; creates plan and routes to `/plans/:id`.
- Step count displays `plan.steps?.length ?? 0`.
- `npm run test`: 80/80 passed; `npm run build` succeeded.
