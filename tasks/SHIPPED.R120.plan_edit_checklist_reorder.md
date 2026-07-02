# R120 – Plan edit checklist step reordering

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R119  
**Description**: Add interactive controls on `PlanEditPage` to change the sequence order of checklist steps. Reordering updates local state reactively and persists the new order via `PATCH /api/plan/{PlanId}` with the reordered `checklist: string[]`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md`
- `src/components/PlanChecklistEditor.vue` — checklist UI from R119
- `src/pages/PlanEditPage.vue`
- `src/api/client.ts` — `updatePlan`
- `src/api/types.ts` — `PlanUpdate`
- `../mentorhub_mentor_api/docs/openapi.yaml` — `PlanUpdate.checklist` (ordered array)

**Design constraints**

- Prefer **Move Up / Move Down** icon buttons for a small, predictable footprint; drag-and-drop is acceptable if implemented cleanly with the same PATCH contract.
- First step: Move Up disabled; last step: Move Down disabled.
- Reorder must not alter step text — only array index positions.
- Each successful reorder invalidates `['plan', planId]` and `['plans']` (step count on list cards unchanged; order matters for encounter use).

## Goals

- Each step row exposes reorder controls (e.g. **Move Up** / **Move Down** buttons, or drag handle + drop).
- Clicking reorder updates the displayed sequence immediately and PATCHes `{ checklist: reorderedArray }`.
- Reorder controls use stable `data-automation-id` values:
  - `plan-edit-checklist-step-{n}-move-up-button`
  - `plan-edit-checklist-step-{n}-move-down-button`
  - If drag-and-drop: `plan-edit-checklist-step-{n}-drag-handle`
- After refresh, step order matches last saved order from API.
- Existing add / inline edit / delete behavior from R119 remains intact.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — extend `PlanChecklistEditor.test.ts` (or equivalent) for reorder logic

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Create plan with ≥3 steps → move middle step up and down → refresh — order persists
  - `curl` or API explorer: `GET /api/plan/{id}` — `checklist` array order matches UI

- **Packaging verification**
  - `npm run container`
  - `npm run build` succeeds

## Outputs

- `src/components/PlanChecklistEditor.vue` — reorder controls and PATCH on reorder
- `src/components/PlanChecklistEditor.test.ts` — reorder unit tests

The agent must not update files outside this list unless `PlanEditPage.vue` needs a one-line prop/event wiring change; if so, note in Execution Notes and limit to minimal integration.

## Execution Notes

- Added drag-handle reordering per step with drop-target highlighting.
- `reorderChecklistItem` helper PATCHes full reordered array via existing `persistChecklist`.
- Extended `PlanChecklistEditor.test.ts` with reorder and bounds tests.
- `npm run test`: 90/90 passed.
