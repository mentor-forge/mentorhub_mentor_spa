# F161 – Harvest package `DataCardGrid` and `MarkdownEditor`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F160_pin_spa_utils_1_0_6`  
**Description**: After the **1.0.6** pin, import `DataCardGrid` and `MarkdownEditor` from `@mentor-forge/mentorhub_spa_utils`, switch Mentor multi-card pages to those exports, and **delete** the SPA-local copies so there is one implementation. Remove SPA `marked` / `dompurify` (and `@types/dompurify`) if they existed only for the local editor. Detail/edit pages keep working through the existing editor props; rendered markdown resting view arrives with the package bump.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub_spa_utils/README.md` — **MhCard / DataCard / DataCardGrid** (class `data-card-grid`, hardcoded `data-automation-id="data-card-grid"`, no props; columns 1 below 641px, 2 from 641px, 4 from 1920px; multi-card view/edit only — not a Fragment flattener, not a list dashboard); **Type-aligned editors** (`markdown` / `MarkdownEditor`: props `field`, `modelValue`, `onSave`, `editable`, `visible`, `automationId`, `label`, `hint`, `rules`, `rows`; resting view sanitized GFM HTML; editable fields enter textarea on click or Enter; textarea id `${automationId}-input`; display `${automationId}-display`; value `markdown-field-display`; `marked` / `dompurify` bundled — consumers do not import them)
- `README.md` — after F160 should name spa_utils **1.0.6**; update component ownership to package `DataCardGrid` / `MarkdownEditor`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` — pin must already be **1.0.6**; currently lists `marked`, `dompurify`, and `@types/dompurify` for the SPA-local editor
- `src/components/DataCardGrid.vue` + `src/components/DataCardGrid.test.ts` — SPA-local copies to delete after import switch
- `src/components/MarkdownEditor.vue` + `src/components/MarkdownEditor.test.ts` — SPA-local copies to delete after import switch
- `src/pages/EncounterEditPage.vue` — local `DataCardGrid` + `MarkdownEditor` (Summary, Transcript, Mentor Notes with `modelValue` / `@update:model-value` / `@blur`)
- `src/pages/MenteeEditPage.vue` — local `DataCardGrid` + `MarkdownEditor` (Notes via `field="notes"` inside DataCard context)

**External prerequisite**: F160 shipped — `@mentor-forge/mentorhub_spa_utils@1.0.6` resolved in this repo.

**Out of scope**: Cypress edit-mode activation / packaging (F162). Do not reintroduce list card dashboards or package `CardGrid`. Do not add `marked` or `dompurify` as SPA dependencies.

## Goals

- `EncounterEditPage.vue` and `MenteeEditPage.vue` import `DataCardGrid` and `MarkdownEditor` from `@mentor-forge/mentorhub_spa_utils` (same named exports as other typed editors / `DataCard` / `MhCard`).
- No remaining `src/**` import of `@/components/DataCardGrid.vue` or `@/components/MarkdownEditor.vue`.
- Delete SPA-local files:
  - `src/components/DataCardGrid.vue`
  - `src/components/DataCardGrid.test.ts`
  - `src/components/MarkdownEditor.vue`
  - `src/components/MarkdownEditor.test.ts`
  - Any local re-export / demo wiring that duplicated them (grep before finishing; none expected beyond the pages above).
- Package `DataCardGrid` usage stays multi-card view/edit only: root class `data-card-grid`, hardcoded `data-automation-id="data-card-grid"`, no props. Do not turn it into a list dashboard or Fragment flattener.
- Package `MarkdownEditor` keeps the same prop surface. Detail/edit bindings continue to work:
  - DataCard-bound fields (`field` + context `onSave`) on mentee notes, encounter summary/transcript.
  - Standalone Mentor Notes on encounter detail (`modelValue` + update/blur or `onSave` as the package supports — prefer the package’s documented props; do not fork a local wrapper).
- Resting view is sanitized rendered markdown from spa_utils. Editable fields enter the textarea on click or Enter; textarea automation id is `${automationId}-input`.
- Remove `marked`, `dompurify`, and `@types/dompurify` from `package.json` / lockfile when nothing in this SPA imports them after the harvest. Do **not** add them back.
- `README.md` states that `DataCardGrid` and `MarkdownEditor` come from spa_utils **1.0.6** and that this SPA no longer keeps parallel local copies.
- Unit suite stays green: delete obsolete local component tests; do not re-vendor spa_utils editor tests into this repo. Do not lower coverage thresholds. **`npm run test:coverage` is waived for this task** (developer decision); the pre-existing component function-threshold miss is **F163**. Record the coverage result; do not block on it.

### Craftsmanship Expectations

- Reuse `mentorhub_spa_utils` for shared SPA behavior rather than creating local equivalents.
- Treat DRY as avoiding duplicated ownership: one shared `DataCardGrid` and `MarkdownEditor` in spa_utils — no parallel local copies after this task.
- Keep journey-specific page composition in this SPA; do not grow a Mentor-only markdown wrapper around the package editor.
- Prefer deleting obsolete local behavior when responsibility has moved to spa_utils. Do not introduce local `marked` / `dompurify` workarounds.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` if needed, then `npm install --include=dev` after dependency removals
- `npm ls @mentor-forge/mentorhub_spa_utils` — still **1.0.6**
- Confirm `marked` / `dompurify` are **not** direct dependencies of this SPA (`npm ls marked dompurify` should not list them as this package’s dependencies; transitive via spa_utils is fine if present)
- `npm run test` — full Vitest suite (local DataCardGrid / MarkdownEditor tests gone; pages/composables still pass)
- `npm run test:coverage` — **waived** (developer decision). Record the result. Do not change `vitest.config.ts` thresholds. **F163** restores the gate after this harvest.
- `npm run build` — `vue-tsc` clean

Do **not** run `npm run cypress:run` in this task. Specs that type into markdown without activating display mode are F162.

Packaging is **F162**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `src/pages/EncounterEditPage.vue` — import `DataCardGrid` + `MarkdownEditor` from spa_utils; keep existing automation ids and detail/edit behavior
- `src/pages/MenteeEditPage.vue` — same import switch
- `package.json` / `package-lock.json` — remove direct `marked`, `dompurify`, `@types/dompurify` when unused
- `README.md` — package ownership of `DataCardGrid` / `MarkdownEditor`; no local parallel copies

**Delete:**

- `src/components/DataCardGrid.vue`
- `src/components/DataCardGrid.test.ts`
- `src/components/MarkdownEditor.vue`
- `src/components/MarkdownEditor.test.ts`

Touch other `src/**` only if a leftover re-export or import fails compile. Do not change Cypress specs here. Do not change the spa_utils pin. Do not add list dashboards. Do not add `marked` / `dompurify` as SPA dependencies.

## Execution Notes

### Planned approach

1. Add `DataCardGrid` and `MarkdownEditor` to the existing `@mentor-forge/mentorhub_spa_utils` import blocks in `EncounterEditPage.vue` and `MenteeEditPage.vue`; remove `@/components/…` imports. Leave template bindings, automation ids, and props unchanged.
2. Delete SPA-local `DataCardGrid` / `MarkdownEditor` `.vue` and `.test.ts` files; grep `src/**` to confirm no leftover imports.
3. Remove direct `marked`, `dompurify`, and `@types/dompurify` from `package.json`; run `mh` + `npm install --include=dev` to refresh the lockfile.
4. Update `README.md` ownership text: package owns `DataCardGrid` / `MarkdownEditor`; no parallel local copies.
5. Run test suite, coverage (record only — waived), and build; do not change `vitest.config.ts` or run Cypress.

### Summary

Harvest complete: encounter and mentee edit pages consume package `DataCardGrid` and `MarkdownEditor` from spa_utils **1.0.6**; local duplicates and their unit tests removed; SPA no longer lists `marked` / `dompurify` as direct dependencies (transitive via spa_utils only). README reflects package ownership.

### Files changed

**Updated:** `src/pages/EncounterEditPage.vue`, `src/pages/MenteeEditPage.vue`, `package.json`, `package-lock.json`, `README.md`

**Deleted:** `src/components/DataCardGrid.vue`, `src/components/DataCardGrid.test.ts`, `src/components/MarkdownEditor.vue`, `src/components/MarkdownEditor.test.ts`

### Command results

| Command | Result |
|---------|--------|
| `mh` | CodeArtifact auth refreshed |
| `npm install --include=dev` | exit 0 (removed direct marked/dompurify deps) |
| `npm ls @mentor-forge/mentorhub_spa_utils` | `@mentor-forge/mentorhub_spa_utils@1.0.6` |
| `npm ls marked dompurify` | Only under `@mentor-forge/mentorhub_spa_utils@1.0.6` (transitive); not direct SPA deps |
| `npm run test` | exit 0 — 16 files, 121 tests passed |
| `npm run test:coverage` | exit 1 (waived) — all tests passed; **ERROR:** `src/components/**` functions **78.37%** vs threshold **90%** (F163) |
| `npm run build` | exit 0 — `vue-tsc` + Vite build clean |
