# R130 – Paths and Resources list pages → `CardGrid` + `MhCard`

**Status**: Pending  
**Type**: Feature  
**Depends On**: R128  
**Description**: Convert Paths and Resources list UIs from data-table / infinite-scroll patterns to spa_utils `CardGrid` + `MhCard` dashboards (defaults `cols=12 sm=6 md=4 lg=3`), with title-bar actions for create/navigate. Stop using deprecated `useInfiniteScroll` on these pages.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI cards; **Deprecated: infinite-scroll list APIs**
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue`
- `src/pages/PathsListPage.vue`
- `src/pages/ResourcesListPage.vue`
- `src/pages/PathNewPage.vue` / `src/pages/ResourceNewPage.vue` — create navigation targets (do not redesign unless list create UX requires it)
- `src/api/client.ts` — list fetch helpers used by these pages
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`
- `cypress/e2e/navigation.cy.ts`

## Goals

- **PathsListPage** and **ResourcesListPage** use `CardGrid` + `MhCard` instead of `v-data-table` (and Resources no longer depends on deprecated `useInfiniteScroll`).
- Fetch list data as plain arrays (existing GET list APIs / offset-size headers as already supported by the client). Prefer a simple `useQuery` (or non-cursor list pattern) over cursor infinite scroll.
- Card body shows primary identifying fields (name, short description/status as appropriate); card click or title-bar action navigates to the edit route.
- Preserve or introduce stable `data-automation-id`s (`path-list-*`, `resource-list-*`) and update Cypress accordingly.
- Keep search only if it remains valuable with a full card list; if search stays, reuse `ListPageSearch` without reintroducing table chrome.
- “New Path” / “New Resource” continue to reach existing new pages (header or card-grid action area — not floating overlays on card media).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/paths` and `/resources` show card grids; create and open-edit flows work

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/path.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/resource.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PathsListPage.vue` — rewrite as `CardGrid` + `MhCard` list
- `src/pages/ResourcesListPage.vue` — rewrite as `CardGrid` + `MhCard` list; remove `useInfiniteScroll`
- `src/api/client.ts` — only if list helpers must drop infinite-scroll-shaped APIs for these pages
- `cypress/e2e/path.cy.ts` — card UI / automation IDs
- `cypress/e2e/resource.cy.ts` — card UI / automation IDs
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break
- `README.md` — update Paths/Resources list docs if they still describe tables/infinite scroll

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
