# R108 – Mentee section page

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R107  
**Description**: Implement the mentee section shown at `/profiles/:id` when a mentor clicks a dashboard card. Display mentee contact and encounter fields; support mentor notes on the latest encounter.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/pages/ProfileWorkspacePage.vue` — parent layout from R107
- `src/api/client.ts` — `getProfile`, `getEncounters`, `updateEncounter`
- `src/api/types.ts` — `Profile`, `Encounter`
- `src/pages/EncountersListPage.vue` — patterns for encounter list/display
- `../mentorhub_mentor_api/docs/openapi.yaml` — Profile and Encounter schemas

**Field notes**

- Show `location` and `phone` when present on Profile; display `—` when absent (fields may not exist in Mongo yet).
- Profile is read-only (no PATCH in mentor API).
- Mentor notes map to `Encounter.summary` on the mentee's latest encounter.

## Goals

- New page `ProfileMenteeSectionPage.vue` renders inside the workspace at `/profiles/:id`.
- Display read-only fields: name, status, start date (from profile or journey if available), location, employer/job title (from experience if available), email, phone.
- Show first encounter date and a **New encounter** button that navigates to encounter create with mentee context (R110 wires `?menteeId=`).
- Show **Mentor notes** using `AutoSaveField` (or equivalent) on the latest encounter for this mentee; filter `GET /api/encounter` client-side by `mentee_id`.
- If no encounters exist, notes area explains that notes require an encounter (or offer create encounter).
- All interactive elements use `data-automation-id` per spa_standards (e.g. `mentee-section-heading`, `mentee-profile-name`, `mentee-new-encounter-button`).
- Dashboard (`ProfilesListPage.vue`) is unchanged.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Mentor login → dashboard card → mentee section shows fields
  - Save mentor notes on an existing encounter; refresh and confirm persistence

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/ProfileMenteeSectionPage.vue` — **new** mentee section child page

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._

Implemented and verified: aligned with mentor API ProfileDetail composite and restored properties endpoint.
