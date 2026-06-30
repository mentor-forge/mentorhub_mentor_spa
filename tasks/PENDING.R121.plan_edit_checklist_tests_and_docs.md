# R121 – PlanEditPage checklist tests and documentation

**Status**: Pending  
**Type**: Feature  
**Depends On**: R119, R120  
**Description**: Final verification for the Plan Detail/Editor checklist feature. Update Cypress E2E, unit tests as needed, and README for step management on `PlanEditPage`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md`
- `cypress/e2e/plan.cy.ts`
- `src/pages/PlanEditPage.vue`
- `src/components/PlanChecklistEditor.vue`
- `src/api/Plan.client.test.ts`
- `tasks/PENDING.R118.verify_plan_checklist_api_from_openapi.md` through `PENDING.R120.plan_edit_checklist_reorder.md`

## Goals

- Cypress `plan.cy.ts` updated with checklist workflows:
  - Steps section visible on edit page (`plan-edit-checklist-section`)
  - Add step via rapid-input (`plan-edit-checklist-add-input`, `plan-edit-checklist-add-button`)
  - Inline edit step text (blur) — value persists after reload or re-navigation
  - Delete step — removed from list and persists
  - Reorder step (move up or move down) — order persists after reload
- Existing plan.cy.ts scenarios (create via dialog, name/description/status edit, card navigation) still pass.
- `README.md` **Encounter Plans Dashboard** section documents:
  - `PlanEditPage` Steps/checklist management (add, edit, delete, reorder)
  - `checklist` field on `Plan` / `PlanUpdate`
  - E2E spec path for plan domain
- All unit tests pass.

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

- `cypress/e2e/plan.cy.ts` — checklist add, edit, delete, reorder assertions
- `README.md` — PlanEditPage checklist documentation
- `src/api/Plan.client.test.ts` — only if gaps remain after R118; limit to checklist coverage required for green CI

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
