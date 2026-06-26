# R114 – Remove orphaned ProfileViewPage

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Housekeeping — remove `ProfileViewPage.vue`, which was replaced by `ProfileEditPage` at `/profiles/:id` in R107 but left on disk. Confirm it is not registered in the router or referenced by tests/docs.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `tasks/SHIPPED.R107.profile_edit_page_route.md` — ProfileView was superseded by ProfileEdit
- `src/router/index.ts` — `/profiles/:id` uses `ProfileEditPage.vue`
- `src/pages/ProfileViewPage.vue` — orphaned file to remove
- `src/pages/ProfileEditPage.vue` — active detail page
- `cypress/e2e/profile.cy.ts`
- `tasks/AS_NEEDED.T999.example_add_fields.md` — references ProfileView; update example to ProfileEditPage if removal breaks task clarity

## Goals

- Confirm `ProfileViewPage.vue` is not imported or routed anywhere in the SPA.
- Delete `src/pages/ProfileViewPage.vue`.
- No functional change to `/profiles` dashboard or `/profiles/:id` edit flow.
- `npm run build` and tests pass after removal.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Dashboard at `/profiles` loads mentee cards
  - Profile detail at `/profiles/:id` loads `ProfileEditPage` (not View)

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run build` succeeds (ProfileView was previously required for build — verify it is no longer referenced)
  - `npm run cypress:run` run e2e testing should pass

## Outputs

- `src/pages/ProfileViewPage.vue` — **delete**
The agent must not update files outside this list except to fix build-breaking references discovered during verification (document any such fixes in Execution Notes).

## Execution Notes

_(Reserved for task execution agent.)_
