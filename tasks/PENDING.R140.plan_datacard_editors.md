# R140 – Plan edit page → `DataCard` + typed editors

**Status**: Pending  
**Type**: Feature  
**Depends On**: R135  
**Description**: Convert Plan edit metadata and related form chrome to spa_utils `DataCard` + typed editors. Replace `SchemaFieldsCard`’s `AutoSaveField` usage with type-aligned editors; use `EnumEditor` for `status` when the enumerator is available via `/api/config` (fallback `AutoSaveSelect` only if config wiring is not ready). Align checklist section chrome with `MhCard` / `DataCard` without losing reorder/CRUD behavior.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `EnumEditor`, `provideEditorConfig`
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue`
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `src/pages/PlanEditPage.vue`
- `src/components/SchemaFieldsCard.vue`
- `src/components/PlanChecklistEditor.vue`
- `src/components/PlanChecklistEditor.test.ts`
- `src/main.ts` — `provideEditorConfig` if enum editors need app-root config
- `cypress/e2e/plan.cy.ts`

**Supersedes:** R132. Prefer this task if both remain Pending.

## Goals

- Plan metadata (`name`, `description`, `status`) renders in a `DataCard` with:
  - `WordEditor` (or equivalent) for `name`
  - `SentenceEditor` / `MarkdownEditor` for `description` as appropriate to validation
  - `EnumEditor` for `status` with the correct `enums` name from `/api/config` when available; otherwise keep `AutoSaveSelect` temporarily
- Prefer typed editors over `AutoSaveField` inside plan edit flows.
- Remove or slim `SchemaFieldsCard.vue` once Plan edit no longer needs its custom field-row chrome; do not leave a parallel local card system that duplicates `DataCard`/`MhCard`.
- `PlanChecklistEditor` keeps add / inline edit / delete / reorder behavior; wrap or restyle with `MhCard`/`DataCard` so it matches spa_utils card chrome (stable `plan-edit-checklist-*` automation IDs).
- Admin-only metadata may use `BreadcrumbDisplay` / `DateTimeEditor` (`editable=false`) instead of raw readonly `v-text-field` + `formatDate` where it improves consistency.

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

- `src/pages/PlanEditPage.vue` — `DataCard` + typed editors / `EnumEditor` (or temporary `AutoSaveSelect`)
- `src/components/SchemaFieldsCard.vue` — update or **delete** if fully replaced
- `src/components/PlanChecklistEditor.vue` — card chrome alignment; keep checklist behavior
- `src/components/PlanChecklistEditor.test.ts` — update as needed
- `src/main.ts` — only if `provideEditorConfig` must be wired here and was not done in R139
- `cypress/e2e/plan.cy.ts` — align automation IDs / assertions
- `README.md` — update Plan edit docs if they still prescribe `AutoSaveField` / `SchemaFieldsCard`

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
