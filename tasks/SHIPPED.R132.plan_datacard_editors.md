# R132 – Plan edit page → `DataCard` + typed editors

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R128  
**Description**: Convert Plan edit metadata and related form chrome to spa_utils `DataCard` + typed editors. Replace `SchemaFieldsCard`’s `AutoSaveField` usage with type-aligned editors; keep `AutoSaveSelect` for status (no enum editor in spa_utils 0.5.x). Align checklist section chrome with `MhCard` / `DataCard` where practical without losing reorder/CRUD behavior.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `AutoSaveSelect` retained for discrete options
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue`
- `src/pages/PlanEditPage.vue`
- `src/components/SchemaFieldsCard.vue`
- `src/components/PlanChecklistEditor.vue`
- `src/components/PlanChecklistEditor.test.ts`
- `cypress/e2e/plan.cy.ts`

## Goals

- Plan metadata (`name`, `description`, `status`) renders in a `DataCard` with:
  - `WordEditor` (or equivalent) for `name`
  - `SentenceEditor` / `MarkdownEditor` for `description` as appropriate to validation
  - `AutoSaveSelect` for `status` (keep — no enum editor yet)
- Prefer typed editors over `AutoSaveField` inside plan edit flows.
- Remove or slim `SchemaFieldsCard.vue` once Plan edit no longer needs its custom field-row chrome; do not leave a parallel local card system that duplicates `DataCard`/`MhCard`.
- `PlanChecklistEditor` keeps add / inline edit / delete / reorder behavior; wrap or restyle with `MhCard`/`DataCard` so it matches spa_utils card chrome (stable `plan-edit-checklist-*` automation IDs).
- Admin-only metadata may use `BreadcrumbDisplay` / `DateTimeEditor` (`editable=false`) instead of raw readonly `v-text-field` + `formatDate` where it improves consistency.
- Use `DurationEditor` / `DateTimeEditor` only where duration or date-time types appear on Plan (none required today beyond breadcrumbs/`at_time` display).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - Update `src/components/PlanChecklistEditor.test.ts` if component contract changes
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - `/plans/{id}` metadata autosave, status select, and checklist CRUD/reorder work

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/PlanEditPage.vue` — `DataCard` + typed editors / `AutoSaveSelect`
- `src/components/SchemaFieldsCard.vue` — update or **delete** if fully replaced
- `src/components/PlanChecklistEditor.vue` — card chrome alignment; keep checklist behavior
- `src/components/PlanChecklistEditor.test.ts` — update as needed
- `cypress/e2e/plan.cy.ts` — align automation IDs / assertions
- `README.md` — update Plan edit docs if they still prescribe `AutoSaveField` / `SchemaFieldsCard`

The agent must not update files outside this list.

## Execution Notes

**Plan (as executed):**
- Read context: `spa_standards.md`, this repo's `README.md`, `mentorhub_spa_utils/README.md`, `demo/pages/EditorsPage.vue`, `DataCard.vue`/`MhCard.vue`/`useDataCardContext.ts`, `BreadcrumbDisplay.vue`, `StringEditor.vue`/`WordEditor.vue`/`SentenceEditor.vue`/`AutoSaveSelect.vue`, and the mentor API OpenAPI `Plan`/`PlanUpdate` schemas (sibling repo, used only to confirm field validation — `description` pattern `^[^\t\n]{0,255}$` matches the `sentence` configurator type exactly, confirming `SentenceEditor` over `MarkdownEditor`).
- `src/pages/PlanEditPage.vue`: replaced `SchemaFieldsCard` with a `CardGrid` of `DataCard`s:
  - "An encounter plan" `DataCard` (`plan-edit-fields-section`, `name-field="name"`) with `WordEditor` (`name`), `SentenceEditor` (`description`), and a standalone `AutoSaveSelect` for `status` (per task instruction, kept — no enum editor wired since this SPA has no runtime `/api/config` enumerator plumbing yet).
  - Admin-only "Audit" `DataCard` (`plan-edit-metadata-section`) replacing the four raw readonly `v-text-field` + `formatDate` rows with two `BreadcrumbDisplay` editors bound to `created` / `saved` (both `Breadcrumb` — exact shape match). `onSave` is a no-op since `BreadcrumbDisplay` defaults `editable=false` and never invokes it.
  - `PlanChecklistEditor` (unchanged CRUD/reorder contract) placed as a third `CardGrid` item.
  - Collapsed the old two-column CSS layout (each with its own "Back to List" button) to one shared back button below the grid; `plan-edit-back-button` automation ID preserved. `plan-edit-checklist-back-button` removed (it was not referenced by any test).
- `src/components/SchemaFieldsCard.vue`: **deleted** — no longer imported anywhere (only consumer was `PlanEditPage.vue`); matches R134's expectation that it be gone after R132.
- `src/components/PlanChecklistEditor.vue`: swapped the local `schema-fields-card` header/body wrapper for `MhCard` (`title="Checklist"`, `automation-id="plan-edit-checklist-section"`); kept the `plan-checklist-editor` class on `MhCard` (Vue merges `class` onto the root even with the component's `inheritAttrs: false`) so the pre-existing flex-sizing rule in `src/styles/schema-fields.css` (out of `Outputs` scope, not edited) keeps applying. All CRUD/reorder logic and every `plan-edit-checklist-*` automation ID are unchanged.
- `src/components/PlanChecklistEditor.test.ts`: no changes needed — it only imports/tests the exported pure helper functions (`stepTextRule`, `appendChecklistItem`, etc.), which are untouched.
- `cypress/e2e/plan.cy.ts`: updated the description-field assertions from `.find('textarea')` to `.find('input')` since `SentenceEditor` renders a single-line `v-text-field` (matching the `sentence` configurator type), not a textarea. All other automation IDs (`plan-edit-name-input`, `plan-edit-status-select`, `plan-edit-fields-section`, `plan-edit-checklist-*`, `plan-edit-back-button`) are unchanged and asserted as before.
- `README.md`: updated the **Encounter Plans Dashboard** section to describe the `CardGrid`/`DataCard` + typed-editor structure (`WordEditor`/`SentenceEditor`/`AutoSaveSelect`) and the `BreadcrumbDisplay` audit card, replacing the old `AutoSaveField`/raw-field description.

**Test results:**
- `npm run test` — ✅ 13 files / 92 tests passed (includes `PlanChecklistEditor.test.ts`, unchanged).
- `npm run build` — ✅ `vue-tsc` type-check + `vite build` succeeded with no errors.
- `npm run api`, `npm run dev`, manual `/plans/{id}` verification, `npm run cypress:run:spec -- cypress/e2e/plan.cy.ts`, `npm run container`, `npm run service`, `npm run cypress:run` — **skipped**: this execution environment has no Docker daemon (`docker ps` fails: `dial unix /var/run/docker.sock: connect: no such file or directory`) and the `mh` CLI (used by `npm run api`/`npm run service`) hangs waiting for it, so the backing mentor-api/db containers and the Vite dev server against a live API cannot be started here. No code depends on this being run in this sandbox; a follow-up run in an environment with Docker + CodeArtifact access should execute the Dev verification / E2E / Packaging verification steps before merge.

**Follow-ups for later tasks (not in R132 scope):** `src/styles/schema-fields.css` still contains now-orphaned `.schema-fields-card*`/`.schema-field-row*` rules (dead code, harmless) — out of `Outputs` scope for this task; expected to be cleaned up in R134 alongside other local card-chrome removal.
