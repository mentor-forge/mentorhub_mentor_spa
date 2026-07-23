# R138 – Paths and Resources list pages → `CardGrid` + `MhCard`

**Status**: Pending  
**Type**: Feature  
**Depends On**: R135, R136  
**Description**: Convert Paths and Resources list UIs from data-table / infinite-scroll patterns to spa_utils `CardGrid` + `MhCard` dashboards driven by R136 offset/size header pagination. Cards show **name** + **description** only. Page-level Add buttons; no per-card Delete (OpenAPI has no Path/Resource DELETE). Stop using deprecated `useInfiniteScroll` on these pages.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI cards; fixed `CardGrid` contract; **Deprecated: infinite-scroll list APIs**
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue` — `#actions` reference
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `src/pages/PathsListPage.vue`
- `src/pages/ResourcesListPage.vue`
- `src/pages/PathNewPage.vue` / `src/pages/ResourceNewPage.vue` — create navigation targets
- `src/api/client.ts` — R136 `getPaths` / `getResources`
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`
- `cypress/e2e/navigation.cy.ts`

**OpenAPI note:** Reconfirm with `curl -X GET "http://localhost:8391/docs/openapi.yaml"`. `GET /api/path` and `GET /api/resource` use `offset`/`size` headers, plain array bodies, and `X-Pagination-*` response headers. **No DELETE** on Path or Resource — do not invent delete endpoints.

**Supersedes:** R130 (0.5.4-era list task). Prefer this task if both remain Pending.

## Goals

- **PathsListPage** and **ResourcesListPage** use `CardGrid` + `MhCard` instead of `v-data-table` / infinite scroll.
- Use spa_utils `CardGrid` as shipped. Do **not** pass removed breakpoint props (`cols` / `sm` / `md` / `lg`).
- Fetch via R136 clients: `offset`/`size` **headers**, query `sort_by`/`order` and filters (`name`, and for resources also `description`/`status` if search/filter stays). Prefer `useQuery` + optional load-more (advance `offset` using `X-Pagination-Returned` / page size) over `useInfiniteScroll`.
- **Remove** all `useInfiniteScroll` usage from these pages; do not pass `after_id` / `limit` / cursor response fields.
- **Simplified card content:** title = **name**; body = **description only**.
- **Card actions:** open/navigate in `#actions` or card click. **No Delete.**
- **Add button:** Page-level **New Path** / **New Resource** to existing new pages.
- Preserve or introduce stable `data-automation-id`s (`path-list-*`, `resource-list-*`) and update Cypress.
- Keep search only if valuable with a card list; if kept, reuse `ListPageSearch` without table chrome.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/paths` and `/resources` show card grids: name + description; Add works; network shows `offset`/`size` headers (not `after_id`)

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/path.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/resource.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PathsListPage.vue` — `CardGrid` + `MhCard`; name + description; Add; offset/size fetch; no `useInfiniteScroll`; no Delete
- `src/pages/ResourcesListPage.vue` — same; remove `useInfiniteScroll`
- `cypress/e2e/path.cy.ts` — card UI / automation IDs; Add coverage
- `cypress/e2e/resource.cy.ts` — card UI / automation IDs; Add coverage; drop infinite-scroll assertions
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break
- `README.md` — update Paths/Resources list docs if they still describe tables/infinite scroll

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
