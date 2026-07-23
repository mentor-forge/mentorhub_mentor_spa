# R136 – Sync list API client to offset/size header pagination

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R135  
**Description**: Align Mentor SPA list client methods and types with the live Mentor API OpenAPI Get List contract: `offset`/`size` **request headers**, plain JSON **array** bodies, `sort_by`/`order` and filters as **query params**, and `X-Pagination-*` response headers. Remove cursor / infinite-scroll shapes (`after_id`, `limit`, `has_more`, `next_cursor`) from SPA ↔ API contracts used by list pages.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Deprecated: infinite-scroll list APIs; replacement is offset/size header pagination + plain arrays
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `src/api/client.ts`
- `src/api/types.ts`
- `src/api/Resource.client.test.ts`
- `src/api/Path.client.test.ts`
- `src/api/Plan.client.test.ts`
- `src/api/Event.client.test.ts` — only if Event list helpers remain in the client
- `src/api/client.test.ts`
- `src/pages/ResourcesListPage.vue` — still calls infinite-scroll-shaped `getResources` (do not redesign UI here; keep call sites compiling or temporarily adapter-compatible)
- `src/pages/PathsListPage.vue`
- `src/pages/PlansListPage.vue`

**OpenAPI source of truth (confirm before coding):**

```bash
npm run api   # if API not already up
curl -X GET "http://localhost:8391/docs/openapi.yaml"
```

As of planning (live Mentor API OpenAPI 0.1.0):

| Collection | Pagination | Request | Response body | Response headers |
|------------|------------|---------|---------------|------------------|
| `GET /api/path` | yes | headers `offset` (default 0), `size` (default 20, max 100); query `sort_by`, `order`, optional `name` | JSON array of Path | `X-Pagination-Offset`, `X-Pagination-Size`, `X-Pagination-Returned` |
| `GET /api/plan` | yes | same headers + `sort_by`/`order`/`name` | JSON array of Plan | same |
| `GET /api/resource` | yes | same headers + `sort_by`/`order`; filters `name`, `description`, `status` | JSON array of Resource | same |
| `GET /api/profile` | no | none | JSON array (mentor dashboard assignments) | none |
| `GET /api/event` | yes | offset/size headers + filters | JSON array | same — only touch Event client if still present; event UI was removed |

If live OpenAPI no longer matches this table when the task runs, follow the **live** spec. If offset/size list support is missing for Path/Plan/Resource, set **Status** to `Blocked` and stop — do not invent pagination.

## Goals

- Introduce shared list-request types for offset/size header pagination (e.g. `offset`, `size`, `sort_by`, `order`, plus collection-specific filters). Do **not** reuse or extend `InfiniteScrollParams` / `InfiniteScrollResponse` for these endpoints.
- `getPaths`, `getPlans`, and `getResources` send `offset`/`size` as **HTTP headers** (not query params), return `Promise<T[]>` (plain arrays), and optionally expose pagination response headers to callers (returned metadata object or a small wrapper — prefer the simplest pattern that list pages in R137–R138 can use for “load more”).
- Remove `after_id` / cursor response parsing from Resource (and Event, if still present) list methods.
- Update unit tests that asserted infinite-scroll query shapes to assert headers + array bodies.
- Keep `getProfiles()` as a non-paginated array fetch (OpenAPI has no offset/size on `GET /api/profile`).
- Do **not** convert list page UIs to `CardGrid` in this task (R137–R138). Pages may keep temporary adapters so `npm run test` / `build` stay green.
- Do **not** add DELETE clients — live OpenAPI has no DELETE on these collections.

## Testing Expectations

Run all commands from this SPA repository root.

- **OpenAPI check**
  - `curl -X GET "http://localhost:8391/docs/openapi.yaml"` — confirm Path/Plan/Resource list params/headers still match Goals

- **Unit / build**
  - `npm run test`
  - `npm run build`

- **Dev smoke (optional but preferred)**
  - `npm run api` (if needed)
  - `npm run dev`
  - Confirm list fetches for paths/plans/resources succeed (network: `offset`/`size` headers present; body is an array)

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/api/types.ts` — offset/size list param types; remove or stop using infinite-scroll list types for Path/Plan/Resource
- `src/api/client.ts` — `getPaths` / `getPlans` / `getResources` (and Event list only if retained) use header pagination + array responses
- `src/api/Path.client.test.ts` — assert header pagination contract
- `src/api/Plan.client.test.ts` — assert header pagination contract
- `src/api/Resource.client.test.ts` — assert header pagination contract; drop cursor assertions
- `src/api/Event.client.test.ts` — only if Event list client is updated
- `src/api/client.test.ts` — only if shared request helpers change
- `src/pages/ResourcesListPage.vue` — minimal compile fix if `getResources` signature changes (no CardGrid rewrite)
- `src/pages/PathsListPage.vue` — minimal compile fix if needed
- `src/pages/PlansListPage.vue` — minimal compile fix if needed
- `src/api/types.test.ts` — only if list param types were tested there

The agent must not update files outside this list.

## Execution Notes

### Plan
- Confirmed live OpenAPI 0.1.0: Path/Plan/Resource/Event GET lists use header `offset`/`size`, query filters + sort, JSON array body, `X-Pagination-*` response headers. Profile has no pagination.
- Add `ListParams` (offset/size + shared filters); stop using `InfiniteScrollParams`/`InfiniteScrollResponse` for list clients.
- Update `getPaths`/`getPlans`/`getResources`/`getEvents` to send offset/size headers and return `T[]`.
- Update client + types tests to assert header pagination.
- Minimal `ResourcesListPage` adapter so `useInfiniteScroll` still compiles (first page via offset/size; load-more deferred to R138).
- Paths/Plans pages already return arrays — no page changes needed.

### Results
- **OpenAPI check**: Live `http://localhost:8391/docs/openapi.yaml` (0.1.0) matches Goals for Path/Plan/Resource/Event (header offset/size, array body, X-Pagination-*). Profile has no pagination.
- **`npm run test`**: 13 files, 91 tests passed.
- **`npm run build`**: `vue-tsc` + vite build succeeded.
- **`npm run container`**: Image `ghcr.io/mentor-forge/mentorhub_mentor_spa:latest` built successfully (exit 0).
- **Dev smoke**: Not run (optional); API was up for OpenAPI check.
- **Blockers**: None.
- **Note**: `ResourcesListPage` temporary adapter loads first page only (`has_more: false`) until R138 CardGrid + offset list. Paths/Plans list pages unchanged.

### Files changed
- `src/api/types.ts`
- `src/api/client.ts`
- `src/api/Path.client.test.ts`
- `src/api/Plan.client.test.ts`
- `src/api/Resource.client.test.ts`
- `src/api/Event.client.test.ts`
- `src/api/types.test.ts`
- `src/pages/ResourcesListPage.vue`
- `tasks/PENDING.R136.sync_list_api_offset_size_pagination.md` (Execution Notes)
