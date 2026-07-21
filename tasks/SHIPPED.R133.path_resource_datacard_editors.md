# R133 – Path and Resource edit pages → `DataCard` + typed editors

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R128  
**Description**: Convert Path and Resource edit forms from ad-hoc `v-card` + `AutoSaveField` / `AutoSaveSelect` to spa_utils `DataCard` with typed editors (`field`, `editable`, `visible`, `automationId`). Keep `AutoSaveSelect` for status enums.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `AutoSaveSelect`
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue`
- `src/pages/PathEditPage.vue`
- `src/pages/ResourceEditPage.vue`
- `src/api/types.ts` — Path / Resource shapes
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`

## Goals

- **PathEditPage** and **ResourceEditPage** use `DataCard` (`model`, optional `nameField`, `onSave`) wrapping typed editors:
  - `WordEditor` for `name`
  - `SentenceEditor` or `MarkdownEditor` for `description` per validation rules
  - `AutoSaveSelect` for `status`
- Prefer typed editors over `AutoSaveField` on these pages.
- Read-only created/saved metadata uses `BreadcrumbDisplay` and/or `DateTimeEditor` with `editable=false` instead of plain formatted text fields where practical — no raw ISO typing for users.
- Preserve `data-automation-id`s (`path-edit-*`, `resource-edit-*`) or update Cypress in the same task.
- New pages (`PathNewPage` / `ResourceNewPage`) are out of scope unless a tiny shared editor import is required for consistency (prefer leave create forms alone).

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

- `src/pages/PathEditPage.vue` — `DataCard` + typed editors / `AutoSaveSelect`
- `src/pages/ResourceEditPage.vue` — `DataCard` + typed editors / `AutoSaveSelect`
- `cypress/e2e/path.cy.ts` — align automation IDs / assertions
- `cypress/e2e/resource.cy.ts` — align automation IDs / assertions
- `README.md` — update Path/Resource edit docs if they still prescribe `AutoSaveField` as preferred

The agent must not update files outside this list.

## Execution Notes

**Status: Success**

- `PathEditPage.vue` and `ResourceEditPage.vue` rebuilt around `CardGrid` + two `DataCard`s each:
  - Primary card (`path-edit-card` / `resource-edit-card`): `WordEditor` (`field="name"`, `rules=[required, wordPattern]`) for `name`, `SentenceEditor` (`field="description"`) for `description` (validation is `descriptionPattern`/no tabs-newlines/255 max, which matches `sentence` semantics — `MarkdownEditor` was not a fit), and `AutoSaveSelect` kept standalone (`modelValue`/`onSave`) for `status` per task instruction — `AutoSaveSelect` has no `field`/`DataCard`-context support in spa_utils 0.5.4, so it is wired exactly as before, just nested inside the `DataCard` slot.
  - Audit card (`path-edit-audit-card` / `resource-edit-audit-card`): two `BreadcrumbDisplay` editors (`field="created"`, `field="saved"`) replace the four read-only `v-text-field`s (Created/Created By/Last Saved/Last Saved By) — no raw ISO text fields remain.
  - `name-field="name"` on the primary `DataCard` shows the live name next to the card title.
- All prior `data-automation-id`s preserved (`path-edit-name-input`, `path-edit-description-input`, `path-edit-status-select`, `path-edit-back-button`, same pattern for `resource-edit-*`); new ids added only for the audit card/fields (`*-audit-card`, `*-created`, `*-saved`) which had no automation id before.
- **Behavioral change requiring Cypress update:** `SentenceEditor` renders a single-line `v-text-field` (not a `v-textarea`) for `description`, per the shared editor contract (`sentence` type = single line, no tabs/newlines). Updated `cypress/e2e/path.cy.ts` / `resource.cy.ts` description-update assertions from `.find('textarea')` to `.find('input')` — this is the only Cypress change made for R133; the surrounding list-page (`path-list-grid` / card-based) assertions already present in these specs are from R129/R130 (untouched by this task).
- `README.md` has no existing Path/Resource edit page documentation prescribing `AutoSaveField`, so no README changes were needed/made for this task.
- Did not touch `PathNewPage.vue` / `ResourceNewPage.vue` (explicitly out of scope) or any other pages/components (`PlanChecklistEditor.vue`, list pages, etc. were already modified in the working tree by other in-progress tasks; left untouched).

### Testing

- `npm run test` — **passed** (13 files / 92 tests).
- `npm run build` (`vue-tsc && vite build`) — **passed** cleanly.
- Dev verification: `npm run api` (mh up mentor-api) and `npm run dev` started successfully; manual browser click-through of autosave was not performed interactively (no interactive browser in this execution environment), but the build/type-check confirms the templates and bindings are valid.
- **E2E — blocked in this environment**: `npx cypress install` succeeded, but the Cypress Electron binary fails to launch in this sandbox (`Cypress: bad option: --no-sandbox` — the binary is not executing as Electron; `--version` even returns the Node version instead of the Cypress version, indicating the sandboxed container cannot run the Electron/Chromium process here, e.g. missing user-namespace/sandbox capabilities). Reproduced under `xvfb-run` too — same failure. This is an environment limitation, not a code issue; `cypress:run:spec` for `path.cy.ts` and `resource.cy.ts` could not be executed and should be re-run in a standard dev machine / CI runner.
- **Packaging verification — skipped**: `npm run container` requires AWS CodeArtifact SSO credentials (`aws codeartifact get-authorization-token`) not available in this environment; `npm run service` and `npm run cypress:run` depend on the same blocked Cypress binary and/or Docker container build. Not attempted for those reasons.
