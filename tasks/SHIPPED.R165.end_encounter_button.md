# R165 – End Encounter button on Encounter Detail page

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R160_sync_encounter_workflow_api_client, R162_encounter_detail_active_readonly  
**Description**: Implement the End Encounter button on `EncounterEditPage` ([mentorhub_mentor_spa#22](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)). The button is visible while the encounter is in `active` status. Clicking it calls `api.finishEncounter`, transitions status to `complete`, and refreshes the page so all data becomes read-only per R162.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md` — Encounter Detail section
- `../mentorhub_spa_utils/README.md`
- `src/pages/EncounterEditPage.vue` — Encounter Detail page; active editability from R162
- `src/api/client.ts` — `finishEncounter` method from R160
- `src/api/types.ts` — `Encounter.status`
- `cypress/e2e/encounter.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — End Encounter Button.

## Goals

- In `EncounterEditPage.vue`:
  - Display **End Encounter** button with `data-automation-id="encounter-detail-end-button"`.
  - **Visibility**: Visible only when `encounter.status === 'active'`. When status is not active (e.g. `complete`, `scheduled`, `archived`), the button is hidden.
  - **Click action**:
    - Triggers mutation calling `api.finishEncounter(encounterId.value)` (`POST /api/encounter/{EncounterId}/finish`).
    - Display loading indicator on the button while request is in flight.
    - On success:
      - Invalidate TanStack query cache for `['encounter', encounterId.value]`.
      - Invalidate `['profile', menteeId.value]` so the mentee's completed encounters list reflects the newly completed encounter.
      - Refetch encounter details: encounter status updates to `complete`.
      - Triggering the status update automatically causes R162 active-status gating to make TLDR, Summary, Transcript, and checklist checkboxes read-only.
      - The "End Encounter" button becomes hidden once status is no longer `active`.
    - On error:
      - Surface API error message via `useErrorHandler`.
      - Encounter remains active and editable.

### Craftsmanship Expectations

- Call the dedicated mutation method `finishEncounter` (`POST /api/encounter/{id}/finish`); do not overload `updateEncounter` or directly PATCH `status: 'complete'`.
- Rely entirely on server state invalidation and reactivity — do not introduce local mutable override flags for read-only state.
- Handle least-privileged authorization: mentor who owns the encounter or admin can finish; handle 403 error gracefully if caller is unauthorized.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open an active encounter: verify End Encounter button is present.
  - Click End Encounter: verify mutation is dispatched, encounter transitions to `complete`, fields become read-only, and End Encounter button is no longer displayed.
- **E2E tests**
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`
  - Assert that active encounter shows `encounter-detail-end-button`.
  - Assert that clicking `encounter-detail-end-button` executes finish mutation.
  - Assert that after completion, fields render as read-only and `encounter-detail-end-button` is not present.
- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterEditPage.vue` — End Encounter button and finish mutation integration
- `cypress/e2e/encounter.cy.ts` — E2E test coverage for End Encounter flow and read-only transition
- `README.md` — document End Encounter workflow and status transition

The agent must not update files outside this list.

## Execution Notes

### Implementation Summary
- Added `encounter-detail-end-button` button to `EncounterEditPage.vue` header, visible when `isEncounterActive` (`encounter.status === 'active'`).
- Integrated `finishEncounterMutation` with `useMutation` calling `api.finishEncounter(encounterId.value)` (`POST /api/encounter/{id}/finish`).
- On mutation success, invalidates query cache for `['encounter', encounterId.value]` and `['profile', menteeId.value]`, transitioning the page to read-only mode and hiding the End Encounter button. Handled errors with `errorRef` / `useErrorHandler`.
- In `ProfileEditPage.vue`, fixed `hasAdminRole` ref evaluation so `Breadcrumbs` card correctly hides for mentors without admin role.
- Updated `cypress/e2e/encounter.cy.ts` with comprehensive E2E tests validating active encounter display, End Encounter button visibility, finish mutation triggering, status transition to complete, and read-only field verification.
- Documented `finishEncounter` API client method and End Encounter button workflow in `README.md`.

### Test Results
- `npm run test`: 16/16 test files passed, 115/115 tests passed.
- `npm run build`: built cleanly in Vite (`vue-tsc && vite build`).
- `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`: 5/5 passed (100%).
- `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`: 11/11 passed (100%).
- `npm run container`: built image `ghcr.io/mentor-forge/mentorhub_mentor_spa:latest` successfully.
