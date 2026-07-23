# R142 – Plan edit page → `DataCard` + typed editors

**Status**: Shipped
**Type**: Feature  
**Depends On**: R135, R138  
**Description**: Convert Plan edit metadata and related form chrome to spa_utils `DataCard` + typed editors. Replace `SchemaFieldsCard`’s `AutoSaveField` usage with type-aligned editors; prefer `EnumEditor` for status when an enumerator is available via `provideEditorConfig`. Align checklist section chrome with `MhCard` / `DataCard` where practical without losing reorder/CRUD behavior.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `EnumEditor`
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue`
- `src/pages/PlanEditPage.vue`
- `src/components/SchemaFieldsCard.vue`
- `src/components/PlanChecklistEditor.vue`
- `src/components/PlanChecklistEditor.test.ts`
- `src/api/types.ts` — re-check Plan schema against live OpenAPI if the companion API changed
- `cypress/e2e/plan.cy.ts`

## Goals

- Plan metadata (`name`, `description`, `status`) renders in a `DataCard` with:
  - `WordEditor` (or equivalent) for `name`
  - `SentenceEditor` / `MarkdownEditor` for `description` as appropriate to validation
  - `EnumEditor` for `status` when `/api/config` exposes the matching enumerator; otherwise keep `AutoSaveSelect` temporarily and note why in Execution Notes
- Prefer typed editors over `AutoSaveField` inside plan edit flows.
- Remove or slim `SchemaFieldsCard.vue` once Plan edit no longer needs its custom field-row chrome.
- `PlanChecklistEditor` keeps add / inline edit / delete / reorder; wrap or restyle with `MhCard`/`DataCard` (stable `plan-edit-checklist-*` automation IDs).
- Admin-only metadata may use `BreadcrumbDisplay` / `DateTimeEditor` (`editable=false`) instead of raw readonly text fields where it improves consistency.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - Update `src/components/PlanChecklistEditor.test.ts` if component contract changes
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/plans/{id}` metadata autosave, status, and checklist CRUD/reorder work

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PlanEditPage.vue` — `DataCard` + typed editors / EnumEditor
- `src/components/SchemaFieldsCard.vue` — update or **delete** if fully replaced
- `src/components/PlanChecklistEditor.vue` — card chrome alignment; keep checklist behavior
- `src/components/PlanChecklistEditor.test.ts` — update as needed
- `src/api/types.ts` — only if OpenAPI Plan sync is required
- `cypress/e2e/plan.cy.ts` — align automation IDs / assertions
- `README.md` — update Plan edit docs if they still prescribe `AutoSaveField` / `SchemaFieldsCard`

The agent must not update files outside this list.

## Execution Notes

- Plan: replace `SchemaFieldsCard` on `PlanEditPage` with a `DataCard` containing
  `WordEditor`, `SentenceEditor`, and `EnumEditor`; use the live
  `default_status` runtime enumerator verified from `/api/config`.
- Wrap the existing checklist controls in `MhCard` while preserving all stable
  `plan-edit-checklist-*` automation IDs and CRUD/reorder behavior.
- Remove the now-unused `SchemaFieldsCard`, update Plan documentation and E2E
  assertions, then run all testing and packaging commands required above.
- Implemented the Plan metadata `DataCard` with `WordEditor`,
  `SentenceEditor`, and `EnumEditor` backed by the live `default_status`
  enumerator. The checklist now uses `MhCard` without changing its add, edit,
  delete, reorder, or automation-ID contracts. The companion OpenAPI Plan
  schema still matches `src/api/types.ts`, so no type update was needed.
- Verification:
  - `npm run test` — passed (14 files, 93 tests).
  - `npm run build` — passed.
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts` — passed (5/5).
  - `npm run container` — passed.
  - `npm run cypress:run` — passed (6 specs, 39/39).
  - `npm run service` — Docker images and dependencies started, but Docker
    Desktop's WSL port-forward bridge returned HTTP 500 while exposing free
    port 8392; the script's desktop browser opener is also unavailable in this
    headless WSL environment. The same built UI/API flow was verified through
    Vite by the complete Cypress run.
