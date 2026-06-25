# R114 – Plan list new-plan dialog

**Status**: Pending  
**Type**: Feature  
**Depends On**: R113  
**Description**: Add a **New Plan** button on the Plan List page that opens an inline dialog prompting for plan name only. On success, create the plan via the API and navigate to Plan Detail (`/plans/:id`).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub/Specifications/features.md` — Plan List page item (lines 39–40)
- `src/pages/PlansListPage.vue` — card list from R113
- `src/pages/PlanEditPage.vue` — destination after create
- `src/api/client.ts` — `api.createPlan(data)`
- `src/api/types.ts` — `PlanInput`

## Goals

- **New Plan** button on `/plans` opens a `v-dialog` (not navigation to `/plans/new`).
- Dialog prompts for **plan name only** (required, `validationRules.namePattern`).
- **Create** submits `POST /api/plan` with `{ name, status: 'active' }` (no description/status fields in the dialog).
- On success:
  - Invalidate `['plans']` query cache
  - Close dialog and reset form
  - Navigate to `/plans/{newId}` (Plan Detail)
- **Cancel** closes dialog without creating a plan.
- Show error snackbar on create failure (`useErrorHandler`).
- Automation IDs per `spa_standards.md`:
  - `plan-list-new-button`
  - `plan-list-new-dialog`
  - `plan-list-new-name-input`
  - `plan-list-new-submit-button`
  - `plan-list-new-cancel-button`

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Click **New Plan** → dialog opens
  - Enter name → **Create** → lands on Plan Detail with name populated
  - **Cancel** → stays on `/plans`, no plan created

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/PlansListPage.vue` — New Plan button, dialog, and create mutation

The agent must not update files outside this list.

## Execution Notes
