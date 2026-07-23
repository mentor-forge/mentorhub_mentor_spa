# R144 – Remove duplicate local card chrome; Cypress and docs alignment

**Status**: Shipped
**Type**: Feature  
**Depends On**: R136, R139, R140, R141, R142, R143  
**Description**: After spa_utils 0.5.5 cards, typed editors, Cypress auth helpers, and offset list clients are adopted, delete unused local card chrome, finish Cypress alignment on stable `data-automation-id`s, and update README guidance so new work prefers `CardGrid` / `MhCard` / `DataCard` + typed editors (with `AutoSaveField` as compatibility only).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `src/components/dashboard/` — after R139–R140: which exports remain in use
- `src/styles/dashboard.css` (or equivalent)
- `src/main.ts` — style imports
- `src/components/SchemaFieldsCard.vue` — should already be gone or unused after R142
- `cypress.config.ts` / `cypress/support/` — confirm R136 auth wiring still clean
- `cypress/e2e/*.ts` — final pass across profile, plan, path, resource, encounter, navigation
- Tasks R136–R143 Execution Notes — remaining follow-ups

## Goals

- **Delete** local components superseded by spa_utils when no longer imported:
  - `DashboardCard.vue`, `DashboardCardGrid.vue` (and exports from `src/components/dashboard/index.ts`)
  - Any leftover `SchemaFieldsCard.vue` if still present and unused
- **Keep** journey-specific dialogs/helpers still in use (`DashboardPageLayout` if still referenced, `NamePromptDialog`, `PlanSelectDialog`, plan-select validation, etc.).
- Remove or slim `src/styles/dashboard.css` rules that only existed for the deleted local card chrome; drop unused imports from `main.ts`.
- Confirm no remaining imports of deprecated spa_utils `useInfiniteScroll` in `src/`.
- Cypress specs assert stable `data-automation-id`s consistent with spa_utils editor conventions (including `-display` for read-only editors where applicable).
- README documents preferred UI: `CardGrid` / `MhCard` / `DataCard` + typed editors; notes offset/size list pagination; notes that `AutoSaveField` remains a compatibility wrapper.
- No new `AutoSaveField` introductions in touched docs/examples.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`
  - Confirm no imports remain to deleted local card components or `useInfiniteScroll`

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
- `cypress/e2e/profile.cy.ts` — final automation-id alignment
- `cypress/e2e/plan.cy.ts` — final automation-id alignment
- `cypress/e2e/path.cy.ts` — final automation-id alignment
- `cypress/e2e/resource.cy.ts` — final automation-id alignment
- `cypress/e2e/encounter.cy.ts` — final automation-id alignment
- `cypress/e2e/navigation.cy.ts` — final automation-id alignment
- `README.md` — prefer spa_utils cards + typed editors; offset/size lists; `AutoSaveField` compatibility note

The agent must not update files outside this list.

## Execution Notes

- Plan: delete the unreferenced local `DashboardCard` / `DashboardCardGrid`
  components and exports, remove their now-unused dashboard stylesheet/import,
  and retain `DashboardPageLayout`, `NamePromptDialog`, `PlanSelectDialog`, and
  checklist styling that are still used.
- Align the final Cypress selectors with stable automation IDs (including typed
  editor `-display` output where applicable), update README guidance for shared
  cards, typed editors, compatibility-only `AutoSaveField`, and offset/size
  lists, then run the complete unit/build, E2E, and packaging sequence.
- Implemented: removed the unused local dashboard card/grid components, exports,
  stylesheet, and bootstrap import while retaining the referenced dashboard
  layout and dialogs. Cypress now opens Profiles through the stable card action
  ID and counts Path/Resource cards by their stable per-card IDs. README now
  directs new work to shared cards, typed editors, and offset/size list headers.
- Verification:
  - `npm run test` — passed (14 files, 93 tests).
  - `npm run build` — passed.
  - `npm run cypress:run` — passed (6 specs, 39/39).
  - `npm run container` — passed.
  - `npm run service` — API dependencies started, but Docker Desktop's WSL
    forwarding bridge returned HTTP 500 while publishing host port 8392; the
    trailing desktop browser opener is also unavailable in this environment.
  - The same packaged image was started on host port 8394, its health check
    passed, and `CYPRESS_BASE_URL=http://localhost:8394 npm run cypress:run`
    passed all 6 specs (39/39).
- Confirmed no `DashboardCard`, `DashboardCardGrid`, `SchemaFieldsCard`, or
  `useInfiniteScroll` source imports remain.
