# R131 – Profile and Encounter edit pages → `DataCard` + typed editors

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R128  
**Description**: Convert `ProfileEditPage` and `EncounterEditPage` section chrome and `AutoSaveField` forms to spa_utils `DataCard` (`model`, `nameField`, `onSave`) with configurator-type editors (`field`, `editable`, `visible`, `automationId`). Prefer typed editors over new `AutoSaveField` usage; keep `AutoSaveField` only where a typed editor does not fit yet.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `AutoSaveField` compatibility wrapper
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue` — reference composition
- `src/pages/ProfileEditPage.vue`
- `src/pages/EncounterEditPage.vue`
- `src/api/types.ts` — Profile / Mentee / Encounter field shapes
- `src/components/dashboard/PlanSelectDialog.vue` — keep for new-encounter flow
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`

## Goals

- Replace local collapsible `v-card` section shells on Profile and Encounter edit pages with `DataCard` (compose via `MhCard`; use `collapsible` where sections were expandable).
- Bind editable fields with typed editors inside `DataCard` using `field` + injected context (`onSave`), e.g.:
  - **word** / **sentence** / **markdown** / **email** / **us_phone** as appropriate for profile/mentee notes fields
  - **IdentifierEditor** (`editable=false`) for ObjectIds when shown
  - **BreadcrumbDisplay** for audit breadcrumbs when displayed
- Prefer typed editors over `AutoSaveField`. Existing `AutoSaveField` remains supported as a compatibility wrapper — do not mass-rename leftover wrappers outside these pages.
- Use structured **`DateTimeEditor`** for ISO date-time fields that are editable (e.g. `Encounter.date`, `Mentee.next_appointment` if surfaced for edit). Do **not** ask users to type raw ISO wire formats. Use **`DurationEditor`** only if a duration-typed field appears on these pages (none identified in current types — skip unless present).
- Preserve stable `data-automation-id` values (or update Cypress in the same task when IDs must change per spa_standards `-display` / input conventions).
- Keep PlanSelectDialog / New Encounter behavior on Profile edit.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`
  - Update or add page/component unit tests if Profile/Encounter page tests exist or logic moves

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
- `cypress/e2e/profile.cy.ts` — align automation IDs / assertions
- `cypress/e2e/encounter.cy.ts` — align automation IDs / assertions
- `README.md` — update Profile/Encounter docs if they still name `AutoSaveField` as the preferred pattern for these pages

The agent must not update files outside this list.

## Execution Notes

### Plan
1. Read spa_standards, `README.md`, spa_utils `README.md` (DataCard / typed editors), `demo/pages/EditorsPage.vue`, `DataCard.vue` / `MhCard.vue` / `useDataCardContext.ts` sources, all typed editors used below, `types.ts`, `PlanSelectDialog.vue`, and both Cypress specs.
2. Rewrite `ProfileEditPage.vue`:
   - **Profile** section → `DataCard` (`name-field="name"`) over a computed display-only model (`name`, `status`, `start_date`, `location`, `employer`, `job_title`, `email`, `phone` — several are derived from nested `experience`, not a single `Profile` property, so the model is a flat computed record rather than binding straight to `profileDetail.profile`). Fields render as `SentenceEditor` / `EmailEditor` / `UsPhoneEditor` with `editable="false"` (display-only, unchanged from before). `onSave` is a no-op stub — never invoked since nothing here is editable.
   - **Notes** section → `DataCard` over `mentee`; `SentenceEditor` for `description` (Relationship Summary) / `focus`, `MarkdownEditor` for `homework` / `notes` (previously the only two rendered as `textarea`). `onSave` PATCHes `Mentee` via the existing `updateMentee` mutation, generalized to `saveMenteeField(field, value)`.
   - **Encounters** section → plain `MhCard` (`collapsible`) — no field editors apply (it's a list + a New Encounter action), so `DataCard`'s `model`/`onSave` contract doesn't fit; the New Encounter button moved into `MhCard`'s `#actions` slot (no more `@click.stop` needed — MhCard's collapse toggle is a distinct button, not a whole-header click target).
   - Removed manual `profileExpanded` / `notesExpanded` / `encountersExpanded` refs and chevron/`v-expand-transition` markup — `DataCard`/`MhCard` provide collapse behavior natively, uncontrolled default matches the previous default-expanded state for all three sections.
3. Rewrite `EncounterEditPage.vue`:
   - **Profile** → `DataCard` over `mentee`; kept goals/interests chips and journey lists as plain display (no typed editor fits read-only arrays), converted the Mentor Notes `AutoSaveField` (textarea) to `MarkdownEditor` (`field="notes"`).
   - **Checklist** → plain `MhCard` (`collapsible`) — agenda items are array-of-objects checkbox toggles, not a single-field editor; kept `toggleAgendaItem` logic as-is.
   - **Encounter** (TLDR) → `DataCard`; TLDR is `SentenceEditor` with explicit `:rules="[required, descriptionPattern]"` (matches prior required + 255-char rule).
   - **Summary** / **Transcript** → `DataCard` with `MarkdownEditor` (`rows=12`); Transcript kept its prior default-collapsed state via `v-model:collapsed="transcriptCollapsed"` (`ref(true)`), all others left uncontrolled/expanded (matches prior defaults).
   - Generalized `updateField` → `saveEncounterField(field, value)` matching the `DataCard` `onSave` contract.
4. **DateTimeEditor / DurationEditor**: neither page has a currently-*editable* ISO date-time or duration field (`Encounter.date` is display-only in the heading; `Mentee.next_appointment` isn't surfaced anywhere in the UI). Per the Goal's own precedent for `DurationEditor` ("none identified... skip unless present"), skipped both — no new editable fields were introduced to force their use, since that would be a functional change beyond this refactor's scope.
5. **IdentifierEditor / BreadcrumbDisplay**: no ObjectId or audit breadcrumb is currently rendered on either page, so neither typed editor applies ("when shown" / "when displayed" — skipped).
6. **Automation IDs**: all container-level IDs asserted by Cypress (`profile-edit-heading`, `profile-edit-profile-section`, `profile-edit-notes-section`, `profile-edit-encounters-section`, `profile-edit-new-encounter-button`, `profile-edit-encounter-item`, `encounter-detail-heading`, `encounter-detail-profile-section`, `encounter-detail-checklist-section`, `encounter-detail-encounter-section`, `encounter-detail-tldr-input`, `encounter-detail-back-button`) are preserved byte-for-byte. `AutoSaveField` (kept for existing pages) is itself a thin wrapper around the same `StringEditor` base as `SentenceEditor` / `MarkdownEditor`, so the rendered DOM (and thus `.find('input')` / `.find('textarea')` Cypress queries) for every editable field is unchanged. The 8 read-only Profile fields (`profile-edit-profile-name/status/start-date/location/employer/job-title/email/phone`) now auto-suffix `-display` per the `StringEditor` `editable=false` convention (spa_standards `-display` suffix); none of these are referenced by Cypress, so no spec changes were required. **Conclusion: `cypress/e2e/profile.cy.ts` and `cypress/e2e/encounter.cy.ts` needed no edits** — verified via `grep` across `cypress/` for every automation ID touched by this task before and after the rewrite.
7. Updated `README.md` "Mentor Dashboard and Profile Edit" and "Encounter Detail" sections to describe `DataCard`/`MhCard` composition and typed editors in place of `AutoSaveField`.
8. Noticed sibling `PENDING.*` tasks (R129/R130/R132/R133) had concurrent uncommitted changes in this same working tree (different files: `ProfilesListPage.vue`, `PlansListPage.vue`, `PathsListPage.vue`, `ResourcesListPage.vue`, `PathEditPage.vue`, `ResourceEditPage.vue`, `PlanEditPage.vue`, `PlanChecklistEditor.vue`, `SchemaFieldsCard.vue`, and unrelated sections of `README.md` / other Cypress specs) — consistent with `_ORCHESTRATE.md`'s concurrent-agent model. Confirmed via `git diff --stat` that only this task's declared Outputs were touched by this session.

### Commands run
- `npm run build` — **PASS** (`vue-tsc && vite build`)
- `npm run test` — **PASS**, 13 files / 92 tests (no page-level unit tests exist or are required — pages are tested via E2E per spa_standards; no new page tests added)
- `npm run api` — mongodb + mentor-api containers up
- `npm run dev` — Vite dev server on `:8392`; fetched both rewritten `.vue` modules directly (`curl` 200, no compile/HMR errors in server log)
- `npm run container` — **PASS**
- `npm run service` — **PASS** (db + api + spa containers up; `curl` confirms `index.html` and a built page chunk both return 200 from the containerized SPA)
- `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`, `npm run cypress:run` — **BLOCKED (environment)**: Cypress's bundled Electron binary cannot start in this sandbox (`bad option: --no-sandbox` / `--smoke-test` / `--ping=…`, no system Chromium/Playwright cache available as a fallback either) — pre-existing sandbox limitation, unrelated to this change. `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts` and `npm run cypress:run` (packaging) skipped for the same reason.

### Test results summary
- **Unit / build**: green (92/92 tests; typecheck + build clean)
- **Container / service packaging**: green (image builds; full stack serves the built SPA)
- **E2E (Cypress)**: **Skipped — sandbox cannot launch the Cypress browser binary.** Confidence in Cypress passing is high given (a) every automation ID exercised by the two specs is preserved unchanged, and (b) the editable-field DOM is unchanged because `AutoSaveField`, `SentenceEditor`, and `MarkdownEditor` all render through the same underlying `StringEditor` component — but this was not directly executed in this environment and should be re-run wherever a working Cypress browser is available (e.g. CI) before shipping.

### Files changed
- `src/pages/ProfileEditPage.vue`
- `src/pages/EncounterEditPage.vue`
- `README.md`
- `cypress/e2e/profile.cy.ts` / `cypress/e2e/encounter.cy.ts` — **not modified** (no automation ID or DOM-shape changes required; verified above)

### Status
Ready for orchestrator review. Recommend running the two Cypress specs in an environment with a working browser before marking Shipped.
