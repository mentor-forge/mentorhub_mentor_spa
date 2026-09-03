# R163 – Schedule Encounters button and dialog

**Status**: Pending  
**Type**: Feature  
**Depends On**: R160_sync_encounter_workflow_api_client, R161_mentee_page_three_datacards  
**Description**: Replace Profile mentee-page **New Encounter** with **Schedule Encounters**: a dialog for day, time, start, and count that calls the live Create/Schedule Encounters API, then refreshes the encounters list.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `CountEditor`, `DateTimeEditor`, `EnumEditor` / typed editors for dialog fields where they fit
- `src/pages/ProfileEditPage.vue` — Encounters card actions; `PlanSelectDialog` / `createEncounter` to remove or fold in
- `src/components/dashboard/PlanSelectDialog.vue` — current create-one-encounter UX
- `src/components/dashboard/index.ts`
- `src/api/client.ts` / `src/api/types.ts` — methods added in R160
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Schedule Encounters button.

Dialog fields from the issue: **day**, **time**, **start**, **count**. Map them onto the R160 / live OpenAPI request body (mentor API F-RA14 described date, time, recurrence, count). Include `plan_id` (or equivalent) in the dialog **only if** the live schedule schema requires it; otherwise do not keep a separate plan-only create flow.

## Goals

- Encounters card actions show **Schedule Encounters** (`data-automation-id="profile-edit-schedule-encounters-button"`).
- Dialog collects day, time, start, and count (labels matching the issue; wire values matching OpenAPI). Submit calls the R160 schedule/create-many client method. On success: close dialog, invalidate `['profile', profileId]`, remain on the mentee page (do not auto-open a single encounter unless the API returns exactly one id and the spec implies that UX).
- Remove **New Encounter** and the immediate `POST /encounter` + navigate-to-detail flow from this page. Delete `PlanSelectDialog` if nothing else imports it.
- Validation: disable submit until required dialog fields are valid; surface API errors with `useErrorHandler`.
- Automation ids: `profile-edit-schedule-encounters-dialog`, field ids `{prefix}-day`, `-time`, `-start`, `-count`, submit/cancel buttons.
- Do not implement Start Encounter (R164).

### Craftsmanship Expectations

- Prefer spa_utils typed editors inside the dialog when the field types match (count, date-time, enum). Plain Vuetify is acceptable for a compact day+time pair if no editor fits; do not invent a local AutoSave clone.
- Keep the dialog in this SPA (`src/components/...`). Note a spa_utils harvest candidate in Execution Notes only if the same schedule box is clearly reusable.
- Do not PATCH `mentee.schedule` unless the live schedule operation is defined as a mentee update rather than an encounter create. Follow OpenAPI, not the existing `MenteeSchedule` shape, if they disagree.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Schedule a small count; mentee encounters list shows the new rows in Next / recency order from R161
- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts` — replace New Encounter create with schedule-then-open-via-date-link (or start in R164). At least one encounter must still be reachable for detail tests.
- **Packaging verification**
  - `npm run container`

Include a failure-path test (client unit or Cypress intercept) that a failed schedule does not navigate away and shows an error.

## Outputs

- `src/pages/ProfileEditPage.vue` — Schedule button, dialog wiring, New Encounter removed
- `src/components/dashboard/ScheduleEncountersDialog.vue` — new (path may vary under `src/components/`; list the actual path)
- `src/components/dashboard/index.ts` — export the new dialog; drop `PlanSelectDialog` if deleted
- `src/components/dashboard/PlanSelectDialog.vue` — delete if unused
- `cypress/e2e/profile.cy.ts` — schedule dialog instead of New Encounter
- `cypress/e2e/encounter.cy.ts` — create path no longer depends on New Encounter
- `README.md` — Schedule Encounters flow; remove New Encounter / plan-dialog create copy

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
