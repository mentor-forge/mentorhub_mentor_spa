# R114 – Plan detail steps editor

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R113  
**Description**: Add a steps checklist editor to Plan Detail page per `Specifications/features.md`.

## Context

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub/Specifications/features.md` — Plan Detail page item
- `src/pages/PlanEditPage.vue`
- `src/api/types.ts`
- `cypress/e2e/plan.cy.ts`

## Goals

- Plan Detail page shows an editable list of steps.
- **Add Step** appends a step and persists via PATCH.
- **Delete** removes a step and persists via PATCH.
- Step text editable inline; saves on blur.
- Steps persist through existing `updatePlan` API (no API repo changes).

## Testing Expectations

- `npm run test` — pass
- `npm run build` — pass
- `npm run cypress:run` — add/delete steps E2E (when API available)

## Outputs

- `src/pages/PlanEditPage.vue`
- `src/api/types.ts`
- `cypress/e2e/plan.cy.ts`

## Execution Notes

- Added Steps section with list, inline text fields, add/delete buttons.
- Persists `steps: string[]` via existing PATCH `/api/plan/:id` (Mongo accepts extra fields).
- `npm run test`: 80/80 passed; `npm run build` succeeded.
