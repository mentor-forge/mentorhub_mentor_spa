# R131 – Profile and Encounter edit pages → `DataCard` + typed editors

**Status**: Run as needed — superseded by R135–R144 (spa_utils 0.5.5). Do not execute.  
**Type**: Feature  
**Depends On**: R128  
**Superseded**: Replaced by the R135–R144 spa_utils **0.5.5** task series. Do not execute this file.

**Description**: Convert `ProfileEditPage` and `EncounterEditPage` section chrome and `AutoSaveField` forms to spa_utils `DataCard` (`model`, `nameField`, `onSave`) with configurator-type editors (`field`, `editable`, `visible`, `automationId`). Prefer typed editors over new `AutoSaveField` usage; keep `AutoSaveField` only where a typed editor does not fit yet.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — `DataCard`, typed editors, `AutoSaveField` compatibility wrapper
- `../mentorhub_spa_utils/demo/pages/EditorsPage.vue` — reference composition
- `src/pages/ProfileEditPage.vue`
- `src/pages/EncounterEditPage.vue`
- `src/api/types.ts` — Profile / Mentee / Encounter field shapes
- `src/components/dashboard/PlanSelectDialog.vue` — keep for new-encounter flow
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`

## Goals

- Replace local collapsible `v-card` section shells on Profile and Encounter edit pages with `DataCard` (compose via `MhCard`; use `collapsible` where sections were expandable).
- Bind editable fields with typed editors inside `DataCard` using `field` + injected context (`onSave`), e.g.:
  - **word** / **sentence** / **markdown** / **email** / **us_phone** as appropriate for profile/mentee notes fields
  - **IdentifierEditor** (`editable=false`) for ObjectIds when shown
  - **BreadcrumbDisplay** for audit breadcrumbs when displayed
- Prefer typed editors over `AutoSaveField`. Existing `AutoSaveField` remains supported as a compatibility wrapper — do not mass-rename leftover wrappers outside these pages.
- Use structured **`DateTimeEditor`** for ISO date-time fields that are editable (e.g. `Encounter.date`, `Mentee.next_appointment` if surfaced for edit). Do **not** ask users to type raw ISO wire formats. Use **`DurationEditor`** only if a duration-typed field appears on these pages (none identified in current types — skip unless present).
- Preserve stable `data-automation-id` values (or update Cypress in the same task when IDs must change per spa_standards `-display` / input conventions).
- Keep PlanSelectDialog / New Encounter behavior on Profile edit.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`
  - `npm run build`
  - Update or add page/component unit tests if Profile/Encounter page tests exist or logic moves

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
- `cypress/e2e/profile.cy.ts` — align automation IDs / assertions
- `cypress/e2e/encounter.cy.ts` — align automation IDs / assertions
- `README.md` — update Profile/Encounter docs if they still name `AutoSaveField` as the preferred pattern for these pages

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
