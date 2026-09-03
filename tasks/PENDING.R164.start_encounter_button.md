# R164 – Start Encounter on the Next list row

**Status**: Pending  
**Type**: Feature  
**Depends On**: R160_sync_encounter_workflow_api_client, R161_mentee_page_three_datacards  
**Description**: On the mentee Encounters list, show **Start Encounter** only on the Next row, and only when that encounter is scheduled for now-ish (±30 minutes). The button calls the start-encounter mutation and opens Encounter Detail.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `src/pages/ProfileEditPage.vue` — Next row from R161 (`profile-edit-encounter-next-item`, date links)
- `src/api/client.ts` — start method from R160
- `src/router/index.ts` — `/encounter/:id`
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Start Encounter Button.

R163 may land before or after this task. Do not require the schedule dialog. If an encounter `date` is within the window, Start must work regardless of how the encounter was created.

## Goals

- **Next** encounter is the same row R161 marked (`profile-edit-encounter-next-item`).
- **Start Encounter** (`data-automation-id="profile-edit-start-encounter-button"`) renders only on that row **and** only when `encounter.date` is within ±30 minutes of `Date.now()` (inclusive). If `date` is missing, the button is hidden.
- Other rows never show Start.
- Click calls the R160 start mutation for that encounter id (not a generic PATCH of `status`). On success, `router.push` to `/encounter/{id}`. Invalidate profile/encounter queries as needed.
- Errors stay on the mentee page via `useErrorHandler`; do not navigate on failure.
- Date link from R161 still opens detail without starting.

### Craftsmanship Expectations

- Window math lives in a small named helper (page-local or `src/` util with unit tests). Do not scatter magic `30` in the template.
- Do not duplicate the Next-row sort logic; reuse R161’s ordering.
- Do not start an encounter by PATCHing status if R160 defined a dedicated start operation.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - Helper coverage: inside window, just outside ±30 minutes, missing date
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Confirm Start appears only for Next when the clock is in window; hidden otherwise
- **E2E**
  - Prefer Cypress clock / intercept if wall-clock window is unreliable: intercept start mutation, click Start, assert navigation to `/mentor/encounter/{id}`
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts` as needed
- **Packaging verification**
  - `npm run container`

Include a negative case: Start is absent when Next is outside the 30-minute window (unit test is sufficient if E2E clock control is impractical; still add E2E if `cy.clock` can pin `encounter.date`).

## Outputs

- `src/pages/ProfileEditPage.vue` — Start button + mutation + navigate
- A small helper module only if extracted from the page (list the path if created), plus its `*.test.ts`
- `cypress/e2e/profile.cy.ts` — Start visibility / click path as feasible
- `README.md` — Start Encounter rules (±30 min, Next row only)

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
