# R162 – Encounter detail: editable only while status is in-progress

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: On Encounter Detail, Transcript, Summary, and TLDR (and all other encounter/mentee fields on the page) are writable only when the encounter is in the in-progress status from OpenAPI (today that wire value is `active`). Any other status makes the page read-only. Do not add Start/End/Summarize buttons here (R164 / R165).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md` — Encounter Detail
- `../mentorhub_spa_utils/README.md` — typed editors `editable` prop (read-only uses `-display` automation suffix per spa_standards)
- `src/pages/EncounterEditPage.vue` — currently always-editable TLDR/summary/transcript, `EnumEditor` status, checklist checkboxes, mentee notes
- `src/api/types.ts` — Encounter `status`
- `cypress/e2e/encounter.cy.ts` — TLDR input assertions assume a newly created encounter is editable

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Event Detail page `status = active` vs not.

If R160 has already synced a new status enum, use the live in-progress value the API uses for an ongoing encounter (the issue names this `active`). If R160 is still blocked, `active` vs everything else (`archived`, missing) is the contract.

## Goals

- Compute `isEncounterActive` (or equivalent) from `encounter.status` matching the in-progress wire value.
- When active: TLDR, Summary, and Transcript remain typed editors with existing automation ids (`encounter-detail-tldr-input`, `encounter-detail-summary-input`, `encounter-detail-transcript-input`).
- When not active: **all** data on the page is read-only — including checklist checkboxes, mentee notes, date, status, and profile/journey displays. Editors use `editable=false`; checklist toggles are disabled and do not PATCH.
- Do not use the status `EnumEditor` as the way to start or end an encounter. Status may remain visible read-only (or stay an editor only while active if the live spec still allows PATCH status). Prefer read-only status display so R165 can own start/end via mutations.
- Preserve Profile / Checklist / Encounter / Summary / Transcript card structure and existing automation ids on those cards.
- Loading and error handling unchanged.

### Craftsmanship Expectations

- Drive read-only via spa_utils `editable` on typed editors, not a second “view page” component or duplicated markup.
- Do not invent a local permission matrix; status is the issue’s gate. Role checks are not a substitute for status.
- Keep PATCH `updateEncounter` / `updateMentee` behind the active gate so a disabled control cannot still save.
- Do not add summarize or end buttons in this task.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open an `active` encounter: TLDR/summary/transcript save on blur. Open or PATCH an encounter to a non-active status (only if the running API allows it): fields render as display, checklist does not toggle.
- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts` — create-from-profile flow still edits TLDR while the new encounter is active
- **Packaging verification**
  - `npm run container`

If Cypress cannot reach a non-active encounter in this task, document that gap; R166 must cover read-only after End Encounter.

## Outputs

- `src/pages/EncounterEditPage.vue` — status-gated `editable` / disabled checklist
- `cypress/e2e/encounter.cy.ts` — only if selectors or editable vs display ids change
- `README.md` — Encounter Detail documents active = editable, other status = read-only

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
