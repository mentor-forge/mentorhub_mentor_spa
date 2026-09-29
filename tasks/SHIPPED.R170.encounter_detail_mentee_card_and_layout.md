# R170 – Encounter Detail: Mentee Card Content, Layout, and Collapsed Defaults

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R167, R168, R169  
**Description**: Clean up the Mentee data card content (Mentor Notes only, via `MarkdownSentenceField`), wrap all DataCards in `DataCardGrid`, and set per-mode default collapsed states. Requires R167 (`MarkdownSentenceField`), R168 (`DataCardGrid`), and R169 (header/buttons) to be shipped first.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`

Additional input files:

- `src/pages/EncounterEditPage.vue`
- `src/components/MarkdownSentenceField.vue` (created in R167)
- `src/components/DataCardGrid.vue` (created in R168)
- `cypress/e2e/encounter.cy.ts`

## Goals

- **Mentee data card — content cleanup**: Remove all Profile data sections (Goals, Interests chips) and all Journey data sections from the Mentee (Profile) `DataCard`. The card body should contain **only** the Mentor Notes field.

- **Mentor Notes field**: Render the Mentor Notes using `MarkdownSentenceField` (from R167) in place of any existing plain `<textarea>` or `AutoSaveField` text input used for notes. Pass `readonly` based on whether the encounter is active.

- **DataCardGrid layout**: Wrap all `DataCard` components on the page in a single `<DataCardGrid>` (from R168), replacing the existing `v-row`/`v-col` outer layout.

- **Default collapsed states**:
  - In **edit mode** (encounter is active): the Encounter card and Summary card must start with `collapsed = true`.
  - In **display mode** (encounter ended / read-only): the Checklist card, Summary card, and Transcript card must start with `collapsed = true`.
  - Profile/Mentee card is open by default in both modes.

### Craftsmanship Expectations

- Do not leave any Goals, Interests, or Journey data markup in the Mentee card — remove it entirely.
- Drive collapsed defaults through the reactive state initialised from `isEncounterActive` (or equivalent computed). Do not hard-code `true`/`false` outside of that conditional.
- Do not duplicate `MarkdownSentenceField` logic locally; import the component created in R167.

## Testing Expectations

- **Unit tests** — `npm run test`
  - Update or add to the `EncounterEditPage` unit tests (if any) to assert:
    - Mentee card does not render goals or interests elements.
    - Collapsed state of Encounter and Summary cards is `true` when `isEncounterActive = true`.
    - Collapsed state of Checklist, Summary, Transcript cards is `true` when `isEncounterActive = false`.
  - All existing tests pass.

- **Dev verification**
  - `npm run api` + `npm run dev`.
  - Mentee card shows only Mentor Notes; no Goals/Interests chips visible.
  - Encounter and Summary cards are collapsed by default during an active encounter.
  - Checklist, Summary, Transcript collapsed by default on a finished encounter.
  - DataCards render in a responsive two-column grid at laptop width.

- **E2E tests** — `npm run cypress:run` — existing specs pass, then update `cypress/e2e/encounter.cy.ts`:
  - Assert Mentee card does not contain `data-automation-id="encounter-detail-profile-goals"`.
  - Assert Encounter card is collapsed on page load for an active encounter.

- **Packaging verification**
  - `npm run container` → `npm run service` → `npm run cypress:run`.

## Outputs

- `src/pages/EncounterEditPage.vue` — Mentee card cleanup, `DataCardGrid` layout, collapsed defaults, `MarkdownSentenceField` for notes.
- `cypress/e2e/encounter.cy.ts` — assertions for cleaned-up Mentee card and collapsed defaults.

The agent must not update files outside this list.

## Execution Notes

- **Planned Approach**:
  - In `src/pages/EncounterEditPage.vue`:
    - Remove Goals, Interests, and Journey Data sections from Mentee card.
    - Keep only `MarkdownSentenceField` (imported from `src/components/MarkdownSentenceField.vue`) for Mentor Notes, passing `:readonly="!isEncounterActive"`.
    - Import `DataCardGrid` from `src/components/DataCardGrid.vue` and wrap all DataCards / MhCard in `<DataCardGrid>`. Remove outer `v-row` / `v-col cols="12"` wrappers.
    - Introduce reactive collapsed state driven by `isEncounterActive`:
      - Active (edit mode): Encounter and Summary collapsed (`encounterCollapsed = true`, `summaryCollapsed = true`), Checklist open (`checklistCollapsed = false`), Mentee open (`profileCollapsed = false`).
      - Ended (display mode): Checklist, Summary, Transcript collapsed (`checklistCollapsed = true`, `summaryCollapsed = true`, `transcriptCollapsed = true`), Mentee open (`profileCollapsed = false`), Encounter open (`encounterCollapsed = false`).
    - Bind `v-model:collapsed="encounterCollapsed"` on Encounter DataCard.
  - In `cypress/e2e/encounter.cy.ts`:
    - Assert `[data-automation-id="encounter-detail-profile-goals"]` does not exist.
    - Assert `[data-automation-id="encounter-detail-encounter-section"]` is collapsed (`have.class`, `mh-card--collapsed`).
    - Expand Encounter card in test 2 before interacting with TLDR input.
  - Verify with unit tests, build, and type checking.

- **Implementation Summary**:
  - Replaced the outer `v-row` layout with `<DataCardGrid>` wrapping all DataCards and MhCard.
  - Cleaned up the Mentee card content by removing Goals, Interests, and Journey Data sections, retaining only `MarkdownSentenceField` with debounced auto-save on change.
  - Configured reactive collapsed states driven by `isEncounterActive`: active mode defaults Encounter and Summary collapsed while Checklist is open; inactive mode defaults Checklist, Summary, and Transcript collapsed.
  - Updated `cypress/e2e/encounter.cy.ts` to assert that goals no longer exist, encounter card starts collapsed, and expands on demand.
  - Vitest test suites (123 tests) and `vue-tsc && vite build` passed cleanly.


