# R130 – Paths and Resources list pages → `CardGrid` + `MhCard`

**Status**: Shipped  
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

**Status: Completed (CardGrid/Add migration shipped); Delete goal Blocked — no Path/Resource DELETE exists.**

### Plan
- Rewrite `PathsListPage.vue` and `ResourcesListPage.vue` to render `CardGrid` + `MhCard` (from `@mentor-forge/mentorhub_spa_utils`) instead of `v-data-table`, binding each card's `title` to the entity `name` and body to `description` (with a "No description" fallback). No status/created/saved fields on the card.
- Kept the existing page-level **New Path** / **New Resource** buttons (`path-list-new-button` / `resource-list-new-button`) and `ListPageSearch` (still valuable with a full card list).
- Added a single "Open" icon button in each `MhCard` `#actions` slot (`*-open-button`) that navigates to the edit route — `MhCard` uses `inheritAttrs: false` with no `v-bind="$attrs"`, so a `@click` on `<MhCard>` itself is not wired to anything; an explicit actions-slot control is required for click-to-navigate.
- `ResourcesListPage.vue`: removed `useInfiniteScroll` entirely. `GET /api/resource` is still cursor/batch-shaped (`items` / `limit` / `has_more` / `next_cursor`), not a plain array and not offset/size-header paginated — confirmed via `../mentorhub_mentor_api/docs/openapi.yaml`, `src/routes/resource_routes.py`, and `ResourceService.get_resources`. Replaced the composable with a plain `useQuery` calling `api.getResources({ name, limit: 100 })` and reading `.items`, with no "Load More" control. **Follow-up:** if the Resource collection can exceed 100 items, a future task should reshape `GET /api/resource` to a plain array (like `/api/path`) or offset/size headers so the list is not capped; flagging here rather than inventing a new API shape.
- No changes needed to `src/api/client.ts`, `src/api/types.ts`, or `README.md` — the existing `api.getPaths` / `api.getResources` methods already fit the new pages, no delete endpoint exists to wire up, and `README.md` did not previously document Paths/Resources list UI.
- Updated `cypress/e2e/path.cy.ts` and `cypress/e2e/resource.cy.ts`: replaced `table` / `table tbody` selectors with the new `path-list-grid` / `resource-list-grid` automation IDs, and added a card-content + open-button navigation test for each domain. `navigation.cy.ts` required no changes (its only table assertion is for `/profiles`, outside this task).

### Delete goal — Blocked
Confirmed **no DELETE (or equivalent) operation exists** for Path or Resource documents:
- `../mentorhub_mentor_api/docs/openapi.yaml` defines only `get`/`post` for `/api/path` and `/api/resource`, and only `get`/`patch` for `/api/path/{PathId}` and `/api/resource/{ResourceId}` — no `delete`.
- `src/routes/resource_routes.py` and `src/services/path_service.py` (mentor API source) implement no delete route/service method for either domain.
- Could not additionally confirm against the **live** OpenAPI (`curl http://localhost:8391/docs/openapi.yaml` per task instructions) because `npm run api` requires Docker, and the Docker daemon is not available in this execution sandbox (`docker info` fails to connect; no `sudo`/systemd access to start it). The static source-of-truth check above is unambiguous, so this is treated as sufficient confirmation that delete is out of scope, not skipped for lack of trying.
- Per task instructions, delete was **not implemented and not invented**. No delete button/automation ID was added to either card's `#actions`; only the Open action is present. This task is otherwise fully shipped (CardGrid/MhCard migration, name+description-only cards, Add buttons preserved, `useInfiniteScroll` removed from Resources, Cypress updated).

### Test results
- `npm run test` — **92/92 passing** (13 test files); no pre-existing unit tests target `PathsListPage`/`ResourcesListPage` directly, so this mainly confirms no regressions elsewhere (API client, composables, etc.).
- `npm run build` — **passed** (`vue-tsc` type-check + `vite build`), no type errors introduced.
- `npm run api` / `npm run dev` / `npm run cypress:run:spec` (`path.cy.ts`, `resource.cy.ts`, `navigation.cy.ts`) / `npm run container` / `npm run service` / `npm run cypress:run` — **skipped**. All require Docker (backing Mentor API/DB containers or the SPA container), and the Docker daemon is not reachable in this sandboxed execution environment (`docker info` → "failed to connect to the docker API"; starting it requires interactive `sudo`, unavailable here). The Cypress spec edits were reviewed manually against the new automation IDs and component structure (`CardGrid`/`MhCard` render `data-automation-id` on the grid root and each card, `.mh-card` class from `MhCard.vue`) but not executed. Recommend re-running the full Testing Expectations list in an environment with Docker available before shipping.

### Note on concurrent workspace activity
While this task was being executed, unrelated changes to `src/pages/PathEditPage.vue`, `src/pages/ResourceEditPage.vue`, `src/pages/PlanEditPage.vue`, `src/pages/PlansListPage.vue`, `src/pages/ProfilesListPage.vue`, `src/components/PlanChecklistEditor.vue`, `src/components/SchemaFieldsCard.vue`, and `tasks/PENDING.R129.list_pages_profiles_plans_cardgrid.md` appeared in the working tree (timestamps within this session, files outside this task's Outputs list). These were not made by this task's execution and were left untouched — likely a concurrently running R129 (or related) task in the same shared working tree. Flagging for the orchestrator/developer since a combined `git status` will show them alongside this task's changes.
