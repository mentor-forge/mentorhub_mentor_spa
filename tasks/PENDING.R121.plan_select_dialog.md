# R121 – PlanSelectDialog shared component

**Status**: Pending  
**Type**: Feature  
**Depends On**: R120  
**Description**: Add a reusable dialog for selecting an Encounter Plan before creating a new encounter. Mirrors the dashboard dialog pattern established by `NamePromptDialog` but selects from existing plans via `GET /api/plan`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md`
- `src/components/dashboard/NamePromptDialog.vue` — dialog pattern reference
- `src/components/dashboard/index.ts`
- `src/pages/PlansListPage.vue` — plan list/card display reference
- `src/api/client.ts` — `getPlans(): Plan[]`

## Goals

- Create **`PlanSelectDialog`** under `src/components/dashboard/`:
  - Props: `modelValue` (open/close), optional `title`, `submitLabel`, `loading`
  - Fetches plans with Vue Query (`queryKey: ['plans']`, `api.getPlans()`) when opened
  - Shows plan **name** and optional **description**; indicate step count from `plan.checklist?.length ?? 0`
  - Requires user to select one plan before submit (validation message if none selected)
  - Emits `submit(planId: string)` on confirm; emits `update:modelValue` on cancel
  - Empty state when no plans exist with guidance to create a plan first (`/plans`)
- Automation IDs (prefix configurable via prop, default `plan-select`):
  - `plan-select-dialog`, `plan-select-list`, `plan-select-item`, `plan-select-submit-button`, `plan-select-cancel-button`, `plan-select-empty`
- Export from `src/components/dashboard/index.ts`
- Add unit test if dialog contains non-trivial selection/validation logic

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Temporarily mount dialog in a dev page or verify via Storybook-style manual test is **not** required; unit test coverage is sufficient for this task

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/components/dashboard/PlanSelectDialog.vue` — **create**
- `src/components/dashboard/index.ts` — export `PlanSelectDialog`
- `src/components/dashboard/PlanSelectDialog.test.ts` — **create** (if non-trivial logic)

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
