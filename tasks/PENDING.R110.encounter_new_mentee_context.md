# R110 – Encounter create with mentee context

**Status**: Pending  
**Type**: Feature  
**Depends On**: R109  
**Description**: When a mentor starts a new encounter from ProfileEditPage, pre-fill `mentee_id` from the route query so the encounter is linked to the correct mentee.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/pages/ProfileEditPage.vue` — **New Encounter** button (R109)
- `src/pages/EncounterNewPage.vue`
- `src/router/index.ts` — encounter create route
- `src/api/types.ts` — `EncounterInput`

## Goals

- **New Encounter** on ProfileEditPage navigates to `/encounters/new?menteeId={profileId}`.
- `EncounterNewPage.vue` reads `menteeId` from the route query on mount and sets `form.mentee_id`.
- On submit, `POST /api/encounter` includes `mentee_id` when present.
- After successful create, user can return to ProfileEditPage and see the new encounter in the Encounters section.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - From ProfileEditPage, click **New Encounter** → form has mentee pre-filled → create succeeds

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterNewPage.vue` — read `menteeId` query param; include `mentee_id` in create payload
- `src/pages/ProfileEditPage.vue` — **only if** navigation URL is not already wired in R109; otherwise no change

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
