# R132 – Plan edit page → `DataCard` + typed editors

**Status**: Pending  
**Type**: Feature  
**Depends On**: R128  
**Description**: Convert Plan edit metadata and related form chrome to spa_utils `DataCard` + typed editors. Replace `SchemaFieldsCard`’s `AutoSaveField` usage with type-aligned editors; keep `AutoSaveSelect` for status (no enum editor in spa_utils 0.5.x). Align checklist section chrome with `MhCard` / `DataCard` where practical without losing reorder/CRUD behavior.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `AutoSaveSelect` retained for discrete options
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue`
- `src/pages/PlanEditPage.vue`
- `src/components/SchemaFieldsCard.vue`
- `src/components/PlanChecklistEditor.vue`
- `src/components/PlanChecklistEditor.test.ts`
- `cypress/e2e/plan.cy.ts`

## Goals

- Plan metadata (`name`, `description`, `status`) renders in a `DataCard` with:
  - `WordEditor` (or equivalent) for `name`
  - `SentenceEditor` / `MarkdownEditor` for `description` as appropriate to validation
  - `AutoSaveSelect` for `status` (keep — no enum editor yet)
- Prefer typed editors over `AutoSaveField` inside plan edit flows.
- Remove or slim `SchemaFieldsCard.vue` once Plan edit no longer needs its custom field-row chrome; do not leave a parallel local card system that duplicates `DataCard`/`MhCard`.
- `PlanChecklistEditor` keeps add / inline edit / delete / reorder behavior; wrap or restyle with `MhCard`/`DataCard` so it matches spa_utils card chrome (stable `plan-edit-checklist-*` automation IDs).
- Admin-only metadata may use `BreadcrumbDisplay` / `DateTimeEditor` (`editable=false`) instead of raw readonly `v-text-field` + `formatDate` where it improves consistency.
- Use `DurationEditor` / `DateTimeEditor` only where duration or date-time types appear on Plan (none required today beyond breadcrumbs/`at_time` display).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - Update `src/components/PlanChecklistEditor.test.ts` if component contract changes
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/plans/{id}` metadata autosave, status select, and checklist CRUD/reorder work

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PlanEditPage.vue` — `DataCard` + typed editors / `AutoSaveSelect`
- `src/components/SchemaFieldsCard.vue` — update or **delete** if fully replaced
- `src/components/PlanChecklistEditor.vue` — card chrome alignment; keep checklist behavior
- `src/components/PlanChecklistEditor.test.ts` — update as needed
- `cypress/e2e/plan.cy.ts` — align automation IDs / assertions
- `README.md` — update Plan edit docs if they still prescribe `AutoSaveField` / `SchemaFieldsCard`

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
