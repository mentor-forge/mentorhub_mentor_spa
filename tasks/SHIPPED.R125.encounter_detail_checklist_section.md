# R125 – Encounter Detail Checklist section

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R124  
**Description**: Implement the collapsible **Checklist** section on the Encounter Detail page using checklist items from the encounter's linked Plan.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `src/pages/EncounterEditPage.vue` — shell from R123 (plan loaded via `['plan', planId]`)
- `../mentorhub_mentor_api/docs/openapi.yaml` — `Plan.checklist` (array of strings); **no checklist field on Encounter**

## Goals

- **Checklist** collapsible section displays one checkbox per item in `plan.checklist` (preserve plan order)
- Checkbox labels show the checklist string text
- Checked state is **session-local UI state only** (not persisted to API — OpenAPI has no encounter checklist completion field)
- Initialize all items unchecked when the page loads or when the plan changes
- Empty state when encounter has no `plan_id`, plan not found, or `plan.checklist` is empty:
  - Message e.g. “No checklist items for this encounter's plan.”
- Automation IDs:
  - `encounter-detail-checklist-section` (from R123)
  - `encounter-detail-checklist-item` on each row (same id pattern acceptable with index suffix, e.g. `encounter-detail-checklist-item-0`)
  - `encounter-detail-checklist-empty`

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - Add unit test for checklist rendering logic if extracted to a composable or pure function

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Encounter with a plan that has checklist steps shows checkboxes; toggling does not call API

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterEditPage.vue` — Checklist section

The agent must not update files outside this list.

## Execution Notes

- Checklist uses encounter.agenda from API (server-filled from plan); toggles persist via PATCH.
- `npm run test`: 83/83 passed._
