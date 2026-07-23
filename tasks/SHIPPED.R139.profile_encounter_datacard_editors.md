# R139 – Profile and Encounter edit pages → `DataCard` + typed editors

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R135  
**Description**: Convert `ProfileEditPage` and `EncounterEditPage` section chrome and `AutoSaveField` forms to spa_utils `DataCard` (`model`, `nameField`, `onSave`) with configurator-type editors (`field`, `editable`, `visible`, `automationId`). Prefer typed editors (including `EnumEditor` / `EnumArrayEditor` when `/api/config` enumerators apply) over new `AutoSaveField` usage.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `provideEditorConfig` / enum editors, `AutoSaveField` compatibility wrapper
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue` — reference composition
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `src/pages/ProfileEditPage.vue`
- `src/pages/EncounterEditPage.vue`
- `src/api/types.ts` — Profile / Mentee / Encounter field shapes
- `src/main.ts` / app root — ensure `provideEditorConfig` is available if enum editors are used
- `src/components/dashboard/PlanSelectDialog.vue` — keep for new-encounter flow
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`

**Supersedes:** R131. Prefer this task if both remain Pending.

## Goals

- Replace local collapsible `v-card` section shells on Profile and Encounter edit pages with `DataCard` (compose via `MhCard`; use `collapsible` where sections were expandable).
- Bind editable fields with typed editors inside `DataCard` using `field` + injected context (`onSave`), e.g.:
  - **word** / **sentence** / **markdown** / **email** / **us_phone** as appropriate
  - **EnumEditor** / **EnumArrayEditor** for enum fields when enumerator names exist in `/api/config` (via `provideEditorConfig`)
  - **IdentifierEditor** (`editable=false`) for ObjectIds when shown
  - **BreadcrumbDisplay** for audit breadcrumbs when displayed
- Prefer typed editors over `AutoSaveField`. Existing `AutoSaveField` remains supported as a compatibility wrapper — do not mass-rename leftover wrappers outside these pages.
- Use structured **`DateTimeEditor`** for ISO date-time fields that are editable. Do **not** ask users to type raw ISO wire formats. Use **`DurationEditor`** only if a duration-typed field appears on these pages.
- Preserve stable `data-automation-id` values (or update Cypress in the same task).
- Keep PlanSelectDialog / New Encounter behavior on Profile edit.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Profile and Encounter detail pages load; blur/change saves still PATCH correctly

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/ProfileEditPage.vue` — `DataCard` + typed editors
- `src/pages/EncounterEditPage.vue` — `DataCard` + typed editors (`DateTimeEditor` where date-time fields are editable)
- `src/main.ts` — only if `provideEditorConfig` must be wired at app root for enum editors
- `cypress/e2e/profile.cy.ts` — align automation IDs / assertions
- `cypress/e2e/encounter.cy.ts` — align automation IDs / assertions
- `README.md` — update Profile/Encounter docs if they still name `AutoSaveField` as the preferred pattern for these pages

The agent must not update files outside this list.

## Execution Notes

### Plan
1. Replace Profile/Encounter section `v-card` shells with spa_utils `DataCard` (collapsible via `MhCard`).
2. Bind Notes / Encounter / Summary / Transcript fields with typed editors; Profile read-only fields use `editable=false` editors.
3. Wire runtime enum config at app bootstrap via `app.provide(editorConfigKey, config)` in `main.ts` (app-level equivalent of `provideEditorConfig`).
4. Preserve section automation IDs; align Cypress only if selectors break.
5. Run unit/build, then E2E/packaging per Testing Expectations. Leave Status Pending.

### Completed
- `ProfileEditPage`: Profile / Notes / Encounters sections use `DataCard`; Notes use `SentenceEditor`/`MarkdownEditor`; Profile uses read-only typed editors including `EnumEditor` (`profile_status`).
- `EncounterEditPage`: sections use `DataCard`; TLDR/`date`/`status` editable; Summary/Transcript `MarkdownEditor`; interests via read-only `EnumArrayEditor`; mentor notes standalone `MarkdownEditor`.
- `main.ts`: provides `editorConfigKey` from `useConfig()` for enum editors.
- README Profile/Encounter guidance updated away from `AutoSaveField` as the preferred pattern on these pages.

### Test results
- `npm run test`: **PASS** (13 files / 91 tests)
- `npm run build`: **PASS** (`vue-tsc` + vite)
- `npm run container`: **PASS** (via `scripts/docker-build.sh`)
- `npm run service`: **PASS** (mentor stack on `:8392` / `:8391` / welcome `:8080`)
- `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`: **FAIL** — Cypress cross-origin IdP login (`http://localhost:8392` vs `http://127.0.0.1:8080`); not a page-regression from this task
- `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`: **FAIL** — same IdP cross-origin issue
- `npm run cypress:run`: **FAIL** — same IdP cross-origin issue across all specs
- Cypress: section IDs (`profile-edit-*-section`, `encounter-detail-*-section`) and `encounter-detail-tldr-input` preserved; `encounter.cy.ts` aligned to CardGrid `profile-dashboard-card-view-button` (same as parallel list-page Cypress updates)

### Status
Left **Pending** for orchestrator to ship.
