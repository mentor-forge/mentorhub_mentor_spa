# R111 – ProfileEditPage tests and documentation

**Status**: Pending  
**Type**: Feature  
**Depends On**: R108, R109, R110  
**Description**: Update unit tests, Cypress E2E, and README for the ProfileEditPage workflow (Profile, Notes, Encounters). Final verification task for the feature.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `cypress/e2e/profile.cy.ts`
- `src/api/Profile.client.test.ts` — R106 may already cover client; extend if needed
- `tasks/PENDING.R106.profile_detail_types_and_mentee_client.md` through `R110`

**Out of scope**

- Properties hub routes, `getProfileProperties`, or Cypress assertions for Properties UI.

## Goals

- Cypress `profile.cy.ts` updated:
  - Card click → ProfileEditPage (`profile-edit-heading` visible, not "View Profile")
  - **Profile**, **Notes**, and **Encounters** sections visible
  - **New Encounter** button visible and navigates with `menteeId` query param
  - Dashboard still has no **New Profile** button
  - No **Properties** button on dashboard or detail page
- `README.md` documents:
  - Route `/profiles/:id` → `ProfileEditPage`
  - `GET /api/profile/{id}` composite `ProfileDetail`
  - `PATCH /api/mentee/{mentee_id}` for Notes blur-to-save
  - E2E test commands
- All unit tests pass.
- Full packaging + E2E pass against containerized runtime.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **E2E tests** (dev runtime)
  - `npm run api`
  - `npm run dev`
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run` — full suite against packaged runtime

## Outputs

- `cypress/e2e/profile.cy.ts` — ProfileEditPage flow assertions
- `README.md` — Mentor Dashboard and Profile Edit section (routes, client methods, test commands)

The agent must not update files outside this list unless a prior task left `Profile.client.test.ts` incomplete; if so, note in Execution Notes and limit to test fixes required for green CI.

## Execution Notes

_Reserved for the task execution agent._
