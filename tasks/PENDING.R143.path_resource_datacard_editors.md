# R143 – Path and Resource edit pages → `DataCard` + typed editors

**Status**: Pending  
**Type**: Feature  
**Depends On**: R135, R138  
**Description**: Convert Path and Resource edit forms from ad-hoc `v-card` + `AutoSaveField` / `AutoSaveSelect` to spa_utils `DataCard` with typed editors. Prefer `EnumEditor` for status via runtime config.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `EnumEditor`
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue`
- `src/pages/PathEditPage.vue`
- `src/pages/ResourceEditPage.vue`
- `src/api/types.ts` — Path / Resource shapes; re-check live OpenAPI if companion API changed
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`

## Goals

- **PathEditPage** and **ResourceEditPage** use `DataCard` (`model`, optional `nameField`, `onSave`) wrapping typed editors:
  - `WordEditor` for `name`
  - `SentenceEditor` or `MarkdownEditor` for `description` per validation rules
  - `EnumEditor` for `status` when config enumerators exist; otherwise temporary `AutoSaveSelect` with a note in Execution Notes
- Prefer typed editors over `AutoSaveField` on these pages.
- Read-only created/saved metadata uses `BreadcrumbDisplay` and/or `DateTimeEditor` with `editable=false` where practical.
- Preserve `data-automation-id`s (`path-edit-*`, `resource-edit-*`) or update Cypress in the same task.
- New pages (`PathNewPage` / `ResourceNewPage`) are out of scope unless a tiny shared import is required.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Path and Resource edit pages autosave name/description/status correctly

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/path.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/resource.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PathEditPage.vue` — `DataCard` + typed editors / EnumEditor
- `src/pages/ResourceEditPage.vue` — `DataCard` + typed editors / EnumEditor
- `src/api/types.ts` — only if OpenAPI Path/Resource sync is required
- `cypress/e2e/path.cy.ts` — align automation IDs / assertions
- `cypress/e2e/resource.cy.ts` — align automation IDs / assertions
- `README.md` — update Path/Resource edit docs if they still prescribe `AutoSaveField` as preferred

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
