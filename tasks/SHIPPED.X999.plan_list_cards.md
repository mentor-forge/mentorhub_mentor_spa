# X999 – Plan list page (card interface)

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Implement the Plan List page per `Specifications/features.md` — card layout, step count, and inline new-plan dialog. SPA-only; uses existing Plan API endpoints.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub/Specifications/features.md` — Plan List page item (lines 39–40)

## Goals

- `/plans` renders a **card grid** (not a data table), modeled on the dashboard card pattern.
- Each card shows **Plan name**, **description**, and **step count** (`plan.steps?.length ?? 0`).
- Cards are clickable and navigate to `/plans/:id`.
- **New Plan** opens an inline **dialog** prompting for **plan name only**; on success, creates the plan and navigates to Plan Detail.
- Preserve **search** (`ListPageSearch`) and **load more** (`useInfiniteScroll`) behavior.

## Testing Expectations

- `npm run test`, `npm run build`, `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`

## Outputs

- `src/pages/PlansListPage.vue`
- `src/api/types.ts`
- `cypress/e2e/plan.cy.ts`

## Execution Notes

- Implemented card grid, step count chip, and new-plan dialog in `PlansListPage.vue`.
- `npm run test`: 80/80 passed; `npm run build` succeeded.
