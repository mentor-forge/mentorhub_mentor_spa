# R113 – Remove Event pages and routes

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Housekeeping — remove all Event UI pages, routes, and Cypress coverage from the mentor SPA. Retain Event API client methods, types, and unit tests for future backend-driven event recording.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/router/index.ts`
- `src/pages/EventsListPage.vue`
- `src/pages/EventNewPage.vue`
- `src/pages/EventViewPage.vue`
- `cypress/e2e/event.cy.ts`
- `src/api/client.ts` — **keep** Event methods (`getEvents`, `getEvent`, `createEvent`)
- `src/api/types.ts` — **keep** `Event`, `EventInput`
- `src/api/Event.client.test.ts` — **keep**

## Goals

- Delete `EventsListPage.vue`, `EventNewPage.vue`, and `EventViewPage.vue`.
- Remove all `/events`, `/events/new`, and `/events/:id` routes from `src/router/index.ts`.
- Delete `cypress/e2e/event.cy.ts`.
- Confirm no remaining imports or links to Event pages elsewhere in the SPA (drawer, README, other specs).
- **Do not** remove Event API client code, types, or `Event.client.test.ts`.
- App builds and tests pass with no dead references to removed pages.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Visit former Event URLs (`/events`, `/events/new`) — should 404 or redirect per router (no Event page components loaded)
  - Navigation drawer has no Event links (already removed in R112)

- **E2E**
  - `npm run cypress:run` — full suite passes without `event.cy.ts`

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EventsListPage.vue` — **delete**
- `src/pages/EventNewPage.vue` — **delete**
- `src/pages/EventViewPage.vue` — **delete**
- `src/router/index.ts` — remove Event route block
- `cypress/e2e/event.cy.ts` — **delete**

The agent must not update files outside this list except to fix build-breaking references discovered during verification (document any such fixes in Execution Notes).

## Execution Notes

_(Reserved for task execution agent.)_
