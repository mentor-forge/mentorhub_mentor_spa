# R165 – End Encounter and Summarize on Transcript

**Status**: Pending  
**Type**: Feature  
**Depends On**: R160_sync_encounter_workflow_api_client, R162_encounter_detail_active_readonly  
**Description**: On Encounter Detail while in-progress: **Summarize** on the Transcript card (summarize mutation) and **End Encounter** (end/finish mutation). After end, refetch so R162 read-only behavior applies.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md` — Encounter Detail
- `../mentorhub_spa_utils/README.md` — `DataCard` / `MhCard` `#actions` slot
- `src/pages/EncounterEditPage.vue` — Transcript `DataCard`; R162 active gate
- `src/api/client.ts` — summarize and end/finish methods from R160
- `cypress/e2e/encounter.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Summarize Button on Transcript; End Encounter.

LLM prompt/host configuration is mentor API work ([E-RA: LLM Summarization](https://github.com/mentor-forge/mentorhub_mentor_api/issues/25)), not this SPA. The SPA only invokes the summarize operation and refreshes fields.

## Goals

- **Summarize** (`data-automation-id="encounter-detail-summarize-button"`) on the Transcript card actions (or adjacent to the transcript editor). Visible/enabled only when the encounter is in-progress **and** transcript has content if the live spec requires it. Calls the R160 summarize method. On success, invalidate `['encounter', id]` (and profile if TLDR/summary change). Button shows loading; errors via `useErrorHandler`.
- **End Encounter** (`data-automation-id="encounter-detail-end-button"`) on the page while in-progress. Calls the R160 end/finish method (not PATCH `status: archived` unless that is the only operation the spec defines). On success, refetch encounter so status is no longer in-progress and R162 makes every field read-only. Hide End (and Summarize) after end.
- Do not allow Summarize or End when not in-progress (no extra round trip that the UI already knows will 403, unless the API is the only source of truth for status).
- Keep existing autosave of transcript/summary/tldr while still active.

### Craftsmanship Expectations

- Dedicated mutation methods from R160; do not overload `updateEncounter` if OpenAPI defines distinct operations.
- Reuse Vue Query invalidation already used for encounter PATCH.
- Do not add a local LLM client, prompt, or Ollama URL.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - Client methods already tested in R160; add page-level tests only if logic is extracted
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Active encounter: Summarize refreshes summary/tldr when the API returns them; End then shows read-only editors
- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`
  - Cover End → read-only (intercept end mutation if the backend end path is slow or environment-dependent)
  - Cover Summarize at least via intercept (do not fail the suite on LLM latency); assert the SPA called the summarize URL and refreshed
- **Packaging verification**
  - `npm run container`

Least-privileged: mentor owner can end; do not add an admin-only gate unless OpenAPI/security descriptions require it. Do not use admin as the only Cypress identity for this flow.

## Outputs

- `src/pages/EncounterEditPage.vue` — Summarize + End Encounter
- `cypress/e2e/encounter.cy.ts` — summarize intercept, end then read-only
- `README.md` — summarize and end workflow

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
