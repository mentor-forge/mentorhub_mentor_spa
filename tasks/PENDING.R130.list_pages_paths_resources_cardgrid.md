# R130 – Paths and Resources list pages → `CardGrid` + `MhCard`

**Status**: Pending  
**Type**: Feature  
**Depends On**: R128  
**Description**: Convert Paths and Resources list UIs from data-table / infinite-scroll patterns to spa_utils `CardGrid` + `MhCard` dashboards. Cards show **name** in the title bar and **description** only in the body. Page-level Add buttons and per-card Delete in `MhCard` `#actions`. Stop using deprecated `useInfiniteScroll` on these pages.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Preferred UI cards; fixed `CardGrid` column contract (no breakpoint props); **Deprecated: infinite-scroll list APIs**
- `../mentorhub_spa_utils/demo/pages/DashboardPage.vue` — `#actions` reference
- `src/pages/PathsListPage.vue`
- `src/pages/ResourcesListPage.vue`
- `src/pages/PathNewPage.vue` / `src/pages/ResourceNewPage.vue` — create navigation targets (do not redesign unless list create UX requires it)
- `src/api/client.ts` — list fetch helpers; add Path/Resource delete client methods only if OpenAPI defines them
- `cypress/e2e/path.cy.ts`
- `cypress/e2e/resource.cy.ts`
- `cypress/e2e/navigation.cy.ts`

**External prerequisite (delete):** Mentor API OpenAPI must document DELETE (or equivalent) for Path and Resource documents, and the live API must implement them. Confirm via `npm run api` then `curl -X GET "http://localhost:8391/docs/openapi.yaml"`. If delete is missing for either collection, set this task **Status** to `Blocked` for that delete goal after shipping the CardGrid/Add/content work — do **not** invent delete endpoints.

## Goals

- **PathsListPage** and **ResourcesListPage** use `CardGrid` + `MhCard` instead of `v-data-table` (and Resources no longer depends on deprecated `useInfiniteScroll`).
- Use spa_utils `CardGrid` as shipped (container-width column contract). Do **not** pass removed breakpoint props (`cols` / `sm` / `md` / `lg`).
- Fetch list data as plain arrays (existing GET list APIs / offset-size headers as already supported by the client). Prefer a simple `useQuery` (or non-cursor list pattern) over cursor infinite scroll.
- **Simplified card content:**
  - Title bar: entity **name**.
  - Body: **description only** (fallback “No description” is fine). Do **not** show status, created/saved timestamps, or other table columns on the card.
- **Card actions:** Put affordances in `MhCard` `#actions` (title bar).
  - **Delete** control per card that calls the Path/Resource delete API when available, confirms if needed, invalidates the list query, and removes the card on success.
  - Card click or an open action navigates to the edit route.
- **Add button:** Page-level **New Path** / **New Resource** buttons (header or list toolbar) continue to reach existing new pages — not floating overlays on card media.
- Preserve or introduce stable `data-automation-id`s (`path-list-*`, `resource-list-*`) and update Cypress accordingly, including delete controls (e.g. `path-list-card-*-delete-button`).
- Keep search only if it remains valuable with a full card list; if search stays, reuse `ListPageSearch` without reintroducing table chrome.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/paths` and `/resources` show card grids: name + description only; Add works; Delete works when API supports it

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/path.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/resource.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PathsListPage.vue` — rewrite as `CardGrid` + `MhCard`; name + description; Add; Delete in `#actions`
- `src/pages/ResourcesListPage.vue` — rewrite as `CardGrid` + `MhCard`; name + description; Add; Delete in `#actions`; remove `useInfiniteScroll`
- `src/api/client.ts` — only if list helpers must drop infinite-scroll-shaped APIs, or Path/Resource delete clients are required by OpenAPI
- `src/api/types.ts` — only if types must change for delete
- `cypress/e2e/path.cy.ts` — card UI / automation IDs; Add and Delete coverage when implemented
- `cypress/e2e/resource.cy.ts` — card UI / automation IDs; Add and Delete coverage when implemented
- `cypress/e2e/navigation.cy.ts` — only if list navigation assertions break
- `README.md` — update Paths/Resources list docs if they still describe tables/infinite scroll

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
