# R119 – Plan edit checklist CRUD UI (add, inline edit, delete)

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R118  
**Description**: Add a focused **Steps** section to `PlanEditPage` for sequential checklist management. Provide rapid-input append, per-step inline text editing, and per-step delete. All checklist mutations persist via `PATCH /api/plan/{PlanId}` with the full `checklist: string[]` array.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md` — `AutoSaveField`, `validationRules`, `useErrorHandler`
- `src/pages/PlanEditPage.vue` — existing name/description/status AutoSave fields (preserve unchanged)
- `src/api/client.ts` — `getPlan`, `updatePlan`
- `src/api/types.ts` — `Plan`, `PlanUpdate`
- `src/pages/ProfileEditPage.vue` — blur-to-save + `useMutation` pattern reference

**Design constraints**

- **Small footprint**: dedicated checklist component; no table, no search, no pagination.
- **Backend model**: `checklist` is an ordered `string[]`; each UI operation builds the new array and PATCHes the whole list.
- **Step validation**: match OpenAPI item pattern `^[^\t\n]{1,255}$` (required non-empty text, max 255, no tabs/newlines). `validationRules.descriptionPattern` allows empty strings — add a step-specific rule inline or in the component.
- **spa_utils**: prefer `useErrorHandler`, `validationRules`, and `AutoSaveField` for per-step inline edit where it fits the blur-to-save pattern; use Vuetify primitives consistent with existing `PlanEditPage` styling.

## Goals

- **Steps section** visible on `PlanEditPage` below plan metadata fields, labeled clearly (e.g. **Steps**).
- **Rapid add**: single input + submit (button and/or Enter key) appends a new step to the end of `checklist` and PATCHes immediately.
- **Inline edit**: each step text is editable in place; blur (or equivalent save gesture) PATCHes the full `checklist` with the updated string at that index.
- **Delete**: each step row has an adjacent **Delete** control that removes the step and PATCHes the remaining array.
- Local checklist state stays in sync with server after successful mutations (`invalidateQueries` on `['plan', planId]` and `['plans']`).
- `data-automation-id` values per spa_standards:
  - `plan-edit-checklist-section`
  - `plan-edit-checklist-add-input`
  - `plan-edit-checklist-add-button`
  - `plan-edit-checklist-step-list`
  - Per step (use index suffix): `plan-edit-checklist-step-{n}-input`, `plan-edit-checklist-step-{n}-delete-button`
- Empty checklist shows a minimal empty state (no steps yet); add input still available.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — add component unit tests if a new checklist component is created

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Navigate to `/plans/:id` → add a step, edit step text (blur), delete a step; refresh page — changes persist
  - Invalid step text (empty, tabs, >255 chars) shows validation feedback and does not PATCH

- **Packaging verification**
  - `npm run container`
  - `npm run build` succeeds

## Outputs

- `src/components/PlanChecklistEditor.vue` — new focused checklist CRUD component (or equivalent name)
- `src/pages/PlanEditPage.vue` — integrate Steps section; wire `useMutation` for checklist PATCH
- `src/components/PlanChecklistEditor.test.ts` — unit tests for add/edit/delete behavior (if component created)

The agent must not update files outside this list.

## Execution Notes

- Added `PlanChecklistEditor.vue` with rapid add, inline blur-to-save edit (`AutoSaveField`), and per-step delete; all mutations PATCH full `checklist` array.
- Integrated Steps section into `PlanEditPage.vue` via `updateChecklist`.
- Unit tests for checklist helper functions in `PlanChecklistEditor.test.ts`.
- `npm run test`: 85/85 passed; `npm run build` succeeded.
