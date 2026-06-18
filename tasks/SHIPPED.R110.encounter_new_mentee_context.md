# R110 – Encounter create with mentee context

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R108  
**Description**: When a mentor starts a new encounter from the mentee section, pre-fill `mentee_id` from the route query so the encounter is linked to the correct mentee.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/pages/ProfileMenteeSectionPage.vue` — **New encounter** button (R108)
- `src/pages/EncounterNewPage.vue`
- `src/router/index.ts` — encounter create route
- `src/api/types.ts` — `EncounterInput`

## Goals

- **New encounter** on the mentee section navigates to `/encounters/new?menteeId={profileId}` (or equivalent query param agreed in R108).
- `EncounterNewPage.vue` reads `menteeId` from the route query on mount and sets `form.mentee_id`.
- On submit, `POST /api/encounter` includes `mentee_id` when present.
- After successful create, user can return to mentee section and see the new encounter reflected.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - From mentee section, click **New encounter** → form has mentee pre-filled → create succeeds

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterNewPage.vue` — read `menteeId` query param; include `mentee_id` in create payload
- `src/pages/ProfileMenteeSectionPage.vue` — **only if** navigation URL is not already wired in R108; otherwise no change

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._

Implemented and verified: aligned with mentor API ProfileDetail composite and restored properties endpoint.
