# X1001 – Plan pages tests and documentation

**Status**: Shipped  
**Type**: Feature  
**Depends On**: X1000  
**Description**: Finalize test coverage and README documentation for Plan List and Plan Detail features.

## Goals

- `cypress/e2e/plan.cy.ts` covers full Plan workflow including card click, step count, dialog cancel.
- `README.md` includes Plans section (routes, API, E2E spec).
- `Plan.client.test.ts` mocks include `steps` field.

## Outputs

- `cypress/e2e/plan.cy.ts`
- `README.md`
- `src/api/Plan.client.test.ts`

## Execution Notes

- Extended `plan.cy.ts` to 9 specs: cards, dialog create, step count on card, card navigation, dialog cancel, legacy route, steps add/delete, update+search, search.
- Added **Encounter Plans** section to `README.md`.
- Updated `Plan.client.test.ts` fixtures with `steps` array.
- `npm run test`: 80/80 passed.
- `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts` **not executed** — Cypress 15.16.0 fails to start in this WSL environment (`bad option: --no-sandbox` on verify). Re-run locally after `npx cypress install` or in CI/container.
