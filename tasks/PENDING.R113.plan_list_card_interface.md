# R113 – Plan list page card interface

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Update the Plan List page (`/plans`) from a data-table layout to a card grid per `Specifications/features.md`. Each card shows plan name, description, and step count. Preserve search and load-more behavior.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub/Specifications/features.md` — Plan List page item (lines 39–40)
- `src/pages/PlansListPage.vue` — current list page
- `src/pages/ProfilesListPage.vue` — dashboard card pattern to model
- `src/api/types.ts` — `Plan` includes optional `steps?: string[]`
- `../mentorhub_mentor_api/docs/openapi.yaml` — Plan list/create endpoints

## Goals

- `/plans` renders a **card grid** (not `v-data-table`), modeled on `ProfilesListPage` dashboard cards.
- Each card shows:
  - **Plan name** (`plan.name`)
  - **Description** (`plan.description` or fallback such as `No description`)
  - **Step count** chip using `plan.steps?.length ?? 0` with singular/plural label (`1 step` / `N steps`)
- Cards are clickable and navigate to `/plans/:id` (Plan Detail).
- Preserve **search** via `ListPageSearch` and **load more** via `useInfiniteScroll` / `api.getPlans`.
- Loading, empty state, and error snackbar remain functional.
- Automation IDs per `spa_standards.md`:
  - `plan-list-search`
  - `plan-list-card`
  - `plan-list-card-step-count`
  - `plan-list-empty`
  - `plan-list-load-more`

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Visit `/plans` — cards visible (not a data table)
  - Each card shows name, description, and step count
  - Click a card → navigates to `/plans/:id`
  - Search and Load More still work

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/PlansListPage.vue` — card grid layout with name, description, and step count

The agent must not update files outside this list.

## Execution Notes
