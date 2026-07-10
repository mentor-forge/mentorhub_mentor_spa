# R122 – ProfileEditPage New Encounter with plan prompt

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R121  
**Description**: Replace the Profile Detail **New Encounter** navigation to `/encounters/new` with a plan-selection dialog that creates an encounter via `POST /api/encounter` and navigates directly to the Encounter Detail page.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/pages/ProfileEditPage.vue` — **New Encounter** button (currently links to `/encounters/new?menteeId=...`)
- `src/components/dashboard/PlanSelectDialog.vue` — from R121
- `src/api/client.ts` — `createEncounter`, `getProfile`
- `../mentorhub_mentor_api/docs/openapi.yaml` — `EncounterInput` (`mentor_id`, `mentee_id`, `plan_id`, `date`)

## Goals

- **New Encounter** button opens `PlanSelectDialog` instead of routing to `/encounters/new`
- On plan selection, create encounter with:
  - `mentee_id` = mentee Profile `_id` (route param `profileId` on ProfileEditPage)
  - `mentor_id` = `profileDetail.profile.mentor_id` (mentor Profile `_id` assigned to this mentee)
  - `plan_id` = selected plan `_id`
  - `date` = current timestamp (ISO-8601)
  - `status` = `active`
- If `mentor_id` is missing on the profile, show an error snackbar and do not create
- On successful `POST /api/encounter`, invalidate `['profile', profileId]` and `['encounters']`, then navigate to `/encounters/{newId}`
- Preserve `data-automation-id="profile-edit-new-encounter-button"`
- Dialog uses automation ID prefix `profile-edit-new-encounter-plan` (e.g. `profile-edit-new-encounter-plan-submit-button`)
- Show loading state on dialog while create is in flight; disable double-submit

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - From ProfileEditPage, click **New Encounter** → plan dialog appears → select plan → lands on `/encounters/{id}` (detail page may still be stub until R123+)

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/ProfileEditPage.vue` — plan dialog, create-on-select, navigation to encounter detail

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._

- Plan dialog creates encounter with required mentor_id, mentee_id, plan_id; server auto-fills agenda.
- `npm run test`: 83/83 passed.
