# X1000 – Plan detail page (steps editor)

**Status**: Shipped  
**Type**: Feature  
**Depends On**: X999  
**Description**: Implement Plan Detail step editing per `Specifications/features.md`.

## Goals

- Plan Detail includes editable **Steps** list with add, blur-save, and delete.
- Persists `steps: string[]` via PATCH `/api/plan/{id}`.

## Outputs

- `src/pages/PlanEditPage.vue`
- `src/api/types.ts`
- `cypress/e2e/plan.cy.ts`

## Execution Notes

- Added Steps section with add/delete and blur-save in `PlanEditPage.vue`.
- `npm run test`: 80/80 passed; `npm run build` succeeded.
