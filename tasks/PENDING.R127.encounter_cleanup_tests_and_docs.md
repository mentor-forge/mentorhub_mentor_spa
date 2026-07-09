# R127 – Remove EncounterNewPage, update routes, E2E, and README

**Status**: Pending  
**Type**: Feature  
**Depends On**: R122, R124, R125, R126  
**Description**: Retire the standalone new-encounter form page now that encounters are created from Profile Detail with a plan prompt. Update routes, list page, Cypress specs, and README to match the Encounter Detail workflow.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/pages/EncounterNewPage.vue` — page to remove
- `src/pages/EncountersListPage.vue` — may reference `/encounters/new`
- `src/pages/EncounterEditPage.vue` — Encounter Detail page (R123–R126)
- `src/pages/ProfileEditPage.vue` — new encounter flow (R122)
- `src/router/index.ts`
- `cypress/e2e/encounter.cy.ts`
- `cypress/e2e/profile.cy.ts`

## Goals

- **Delete** `src/pages/EncounterNewPage.vue`
- **Remove** `/encounters/new` route from `src/router/index.ts`
- **EncountersListPage**: remove **New Encounter** button (encounters are created from Profile Detail); list remains read/navigate-only to `/encounters/:id`
- Update **`cypress/e2e/profile.cy.ts`**:
  - Replace test that navigates to `/encounters/new?menteeId=...` with plan-dialog → create → encounter detail flow
  - Assert URL is `/encounters/{id}` (not `/encounters/new`)
- Update **`cypress/e2e/encounter.cy.ts`**:
  - Remove `/encounters/new` navigation and create-via-form tests
  - Add test: create encounter from ProfileEditPage plan dialog, verify encounter detail heading and TLDR autosave
  - Add test: open existing encounter from profile encounters list → detail page sections visible
  - Keep list page visibility test; remove assertion for `encounter-list-new-button` if button removed
- Update **`README.md`**:
  - Document Encounter Detail page at `/encounters/:id` with section outline
  - Document Profile Detail **New Encounter** → plan dialog → detail page flow
  - Remove references to `/encounters/new` and `EncounterNewPage`
- Remove or update any unit tests referencing `EncounterNewPage` or `/encounters/new`

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/encounters/new` is not a valid route (404 or redirect to list)
  - Full flow: Profile → New Encounter → plan → detail page with all sections

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/EncounterNewPage.vue` — **delete**
- `src/router/index.ts` — remove `/encounters/new` route
- `src/pages/EncountersListPage.vue` — remove New Encounter button
- `cypress/e2e/profile.cy.ts` — update for plan-dialog create flow
- `cypress/e2e/encounter.cy.ts` — rewrite for detail page workflow
- `README.md` — Encounter Detail and create flow documentation
- Any unit test files that reference removed page/route — update as needed (list in Execution Notes)

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
