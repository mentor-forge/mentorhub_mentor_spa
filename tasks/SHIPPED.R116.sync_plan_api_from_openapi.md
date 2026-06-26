# R116 – Sync Plan API client and types from OpenAPI

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R113, R114  
**Description**: Align Plan TypeScript types and API client methods with the latest mentor API OpenAPI spec. `GET /api/plan` returns a plain array (no search, pagination, or infinite scroll). Plan documents include a `checklist` array (plan steps).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/api/types.ts`
- `src/api/client.ts`
- `src/api/Plan.client.test.ts`
- `src/pages/PlansListPage.vue` — current consumer (will be rewritten in R117)
- `src/pages/PlanEditPage.vue` — **read only**; do not modify (future feature)

External Inputs

- The latest OpenAPI Spec at `curl localhost:8385/docs/explorer.html` — review `Plan`, `PlanInput`, `PlanUpdate`, and `/api/plan` operations
- After `npm run api`, verify live spec: `curl localhost:8391/docs/openapi.yaml` (mentor API; proxied at `/api` from SPA dev server)

**OpenAPI highlights (expected deltas from current SPA):**

- `GET /api/plan` → `200` body is `Plan[]` sorted by name; **no** query params for search/pagination/cursor
- `Plan`, `PlanInput`, `PlanUpdate` include optional `checklist: string[]` (encounter steps)
- `POST /api/plan` and `PATCH /api/plan/{PlanId}` unchanged in shape aside from `checklist`

## Goals

- Add `checklist?: string[]` to `Plan`, `PlanInput`, and `PlanUpdate` in `src/api/types.ts`.
- Change `api.getPlans()` to return `Promise<Plan[]>` with **no** `InfiniteScrollParams` argument.
- Remove infinite-scroll query string building from the Plan client method.
- Keep `getPlan`, `createPlan`, and `updatePlan` aligned with OpenAPI request/response shapes.
- Update `Plan.client.test.ts`:
  - Mock `GET /api/plan` returning a JSON array (not `{ items, has_more, ... }`).
  - Remove or replace tests for pagination/search query params.
  - Add test coverage for `checklist` on Plan types if mocked responses include it.
- `npm run test` passes; no changes to `PlansListPage.vue` in this task (R117 consumes the updated client).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — must pass, including updated `Plan.client.test.ts`

- **Dev verification** (optional)
  - `npm run api`
  - `curl -H "Authorization: Bearer $TOKEN" localhost:8391/api/plan` — confirm array response with `checklist` on seeded plans

- **Packaging verification**
  - `npm run container`
  - `npm run build` succeeds (PlansListPage may fail type-check until R117 — if so, apply minimal type-only fix to PlansListPage **only** enough to compile, and note in Execution Notes for R117)

## Outputs

- `src/api/types.ts` — add `checklist` to Plan interfaces
- `src/api/client.ts` — simplify `getPlans()` to return `Plan[]`
- `src/api/Plan.client.test.ts` — update mocks and assertions for array response

The agent must not update files outside this list except a minimal compile fix to `PlansListPage.vue` if required for `npm run build` (document in Execution Notes).

## Execution Notes

- Added `checklist?: string[]` to `Plan`, `PlanInput`, and `PlanUpdate`.
- `getPlans()` now returns `Plan[]` with no query params.
- Updated `Plan.client.test.ts` for array response and checklist fields; removed pagination/search test.
- `PlansListPage.vue` still uses `useInfiniteScroll` — full rewrite deferred to R117 (build will fail until R117).
