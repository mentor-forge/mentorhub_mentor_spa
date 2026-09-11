# R162 – Encounter detail: editable when status is active, read-only otherwise

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R160_sync_encounter_workflow_api_client  
**Description**: Enforce the F-RS12 encounter detail editability rule ([mentorhub_mentor_spa#22](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)): when encounter `status === 'active'`, TLDR, Summary, Transcript, and checklist checkboxes are editable. When `status !== 'active'` (e.g. `scheduled`, `complete`, `archived`), all fields on the page become read-only.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md` — Encounter Detail section
- `../mentorhub_spa_utils/README.md` — typed editors `editable` prop behavior (switches to `-display` automation suffix when `editable=false`)
- `src/pages/EncounterEditPage.vue` — currently allows editing regardless of status
- `src/api/types.ts` — `Encounter.status` enum (`active`, `archived`, `complete`, `scheduled`)
- `cypress/e2e/encounter.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Event Detail page.

## Goals

- Compute `isEncounterActive = computed(() => encounter.value?.status === 'active')`.
- When `isEncounterActive` is `true`:
  - TLDR (`SentenceEditor`), Summary (`MarkdownEditor`), and Transcript (`MarkdownEditor`) have `:editable="true"`.
  - Changes save on blur via `api.updateEncounter`.
  - Checklist item checkboxes are enabled and persist toggled state.
  - Mentee notes editor in Profile card is editable.
- When `isEncounterActive` is `false`:
  - TLDR, Summary, and Transcript have `:editable="false"`.
  - Checklist checkboxes are disabled (`:disabled="true"`).
  - Mentee notes editor has `:editable="false"`.
  - Status display has `:editable="false"`.
  - Guard `updateEncounterField` and `toggleAgendaItem` so mutation calls are aborted if the encounter is not active.
- Preserve existing card structure and automation IDs:
  - `encounter-detail-profile-section`, `encounter-detail-checklist-section`, `encounter-detail-encounter-section`, `encounter-detail-summary-section`, `encounter-detail-transcript-section`.
- Loading and error states remain handled via `useErrorHandler`.

### Craftsmanship Expectations

- Drive read-only behavior purely through the `editable` prop on `spa_utils` typed editors and the `:disabled` binding on Vuetify checkboxes. Do not create duplicated read-only templates or separate view pages.
- Enforce the guard in both the UI binding and the mutation handler methods.
- Do not add End Encounter button in this task (reserved for R165).

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open an active encounter: verify fields are editable and save on blur.
  - Open a complete or scheduled encounter: verify fields display as read-only and checkboxes are disabled.
- **E2E tests**
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`
  - Assert that an active encounter permits editing TLDR.
  - Assert that a non-active encounter renders fields in read-only mode with disabled checklist checkboxes.
- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterEditPage.vue` — status-gated editability
- `cypress/e2e/encounter.cy.ts` — coverage for active vs non-active encounter detail
- `README.md` — update Encounter Detail section documenting status-gated editability

The agent must not update files outside this list.

## Execution Notes

- Added `isEncounterActive = computed(() => encounter.value?.status === 'active')` in `EncounterEditPage.vue`.
- Bound `:editable="isEncounterActive"` to TLDR, Summary, Transcript, and Notes editors; marked Date and Status as read-only.
- Disabled checklist checkboxes (`:disabled="!isEncounterActive || isUpdatingAgenda"`), and guarded `updateMenteeField`, `updateEncounterField`, and `toggleAgendaItem` against non-active status mutations.
- Updated `cypress/e2e/encounter.cy.ts` to assert that active encounters permit editing and non-active encounters render read-only with disabled checkboxes.
- Updated `README.md` Encounter Detail documentation.
- Verified tests (108/108 passing) and production build.

