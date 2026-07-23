# R140 – Paths and Resources list pages → `CardGrid` + `MhCard`

**Status**: Shipped
**Type**: Feature  
**Depends On**: R135, R137  
**Description**: Convert Paths and Resources list UIs from data-table / infinite-scroll patterns to spa_utils `CardGrid` + `MhCard` dashboards driven by OpenAPI **offset/size** list APIs. Cards show **name** in the title bar and **description** only in the body. Page-level Add buttons. Stop using deprecated `useInfiniteScroll` on these pages.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI cards; fixed `CardGrid` column contract; **Deprecated: infinite-scroll list APIs**
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue` — `#actions` reference
- `src/pages/PathsListPage.vue`
- `src/pages/ResourcesListPage.vue`
- `src/pages/PathNewPage.vue` / `src/pages/ResourceNewPage.vue` — create navigation targets
- `src/api/client.ts` — R137 offset/size list helpers
- `src/composables/useOffsetList.ts` — if created in R137; otherwise create here if load-more is needed
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`
- `cypress/e2e/navigation.cy.ts`

**OpenAPI check:** `npm run api` then `curl -X GET "http://localhost:8391/docs/openapi.yaml"`. Planning-time spec already documents Path/Resource `offset`/`size` headers and `X-Pagination-*` response headers. If that contract regresses, set **Status** to `Blocked`. DELETE was **not** present for Path/Resource — omit delete UI unless the live spec adds it.

## Goals

- **PathsListPage** and **ResourcesListPage** use `CardGrid` + `MhCard` instead of `v-data-table` / deprecated `useInfiniteScroll`.
- Use spa_utils `CardGrid` as shipped. Do **not** pass removed breakpoint props.
- Fetch via R137 client: `offset` / `size` **headers**, plain array body. Prefer `useOffsetList` (or equivalent) for load-more when the first page may not contain all items (`X-Pagination-Returned` / page length === size).
- **Simplified card content:** title = **name**; body = **description only**.
- **Card actions:** open/edit in `#actions` or card click → edit route. Delete only if OpenAPI documents DELETE.
- **Add button:** page-level New Path / New Resource to existing new pages.
- Preserve or introduce stable `data-automation-id`s (`path-list-*`, `resource-list-*`) and update Cypress.
- Keep search via `ListPageSearch` if still valuable; do not reintroduce table chrome.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/paths` and `/resources` show card grids with name + description; Add works; load-more works when more than one page exists

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/path.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/resource.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PathsListPage.vue` — `CardGrid` + `MhCard`; offset/size paging; name + description; Add
- `src/pages/ResourcesListPage.vue` — same; remove `useInfiniteScroll`
- `src/composables/useOffsetList.ts` — create/update if not completed in R137
- `src/api/client.ts` — only if list helpers need a fix beyond R137
- `cypress/e2e/path.cy.ts` — card UI / automation IDs; Add / load-more as applicable
- `cypress/e2e/resource.cy.ts` — card UI / automation IDs; Add / load-more as applicable
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break
- `README.md` — update Paths/Resources list docs if they still describe tables/infinite scroll

The agent must not update files outside this list.

## Execution Notes

- Plan: migrate both list pages to `CardGrid` + `MhCard`, use the existing
  `useOffsetList` helper for header-based offset/size paging and debounced name
  search, preserve Add/edit navigation automation IDs, and update the focused
  Cypress assertions and README documentation.
- Live OpenAPI confirmed `offset` / `size` request headers, plain-array
  responses, and `X-Pagination-*` response headers for both Path and Resource.
  No DELETE operation is documented, so no delete action will be added.
- Implemented responsive Path and Resource card dashboards with description-only
  bodies, edit actions, Add buttons, debounced name search, and explicit
  offset/size Load More controls.
- Verification: `npm run test` (14 files / 92 tests), `npm run build`,
  `npm run container`, Path Cypress (6/6), Resource Cypress (6/6), and
  Navigation Cypress (9/9) passed. The first Navigation run had one transient
  drawer timeout and passed on retry.
- `npm run service` built and started the API dependencies but could not bind
  the SPA container because port 8392 was occupied by the concurrent R139 Vite
  server; both API and SPA remained reachable. The complete Cypress run passed
  all R140, Navigation, Plan, and Profile specs (33/36 overall); only Encounter
  tests failed because concurrent uncommitted R139 changed profile-card
  navigation to its action button while `encounter.cy.ts` still clicks the card.
