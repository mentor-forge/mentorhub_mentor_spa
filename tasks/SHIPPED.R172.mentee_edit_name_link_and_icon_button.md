# R172 – MenteeEditPage: Name Link and Icon Start Encounter Button

**Status**: Pending  
**Type**: Feature  
**Depends On**: R171  
**Description**: Update the Mentee name in the card title bar to be a link to the customer profile page, and replace the labeled Start Encounter button with an icon-only button.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`

Additional input files:

- `src/pages/MenteeEditPage.vue` (renamed in R171)
- `cypress/e2e/profile.cy.ts`

## Goals

- **Mentee name as a link**: In the Mentee (Profile) data card title bar, wrap the displayed mentee name in an `<a>` element.
  - `href` set to `/customer/profile/{mentee_id}` where `{mentee_id}` is the profile's ID from the route/API.
  - `title="Open Profile"` tooltip.
  - `data-automation-id="mentee-edit-customer-profile-link"`.
  - Style the anchor so it inherits the title bar text colour and has no underline (matching the existing pattern used on `ProfileEditPage` or `EncounterEditPage` for similar links, e.g. `text-white text-decoration-none`).

- **Icon-only Start Encounter button**: Replace the existing labeled `Start Encounter` button with an icon-only `v-btn`:
  - Icon: `mdi-timer-play` (or the closest available watch/timer icon in the current MDI icon set — check `package.json` for the MDI version and confirm the icon name exists).
  - `title="Start Encounter"` tooltip.
  - Keep existing `data-automation-id="profile-edit-start-encounter-button"`.
  - Keep existing click handler (`handleStartEncounter`) and loading/disabled logic unchanged.
  - Remove the button label text and `v-icon start` wrapper — the button renders icon only.

### Craftsmanship Expectations

- Do not change any data fetching, computed properties, or encounter-start logic.
- Do not modify any other section of the page — only the title bar anchor and the Start Encounter button.

## Testing Expectations

- **Unit tests** — `npm run test` — all existing tests pass.

- **Dev verification**
  - `npm run api` + `npm run dev`.
  - Mentee name in the card title bar is a clickable link to `/customer/profile/{id}`.
  - Start Encounter button shows only the icon (no text label).
  - Tooltip `"Start Encounter"` is visible on hover.

- **E2E tests** — `npm run cypress:run` — existing specs pass, then update `cypress/e2e/profile.cy.ts`:
  - Assert `data-automation-id="mentee-edit-customer-profile-link"` is present and `href` includes `/customer/profile/`.
  - Assert `data-automation-id="profile-edit-start-encounter-button"` does **not** contain the text `"Start Encounter"` (icon-only check).

- **Packaging verification**
  - `npm run container` → `npm run service` → `npm run cypress:run`.

## Outputs

- `src/pages/MenteeEditPage.vue` — updated mentee name link and icon-only Start Encounter button.
- `cypress/e2e/profile.cy.ts` — updated assertions for name link and icon button.

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
