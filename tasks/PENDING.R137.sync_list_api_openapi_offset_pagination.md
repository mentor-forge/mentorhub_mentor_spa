# R137 – Sync list API client to OpenAPI offset/size pagination

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Align Mentor SPA list types and client methods with the **live mentor API OpenAPI** header-based `offset` / `size` pagination (plain JSON array responses). Drop cursor / `after_id` / `InfiniteScrollResponse` shapes for Path, Plan, and Resource lists so CardGrid pages (R139–R140) can fetch pages correctly. This work is expected to land alongside related mentor API pagination changes — always re-check the live spec before coding.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Deprecated: infinite-scroll list APIs; replacement is offset/size header pagination
- `src/api/types.ts` — current `InfiniteScrollParams` / `InfiniteScrollResponse` / list param shapes
- `src/api/client.ts` — `getResources`, `getPaths`, `getPlans`, and any remaining `after_id` callers
- `src/api/Resource.client.test.ts`
- `src/api/Path.client.test.ts`
- `src/api/Plan.client.test.ts`
- `src/api/types.test.ts`
- `src/pages/ResourcesListPage.vue` — still uses deprecated `useInfiniteScroll` (UI migration is R140; client must be ready here)
- `tasks/_PLANNING.md` — Backing API OpenAPI schemas

**OpenAPI source of truth (required):**

1. `npm run api`
2. `curl -X GET "http://localhost:8391/docs/openapi.yaml"`

Confirm for each list collection used by this SPA:

| Collection | Expectation (as of planning-time live spec) |
|------------|-----------------------------------------------|
| `GET /api/path` | Request headers `offset` / `size`; query `sort_by` / `order` / filters; response **array** + `X-Pagination-Offset`, `X-Pagination-Size`, `X-Pagination-Returned` |
| `GET /api/plan` | Same offset/size header pagination contract |
| `GET /api/resource` | Same, plus documented filter query params (`name`, `description`, `status`, …) |
| `GET /api/profile` | Array response; **no** offset/size pagination in current OpenAPI — keep a simple full-list client |

**External prerequisite:** If Path/Plan/Resource list operations are missing `OffsetHeader` / `SizeHeader` (or still document cursor/`after_id` only) when this task runs, set **Status** to `Blocked` and stop — do not invent pagination. Re-fetch the live spec after the companion API change lands.

Do **not** invent DELETE endpoints here; list delete UX is out of scope unless OpenAPI already documents DELETE and a later list task wires it.

## Goals

- Introduce a shared list-params type (e.g. `ListParams`) with `offset?`, `size?`, `sort_by?`, `order?`, and collection-specific filter fields matching OpenAPI — not `after_id` / `limit` / `has_more` / `next_cursor`.
- `getPaths`, `getPlans`, and `getResources` send `offset` and `size` as **request headers** (stringified integers; defaults consistent with OpenAPI, typically `0` / `20`), pass sort/filter as **query params**, and resolve to **`T[]`** (plain arrays).
- Remove or stop using `InfiniteScrollParams` / `InfiniteScrollResponse` for these collections; update unit tests accordingly.
- `getProfiles` (or equivalent) remains a non-paginated array fetch if OpenAPI still has no profile pagination.
- Optionally add a small `src/composables/useOffsetList.ts` (offset page-param infinite query) for Paths/Resources load-more — only if needed so R140 can drop `useInfiniteScroll` without inventing ad-hoc paging. Prefer mirroring the offset/size pattern already proven in other journey SPAs; do not reintroduce spa_utils `useInfiniteScroll`.
- Client/unit tests assert header names `offset` / `size` and array responses (mock Axios/fetch accordingly).
- Do **not** redesign list page UI in this task (R139–R140). Temporary compile fixes in list pages are allowed only if method signatures change and must be listed in Outputs.

## Testing Expectations

Run all commands from this SPA repository root.

- **OpenAPI check**
  - `npm run api`
  - `curl -X GET "http://localhost:8391/docs/openapi.yaml"` — confirm pagination headers/params before coding; paste a short summary into Execution Notes

- **Unit / build**
  - `npm run test`
  - `npm run build`

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/api/types.ts` — `ListParams` (or equivalent); remove/retire cursor infinite-scroll types for Path/Plan/Resource
- `src/api/client.ts` — offset/size header list methods returning arrays
- `src/api/types.test.ts` — align type tests
- `src/api/Path.client.test.ts` — header pagination assertions
- `src/api/Plan.client.test.ts` — header pagination assertions
- `src/api/Resource.client.test.ts` — header pagination assertions
- `src/composables/useOffsetList.ts` — **create** only if needed for offset paging consumers
- `src/pages/ResourcesListPage.vue` — minimal signature/compile fix only if required (full CardGrid rewrite is R140)
- `src/pages/PathsListPage.vue` — minimal signature/compile fix only if required
- `src/pages/PlansListPage.vue` — minimal signature/compile fix only if required

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
