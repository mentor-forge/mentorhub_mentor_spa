# R141 – Profile and Encounter edit pages → `DataCard` + typed editors

**Status**: Pending  
**Type**: Feature  
**Depends On**: R135, R138  
**Description**: Convert `ProfileEditPage` and `EncounterEditPage` section chrome and `AutoSaveField` forms to spa_utils `DataCard` (`model`, `nameField`, `onSave`) with configurator-type editors (`field`, `editable`, `visible`, `automationId`). Prefer typed editors (including `EnumEditor` via provided config) over new `AutoSaveField` usage.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `EnumEditor` / runtime enumerators, `AutoSaveField` compatibility wrapper
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue` — reference composition
- `src/pages/ProfileEditPage.vue`
- `src/pages/EncounterEditPage.vue`
- `src/api/types.ts` — Profile / Mentee / Encounter field shapes
- `src/App.vue` — confirm `provideEditorConfig` from R138
- `src/components/dashboard/PlanSelectDialog.vue` — keep for new-encounter flow
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`

**OpenAPI check (field shapes):** Re-fetch `http://localhost:8391/docs/openapi.yaml` if Profile/Mentee/Encounter schemas may have changed with the companion API work; update `src/api/types.ts` only when the live contract requires it and list those files in Outputs.

## Goals

- Replace local collapsible `v-card` section shells with `DataCard` (compose via `MhCard`; use `collapsible` where sections were expandable).
- Bind editable fields with typed editors inside `DataCard`, e.g.:
  - **word** / **sentence** / **markdown** / **email** / **us_phone** as appropriate
  - **EnumEditor** / **EnumArrayEditor** for runtime enumerators (prefer over `AutoSaveSelect` when an enumerator name exists in `/api/config`)
  - **IdentifierEditor** (`editable=false`) for ObjectIds when shown
  - **BreadcrumbDisplay** for audit breadcrumbs when displayed
  - **DateTimeEditor** for editable ISO date-time fields (e.g. `Encounter.date`, `Mentee.next_appointment` if surfaced)
- Prefer typed editors over `AutoSaveField`. Keep `AutoSaveField` only where no typed editor fits yet.
- Preserve stable `data-automation-id` values (or update Cypress in the same task per spa_standards `-display` conventions).
- Keep PlanSelectDialog / New Encounter behavior on Profile edit.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Profile and Encounter detail pages load; blur/change saves still PATCH correctly

- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

## Outputs

- `src/pages/ProfileEditPage.vue` — `DataCard` + typed editors
- `src/pages/EncounterEditPage.vue` — `DataCard` + typed editors (`DateTimeEditor` where date-time fields are editable)
- `src/api/types.ts` — only if OpenAPI field sync is required
- `cypress/e2e/profile.cy.ts` — align automation IDs / assertions
- `cypress/e2e/encounter.cy.ts` — align automation IDs / assertions
- `README.md` — update Profile/Encounter docs if they still name `AutoSaveField` as the preferred pattern for these pages

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
