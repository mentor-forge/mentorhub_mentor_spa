# R163 – Schedule Encounters button and dialog

**Status**: Pending  
**Type**: Feature  
**Depends On**: R160_sync_encounter_workflow_api_client, R161_mentee_page_three_datacards  
**Description**: Implement the Schedule Encounters button and dialog ([mentorhub_mentor_spa#22](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)). Replace the legacy New Encounter plan dialog with a dedicated Schedule Encounters dialog collecting Plan, Day, Time, Start Date, and Count, calling `api.scheduleEncounters`, and refreshing the mentee page.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `src/pages/ProfileEditPage.vue` — Encounters card actions; replace `PlanSelectDialog`
- `src/components/dashboard/ScheduleEncountersDialog.vue` — new dialog component
- `src/components/dashboard/PlanSelectDialog.vue` — retire / remove
- `src/components/dashboard/index.ts`
- `src/api/client.ts` / `src/api/types.ts` — `scheduleEncounters`, `ScheduleEncounterInput`
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — A Schedule Encounters button.

## Goals

- In `ProfileEditPage.vue`:
  - Show **Schedule Encounters** button in the Encounters card actions (`data-automation-id="profile-edit-schedule-encounters-button"`).
  - Remove the legacy "New Encounter" button and `PlanSelectDialog` integration.
- Implement `src/components/dashboard/ScheduleEncountersDialog.vue`:
  - Dialog root automation ID: `data-automation-id="profile-edit-schedule-encounters-dialog"`.
  - Collects:
    - **Plan**: select dropdown loaded from `api.getPlans()` (`data-automation-id="schedule-encounters-plan-select"`).
    - **Day**: day of week (Sunday=0 to Saturday=6, `data-automation-id="schedule-encounters-day-select"`).
    - **Time**: meeting time of day (24-hour `HH:MM`, `data-automation-id="schedule-encounters-time-input"`).
    - **Start**: schedule start date (`YYYY-MM-DD`, `data-automation-id="schedule-encounters-start-date-input"`).
    - **Count**: number of encounters to schedule (integer 1–52, `data-automation-id="schedule-encounters-count-input"`).
  - Validation: submit button (`data-automation-id="schedule-encounters-submit-button"`) disabled until all required fields are valid; cancel button (`data-automation-id="schedule-encounters-cancel-button"`).
- Wiring on `ProfileEditPage.vue`:
  - Mutation calls `api.scheduleEncounters({ mentor_id, mentee_id, plan_id, start_date, day_of_week, time_of_day, recurrence_days: 7, count })`.
  - On success: close dialog and invalidate `['profile', profileId]`.
  - On error: keep dialog open and present API error via `useErrorHandler`.
- Delete `src/components/dashboard/PlanSelectDialog.vue` and update exports in `src/components/dashboard/index.ts`.
- Update Cypress tests in `cypress/e2e/profile.cy.ts` and `cypress/e2e/encounter.cy.ts` to use the Schedule Encounters flow.

### Craftsmanship Expectations

- Use Vuetify dialog/form primitives with consistent `density="comfortable"` and `variant="outlined"` controls.
- Default `recurrence_days` to 7 per OpenAPI specification.
- Cleanly delete obsolete `PlanSelectDialog` code and references.
- Handle edge cases gracefully: mentor not assigned, API failure, network timeout.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open mentee page: click Schedule Encounters, select plan, day, time, start date, count, and submit. Verify encounters are created and mentee query refreshes.
- **E2E tests**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - Verify Schedule Encounters button opens dialog.
  - Verify submitting valid inputs calls schedule endpoint and updates state.
  - Verify invalid form blocks submission.
- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/ProfileEditPage.vue` — Schedule Encounters button, dialog integration, removal of New Encounter
- `src/components/dashboard/ScheduleEncountersDialog.vue` — new schedule dialog component
- `src/components/dashboard/index.ts` — export `ScheduleEncountersDialog`, remove `PlanSelectDialog`
- `src/components/dashboard/PlanSelectDialog.vue` — delete obsolete component
- `cypress/e2e/profile.cy.ts` — updated for schedule dialog
- `cypress/e2e/encounter.cy.ts` — create flow updated to not rely on retired dialog
- `README.md` — document Schedule Encounters flow

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
