# R134 – Remove duplicate local card chrome; Cypress and docs alignment

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R129, R130, R131, R132, R133  
**Description**: After spa_utils cards and typed editors are adopted, delete unused local card chrome (`DashboardCard` / `DashboardCardGrid` and related styles), finish Cypress alignment on stable `data-automation-id`s, and update README guidance so new work prefers `CardGrid` / `MhCard` / `DataCard` + typed editors (with `AutoSaveField` as compatibility only).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `src/components/dashboard/` — after R129–R130: which exports remain in use
- `src/styles/dashboard.css` (or equivalent)
- `src/main.ts` — style imports
- `src/components/SchemaFieldsCard.vue` — should already be gone or unused after R132
- `cypress/e2e/*.ts` — final pass across profile, plan, path, resource, encounter, navigation
- Tasks R129–R133 Execution Notes — remaining follow-ups

## Goals

- **Delete** local components superseded by spa_utils when no longer imported:
  - `DashboardCard.vue`, `DashboardCardGrid.vue` (and exports from `src/components/dashboard/index.ts`)
  - Any leftover `SchemaFieldsCard.vue` if still present and unused
- **Keep** journey-specific dialogs/helpers still in use (`DashboardPageLayout` if still referenced, `NamePromptDialog`, `PlanSelectDialog`, plan-select validation, etc.).
- Remove or slim `src/styles/dashboard.css` rules that only existed for the deleted local card chrome; drop unused imports from `main.ts`.
- Cypress specs assert stable `data-automation-id`s consistent with spa_utils editor conventions (including `-display` for read-only editors where applicable).
- README documents preferred UI: `CardGrid` / `MhCard` / `DataCard` + typed editors; notes that `AutoSaveField` remains a compatibility wrapper and `AutoSaveSelect` remains for enums.
- No new `AutoSaveField` introductions in touched docs/examples.

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
- `cypress/e2e/profile.cy.ts` — final automation-id alignment
- `cypress/e2e/plan.cy.ts` — final automation-id alignment
- `cypress/e2e/path.cy.ts` — final automation-id alignment
- `cypress/e2e/resource.cy.ts` — final automation-id alignment
- `cypress/e2e/encounter.cy.ts` — final automation-id alignment
- `cypress/e2e/navigation.cy.ts` — final automation-id alignment
- `README.md` — prefer spa_utils cards + typed editors; `AutoSaveField` compatibility note

The agent must not update files outside this list.

## Execution Notes

**Status: Success**

- **Confirmed unused, then deleted** `src/components/dashboard/DashboardCard.vue` and `src/components/dashboard/DashboardCardGrid.vue`: a repo-wide search showed the only references were their own re-exports in `src/components/dashboard/index.ts` — R129/R130 already migrated `ProfilesListPage.vue` / `PlansListPage.vue` / `PathsListPage.vue` / `ResourcesListPage.vue` to spa_utils `CardGrid` + `MhCard` (with their own local scoped `.dashboard-card-click` class for the clickable wrapper div, unrelated to the deleted components' `.dashboard-card` class). Removed both exports from `index.ts`, keeping `DashboardPageLayout`, `NamePromptDialog`, and `PlanSelectDialog` (all still imported/used by `ProfilesListPage.vue`, `PlansListPage.vue`, and `ProfileEditPage.vue`).
- **`src/styles/dashboard.css`**: entirely composed of `.dashboard-card` / `.dashboard-card__description` / `.dashboard-card__chips` / `.dashboard-card__caption` rules that only ever styled the now-deleted `DashboardCard.vue`; confirmed no remaining usage anywhere in `src/` and deleted the file outright (nothing left to "slim"). Removed its `import './styles/dashboard.css'` from `src/main.ts`.
- **`SchemaFieldsCard.vue`**: already absent from the repo (removed in an earlier task, per the task's own Context note) — no action needed for that Output line. Note: `src/styles/schema-fields.css` (imported in `main.ts`) still contains some dead `.schema-fields-card*` / `.schema-field-row*` rules left over from that deleted component, but that file/import is **not** listed under this task's Outputs, so it was intentionally left untouched (it also still holds the `.plan-checklist-*` rules actively used by `PlanChecklistEditor.vue`, so it isn't purely dead). Flagging as a candidate for a future follow-up task if the team wants it slimmed.
- **Cypress automation-id final pass**: read all six listed specs (`profile.cy.ts`, `plan.cy.ts`, `path.cy.ts`, `resource.cy.ts`, `encounter.cy.ts`, `navigation.cy.ts`) against their corresponding pages (`ProfileEditPage.vue`, `PlanEditPage.vue`, `PathEditPage.vue`, `ResourceEditPage.vue`, `EncounterEditPage.vue`, `PlansListPage.vue`/`ProfilesListPage.vue`/`PathsListPage.vue`/`ResourcesListPage.vue`, `PlanChecklistEditor.vue`, `PlanSelectDialog.vue`, `NamePromptDialog.vue`, `DashboardPageLayout.vue`). Every `data-automation-id` asserted in these specs already matches an id actually rendered by the current source — no drift found, so **no spec edits were needed**. Specifically verified the spa_utils `-display` auto-suffix convention (editors render `{automationId}-display` when `editable=false`, e.g. `StringEditor`/`EmailEditor`/`UsPhoneEditor`): none of the six specs currently assert against the read-only display fields that carry unsuffixed base ids in the templates (e.g. `ProfileEditPage.vue`'s `profile-edit-profile-*` fields, `PlanEditPage.vue`'s admin-only audit `BreadcrumbDisplay` fields), so there is no existing incorrect assertion to fix; flagging that any *future* spec added against those specific fields must target the `-display`-suffixed id, not the bare `automation-id` prop value written in the template.
- **README.md**: updated the three passages that referenced `AutoSaveField/AutoSaveSelect` as the general-purpose edit-page pattern (architecture overview note, "Reusable Components and Composables" list, and "Adding New Features" step 5) to lead with `CardGrid` / `MhCard` / `DataCard` + typed field editors, keep `AutoSaveSelect` for enum/status selects, and explicitly mark `AutoSaveField` as compatibility-only / not for new work. No other README passages mentioned `AutoSaveField`.
- Did not touch `DashboardPageLayout.vue`, `NamePromptDialog.vue`, `PlanSelectDialog.vue`, `planSelectValidation.ts`, or any file outside this task's Outputs list.

### Testing

- `npm run test` — **passed**: 13 files / 92 tests.
- `npm run build` (`vue-tsc && vite build`) — **passed** cleanly; confirmed via type-check + successful bundle that no imports remain to the deleted `DashboardCard`/`DashboardCardGrid` components or `dashboard.css`.
- Confirmed (via repo-wide search) zero remaining references to `DashboardCard`, `DashboardCardGrid`, or `dashboard.css` anywhere in `src/`.
- **E2E (`npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`) — blocked in this environment**, same root cause previously documented in R133: the Cypress Electron binary cannot execute in this sandbox (`Cypress: bad option: --no-sandbox` / `--smoke-test` / `--ping=...` — the binary isn't launching as Electron at all). Retried with full/unsandboxed permissions; identical failure, confirming it's an environment (missing Electron runtime capability under this WSL2/container setup) limitation rather than a sandbox permission issue or a code defect. `npm run cypress:run` (full suite) was not attempted for the same reason. Should be re-run on a standard dev machine or CI runner.
- **Packaging verification — skipped**: `npm run container` requires AWS CodeArtifact SSO (`aws codeartifact get-authorization-token` returned `NoCredentials` in this environment); `npm run service` and `npm run cypress:run` depend on the same blocked Cypress binary and/or a Docker container build. Not attempted for those reasons. Note: the dev server (`:8392`), Mentor API (`:8391`), and IdP login (`:8080`) were all already reachable (HTTP 200) in this environment, but that pre-existing stack does not unblock the Electron/Cypress launch issue above.
