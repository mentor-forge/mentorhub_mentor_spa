# R141 – Path and Resource edit pages → `DataCard` + typed editors

**Status**: Pending  
**Type**: Feature  
**Depends On**: R135  
**Description**: Convert Path and Resource edit forms from ad-hoc `v-card` + `AutoSaveField` / `AutoSaveSelect` to spa_utils `DataCard` with typed editors (`field`, `editable`, `visible`, `automationId`). Prefer `EnumEditor` for `status` via `/api/config` enumerators.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `EnumEditor`, `provideEditorConfig`
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue`
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `src/pages/PathEditPage.vue`
- `src/pages/ResourceEditPage.vue`
- `src/api/types.ts` — Path / Resource shapes
- `src/main.ts` — `provideEditorConfig` if needed and not already wired
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`

**Supersedes:** R133. Prefer this task if both remain Pending.

## Goals

- **PathEditPage** and **ResourceEditPage** use `DataCard` (`model`, optional `nameField`, `onSave`) wrapping typed editors:
  - `WordEditor` for `name`
  - `SentenceEditor` or `MarkdownEditor` for `description` per validation rules
  - `EnumEditor` for `status` when config enumerators are available; otherwise temporary `AutoSaveSelect`
- Prefer typed editors over `AutoSaveField` on these pages.
- Read-only created/saved metadata uses `BreadcrumbDisplay` and/or `DateTimeEditor` with `editable=false` instead of plain formatted text fields where practical.
- Preserve `data-automation-id`s (`path-edit-*`, `resource-edit-*`) or update Cypress in the same task.
- New pages (`PathNewPage` / `ResourceNewPage`) are out of scope unless a tiny shared editor import is required for consistency.

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

- `src/pages/PathEditPage.vue` — `DataCard` + typed editors / `EnumEditor`
- `src/pages/ResourceEditPage.vue` — `DataCard` + typed editors / `EnumEditor`
- `src/main.ts` — only if `provideEditorConfig` must be wired here and was not done earlier
- `cypress/e2e/path.cy.ts` — align automation IDs / assertions
- `cypress/e2e/resource.cy.ts` — align automation IDs / assertions
- `README.md` — update Path/Resource edit docs if they still prescribe `AutoSaveField` as preferred

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
