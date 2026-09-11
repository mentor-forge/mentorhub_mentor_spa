# R164 – Start Encounter button in Mentee Name card

**Status**: Complete  
**Type**: Feature  
**Depends On**: R160_sync_encounter_workflow_api_client, R161_mentee_page_three_datacards  
**Description**: Implement the Start Encounter button in the Mentee Name card ([mentorhub_mentor_spa#22](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)). The button is visible only when the next scheduled encounter date is today. Clicking it calls `api.startEncounter` and opens the encounter detail page.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `src/pages/ProfileEditPage.vue` — Card 1 (Mentee Name card)
- `src/api/client.ts` — `startEncounter`
- `src/api/types.ts` — `Encounter.status`, `Encounter.appointment`
- `src/router/index.ts` — `/encounter/:id`
- `cypress/e2e/profile.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Start Encounter Button.

## Goals

- In Card 1 (Mentee Name card) of `ProfileEditPage.vue`:
  - Render **Start Encounter** button with `data-automation-id="profile-edit-start-encounter-button"`.
  - **Visibility rule**:
    - Identify encounters for this mentee where `status === 'scheduled'`.
    - Order scheduled encounters chronologically ascending by appointment start (`encounter.appointment?.from || encounter.date || encounter.created?.at_time`).
    - The earliest upcoming scheduled encounter is the `nextScheduledEncounter`.
    - Check whether that encounter's date matches the current calendar date (today): `YYYY-MM-DD` string matching or local date equality.
    - If `nextScheduledEncounter` date is today: show the button.
    - If no scheduled encounters exist or the next scheduled encounter date is NOT today (e.g. tomorrow or next week): hide the button.
  - **Click action**:
    - Show loading state on button during mutation.
    - Call `api.startEncounter(nextScheduledEncounter._id)` (`POST /api/encounter/{id}/start`).
    - On success: navigate to `/encounter/${nextScheduledEncounter._id}` via `router.push`. Invalidate related Vue Query caches (`['profile', profileId]`, `['encounter', id]`).
    - On error: surface error message via `useErrorHandler` and stay on the mentee page.
- Unit tests for date matching helper:
  - Encapsulate date matching in a pure utility helper (e.g. `isEncounterDateToday(dateStr)`).
  - Test helper with: today's date (true), tomorrow's date (false), yesterday's date (false), undefined/empty (false), varied ISO timestamp strings.

### Craftsmanship Expectations

- Place the button directly inside Card 1 (actions slot or header/body) in accordance with the issue specification ("On in Name card").
- Derive the next scheduled encounter cleanly from `profileDetail.encounters` using `status === 'scheduled'`.
- Do not PATCH `status: 'active'` directly — call the dedicated `startEncounter` client method from R160.
- Unit test the date comparison logic thoroughly.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - Unit test date matching helper
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - When mentee has a scheduled encounter today: Start Encounter button appears in Name card.
  - Clicking Start Encounter transitions encounter to active and opens `/encounter/{id}`.
  - When mentee has encounters scheduled only in the future: Start Encounter button is hidden.
- **E2E tests**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - Assert Start Encounter button visibility when encounter is scheduled for today.
  - Assert Start Encounter button absence when next encounter is not today.
  - Assert clicking Start Encounter calls start mutation and navigates to `/mentor/encounter/:id`.
- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/ProfileEditPage.vue` — Start Encounter button and start mutation wiring
- `src/utils/date.ts` (or helper module) — `isEncounterDateToday` helper function
- `src/utils/date.test.ts` (or helper test module) — unit tests for date helper
- `cypress/e2e/profile.cy.ts` — E2E tests for Start Encounter button
- `README.md` — document Start Encounter button rules

The agent must not update files outside this list.

## Execution Notes

- Created pure date utilities in `src/utils/date.ts` (`isEncounterDateToday`, `getNextScheduledEncounter`).
- Added comprehensive unit tests in `src/utils/date.test.ts` covering date formats, edge cases, and appointment timestamp fallbacks.
- Updated `ProfileEditPage.vue` to display the `Start Encounter` button (`data-automation-id="profile-edit-start-encounter-button"`) in Card 1 when the next scheduled encounter date is today.
- Wired the button click to invoke `api.startEncounter(id)` via Vue Query mutation, invalidate cache, and navigate to `/encounter/${id}`.
- Added E2E tests in `cypress/e2e/profile.cy.ts` asserting visibility when an encounter is scheduled for today, absence when the encounter is in the future, and navigation upon click.
- Updated `README.md` documenting Start Encounter button visibility rules and API client methods.
- Verified unit tests (`npm run test`) and production build (`npm run build`).
