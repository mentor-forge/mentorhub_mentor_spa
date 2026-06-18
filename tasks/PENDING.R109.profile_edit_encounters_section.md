# R109 – Encounters section and New Encounter button

**Status**: Pending  
**Type**: Feature  
**Depends On**: R108  
**Description**: Add the read-only **Encounters** section to `ProfileEditPage` and a **New Encounter** button that navigates to `EncounterNewPage` with mentee context. Encounter list comes from `ProfileDetail.encounters` (no separate encounter fetch).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/pages/ProfileEditPage.vue` — page from R107/R108
- `src/pages/EncountersListPage.vue` — display patterns for encounter rows
- `src/router/index.ts` — `EncounterNew` route
- `tasks/PENDING.R110.encounter_new_mentee_context.md`

## Goals

- **Encounters section** (read-only): list encounters from `profileDetail.encounters` (date, tldr, summary, status). Use `formatDate` from spa_utils. Empty state when no encounters.
- Show first encounter date when encounters exist (optional summary line above the list).
- **New Encounter** button navigates to `/encounters/new?menteeId={profileId}` where `profileId` is the route param (mentee Profile `_id`).
- Encounters are not editable on this page (no row navigation to edit required, but may link to `/encounters/:id` if consistent with list pages).
- Section heading **Encounters** with `data-automation-id="profile-edit-encounters-section"` and `profile-edit-new-encounter-button` on the button.
- No Properties button, no nested routes, no `/properties` path.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - ProfileEditPage shows encounter list for mentees with encounters
  - **New Encounter** navigates to `/encounters/new?menteeId=...`

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/ProfileEditPage.vue` — Encounters section and New Encounter button

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
