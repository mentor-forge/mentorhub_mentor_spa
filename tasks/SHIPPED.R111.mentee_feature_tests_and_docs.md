# R111 – Mentee workspace tests and documentation

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R108, R109, R110  
**Description**: Update unit tests, Cypress E2E, and README for the mentee section and Properties hub workflow. Final verification task for the feature.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `cypress/e2e/profile.cy.ts`
- `src/api/Profile.client.test.ts` — R106 may already cover client; extend if needed
- `tasks/PENDING.R106.profile_types_and_properties_client.md` through `R110`

**Prerequisites for full E2E pass**

- `../mentorhub_mentor_api` properties endpoint deployed to the stack used by `npm run api` / `npm run service`.

## Goals

- Cypress `profile.cy.ts` updated:
  - Card click → mentee section (`mentee-section-heading` visible, not "View Profile")
  - **Properties** button visible on mentee section only
  - Properties click → URL `/profiles/:id/properties` and `profile-properties-summary` visible
  - Dashboard still has no **Properties** button and no **New Profile** button
- `README.md` documents routes, API client methods, and E2E flow for mentee section + Properties hub.
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

- `cypress/e2e/profile.cy.ts` — mentee section and Properties flow assertions
- `README.md` — Mentor Dashboard and Mentee Workspace section (routes, client methods, test commands)

The agent must not update files outside this list unless a prior task left `Profile.client.test.ts` incomplete; if so, note in Execution Notes and limit to test fixes required for green CI.

## Execution Notes

_Reserved for the task execution agent._

Implemented and verified: aligned with mentor API ProfileDetail composite and restored properties endpoint.
