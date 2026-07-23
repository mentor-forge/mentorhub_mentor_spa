# R142 – Remove duplicate local card chrome; Cypress and docs alignment

**Status**: Pending  
**Type**: Feature  
**Depends On**: R137, R138, R139, R140, R141  
**Description**: After spa_utils cards and typed editors are adopted, delete unused local card chrome (`DashboardCard` / `DashboardCardGrid` and related styles), finish Cypress alignment on stable `data-automation-id`s, and update README guidance so new work prefers `CardGrid` / `MhCard` / `DataCard` + typed editors, offset/size list pagination, and treats `AutoSaveField` / `useInfiniteScroll` as compatibility or deprecated only.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `src/components/dashboard/` — after R137–R138: which exports remain in use
- `src/styles/dashboard.css` (or equivalent)
- `src/main.ts` — style imports / `provideEditorConfig`
- `src/components/SchemaFieldsCard.vue` — should already be gone or unused after R140
- `src/api/types.ts` — confirm infinite-scroll list types are unused
- `cypress/e2e/*.ts` — final pass across profile, plan, path, resource, encounter, navigation
- Tasks R136–R141 Execution Notes — remaining follow-ups

**Supersedes:** R134. Prefer this task if both remain Pending.

## Goals

- **Delete** local components superseded by spa_utils when no longer imported:
  - `DashboardCard.vue`, `DashboardCardGrid.vue` (and exports from `src/components/dashboard/index.ts`)
  - Any leftover `SchemaFieldsCard.vue` if still present and unused
- **Keep** journey-specific dialogs/helpers still in use (`DashboardPageLayout` if still referenced, `NamePromptDialog`, `PlanSelectDialog`, etc.).
- Remove or slim `src/styles/dashboard.css` rules that only existed for the deleted local card chrome; drop unused imports from `main.ts`.
- Confirm no remaining imports of deprecated `useInfiniteScroll` / `InfiniteScrollParams` / `InfiniteScrollResponse` in app code (tests may still mention them only if asserting absence).
- Cypress specs assert stable `data-automation-id`s consistent with spa_utils editor conventions (including `-display` for read-only editors where applicable).
- README documents preferred UI: `CardGrid` / `MhCard` / `DataCard` + typed editors; list pages use offset/size header pagination; `AutoSaveField` is compatibility-only; `useInfiniteScroll` is deprecated.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`
  - Confirm no imports remain to deleted local card components

- **E2E**
  - `npm run cypress:run`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/components/dashboard/DashboardCard.vue` — **delete** if unused
- `src/components/dashboard/DashboardCardGrid.vue` — **delete** if unused
- `src/components/dashboard/index.ts` — remove deleted exports
- `src/components/SchemaFieldsCard.vue` — **delete** if still present and unused
- `src/styles/dashboard.css` — slim or delete unused card chrome styles
- `src/main.ts` — drop unused style imports if applicable
- `src/api/types.ts` — only if leftover infinite-scroll types can be removed safely
- `cypress/e2e/profile.cy.ts` — final automation-id alignment
- `cypress/e2e/plan.cy.ts` — final automation-id alignment
- `cypress/e2e/path.cy.ts` — final automation-id alignment
- `cypress/e2e/resource.cy.ts` — final automation-id alignment
- `cypress/e2e/encounter.cy.ts` — final automation-id alignment
- `cypress/e2e/navigation.cy.ts` — final automation-id alignment
- `README.md` — prefer spa_utils cards + typed editors + offset/size lists; deprecate infinite-scroll guidance

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
