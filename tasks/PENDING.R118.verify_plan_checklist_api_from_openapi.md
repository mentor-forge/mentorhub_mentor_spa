# R118 – Verify Plan checklist API and schema from OpenAPI

**Status**: Pending  
**Type**: Feature  
**Depends On**: R117  
**Description**: Verify the mentor API OpenAPI spec against the SPA Plan types and client before building checklist UI on `PlanEditPage`. Confirm `checklist` (plan steps) is modeled correctly on `Plan`, `PlanInput`, and `PlanUpdate`, and that `PATCH /api/plan/{PlanId}` accepts the full ordered `checklist: string[]` payload used by add, edit, delete, and reorder operations.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md`
- `src/api/types.ts`
- `src/api/client.ts`
- `src/api/Plan.client.test.ts`
- `src/pages/PlanEditPage.vue` — read only; checklist UI is added in R119/R120
- `../mentorhub_mentor_api/docs/openapi.yaml` — `Plan`, `PlanInput`, `PlanUpdate`, `/api/plan` operations

External inputs (run from this SPA repository root):

- `npm run api` — start db + mentor API containers
- OpenAPI explorer: `http://localhost:8385/docs/explorer.html` (Developer Edition docs gateway)
- Live mentor API spec: `curl localhost:8391/docs/openapi.yaml` (mentor API; proxied at `/api` from SPA dev server)

**OpenAPI highlights (checklist / steps):**

- `Plan.checklist` — optional `string[]`; each item pattern `^[^\t\n]{1,255}$`
- `PlanUpdate.checklist` — replace entire array on PATCH (no per-step sub-resource endpoints)
- Step order in the array is the canonical sequence order

## Goals

- Live OpenAPI reviewed after `npm run api`; any drift from committed `../mentorhub_mentor_api/docs/openapi.yaml` documented in Execution Notes.
- `Plan`, `PlanInput`, and `PlanUpdate` in `src/api/types.ts` match OpenAPI for `checklist` (type, optionality, item constraints).
- `api.getPlan`, `api.createPlan`, and `api.updatePlan` send/receive `checklist` exactly as defined in OpenAPI (full-array PATCH for mutations).
- `Plan.client.test.ts` covers checklist payloads on create and update (including multi-item ordered arrays).
- No UI changes in this task.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — must pass, including `Plan.client.test.ts`

- **Dev verification**
  - `npm run api`
  - `curl localhost:8391/docs/openapi.yaml` — confirm `checklist` on `Plan`, `PlanInput`, `PlanUpdate`
  - Optional: `curl -H "Authorization: Bearer $TOKEN" localhost:8391/api/plan/{id}` — confirm seeded plans return `checklist`
  - Optional: `PATCH` a plan with a reordered `checklist` array via curl or API explorer; confirm persisted order matches payload

- **Packaging verification**
  - `npm run container`
  - `npm run build` succeeds

## Outputs

- `src/api/types.ts` — align `checklist` with live OpenAPI if drift found
- `src/api/client.ts` — align Plan client methods if drift found
- `src/api/Plan.client.test.ts` — extend checklist mutation test coverage (ordered arrays, empty array)

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
