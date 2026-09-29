# R174 – EncounterEditPage: Remove Dead API Calls After Card Cleanup

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R170  
**Description**: After R170 removes Profile and Journey data sections from the Mentee card, the `EncounterEditPage` still makes two now-unnecessary API calls (`getProfile` and `getProfileProperties`). Replace them with a single `getMentee` call. The mentee name comes from the encounter's enriched `name` field; notes, `_id`, and `plan_counts` come from `getMentee`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`

Additional input files:

- `src/pages/EncounterEditPage.vue` (as updated by R169 + R170)
- `src/api/client.ts`
- `src/api/types.ts`
- `cypress/e2e/encounter.cy.ts`

### Background

The current `EncounterEditPage` makes three API calls on load:

| Call | Endpoint | Used for |
|------|----------|----------|
| `getEncounter` | `GET /encounter/{id}` | Encounter data, `mentee_id`, enriched `name` |
| `getProfile` | `GET /profile/{id}` | `profile.display_name`, `profile.goals`, `profile.interests`, `mentee._id`, `mentee.notes` |
| `getProfileProperties` | `GET /profile/{id}/properties` | `celebrations` (recent completions), `nowResources` (sites scoped "now") |

After R169 + R170:
- `profile.goals` and `profile.interests` are removed from the page.
- `celebrations` and `nowResources` sections are removed from the page.
- `profile.display_name` is replaced by the encounter's enriched `name` field (set by the API).
- `mentee._id`, `mentee.notes`, and `mentee.plan_counts` are all available from `getMentee`.

This means `getProfile` and `getProfileProperties` are **dead calls** — their data is no longer consumed.

## Goals

- **Remove `getProfileProperties` call**: Delete the `useQuery` block for `profileProperties` and all computed properties that read from it (`recentCompletions`, `nowResources`). Delete any template references to these computed values.

- **Replace `getProfile` with `getMentee`**: 
  - Replace the `useQuery` for `profileDetail` (which calls `api.getProfile`) with a `useQuery` that calls `api.getMentee(menteeId.value)`.
  - Update the query key from `['profile', menteeId]` to `['mentee', menteeId]`.
  - Update `menteeCardModel` to spread the `getMentee` result directly (it is now flat, not nested under `.mentee`).
  - Update the `updateMentee` mutation to read `menteeDocId` from `mentee.value?._id` (the top-level result, not `profileDetail.value?.mentee._id`).
  - Update `onSuccess` invalidation to use `['mentee', menteeId.value]`.

- **Mentee display name**: Derive the display name for the profile card title from `encounter.value?.name` (the enriched encounter name field set by the API at F351). Remove any reference to `profileDetail.value?.profile.display_name`.

- **Clean up imports**: Remove `ProfileDetail`, `ProfilePropertiesResponse` from the `import type` statement in `client.ts` if they are no longer used anywhere in the file. Remove `CelebrationEntry` from the `import type` in `EncounterEditPage.vue` if no longer used.

- **Types**: Confirm `Mentee` in `src/api/types.ts` already has `plan_counts` (added in R169). No schema change needed.

### Craftsmanship Expectations

- Do not leave any `useQuery` blocks, computed values, or template bindings that reference `profileDetail` or `profileProperties` — delete them entirely.
- Do not leave dead import types.
- The `menteeId` computed stays the same (`encounter.value?.mentee_id`), only the downstream query changes.
- If `encounter.value?.name` is not available (null/undefined), fall back to `encounterDateDisplay` alone as the card title — do not add another API call.

## Testing Expectations

- **Unit tests** — `npm run test` — all existing tests pass. Update any test that mocks `api.getProfile` or `api.getProfileProperties` for the encounter page to mock `api.getMentee` instead.

- **Build check** — `npm run build` — no unused import warnings, no type errors.

- **Dev verification**
  - `npm run api` + `npm run dev`.
  - Open browser DevTools Network tab on the encounter detail page.
  - Confirm **no request** to `/profile/{id}` or `/profile/{id}/properties` is made on page load.
  - Confirm one request to `/mentee/{profile_id}` is made and the mentee card shows notes and plan counts correctly.

- **E2E tests** — `npm run cypress:run` — all existing specs pass.

- **Packaging verification**
  - `npm run container` → `npm run service` → `npm run cypress:run`.

## Outputs

- `src/pages/EncounterEditPage.vue` — replace `getProfile`/`getProfileProperties` queries with `getMentee`; remove dead computeds and imports.
- `cypress/e2e/encounter.cy.ts` — update any mock/intercept for `GET /profile/` to `GET /mentee/` where it relates to the encounter page.

The agent must not update files outside this list.

## Execution Notes

- **Planned Approach**:
  - In `src/pages/EncounterEditPage.vue`:
    - Confirm `profileProperties` query has already been removed.
    - Replace `profileDetail` query (`api.getProfile`) with `mentee` query calling `api.getMentee(menteeId.value)` under key `['mentee', menteeId]`.
    - Update `menteeTitleText` to use `encounter.value?.name`: if present, `${encounter.value.name} — ${encounterDateDisplay.value}`, falling back to `encounterDateDisplay.value`.
    - Update `planCounts` to read from `mentee.value?.plan_counts`.
    - Update `menteeCardModel` to `{ ...mentee.value }`.
    - Update `notesText` watch to track `mentee.value?.notes`.
    - Update `updateMentee` mutation: get `menteeDocId` from `mentee.value?._id`, and invalidate query key `['mentee', menteeId.value]`.
    - Update invalidations in `updateEncounter` and `finishEncounterMutation` from `['profile', menteeId.value]` to `['mentee', menteeId.value]`.
  - In `cypress/e2e/encounter.cy.ts`:
    - Verify all cypress tests and update if any mock intercepts exist.
  - Verify with unit tests and `npm run build`.

- **Implementation Summary**:
  - In `src/pages/EncounterEditPage.vue`, replaced `getProfile` and `getProfileProperties` queries with a single `getMentee` query using queryKey `['mentee', menteeId]`.
  - Derived Mentee title bar text from enriched encounter name (`encounter.value.name`) with fallback to date display.
  - Sourced `plan_counts`, `notes`, and card model directly from `mentee.value`.
  - Updated mutation invalidations to `['mentee', menteeId.value]`.
  - Verified Cypress tests in `cypress/e2e/encounter.cy.ts` have no stale `GET /profile/` intercepts.
  - Vitest unit tests (123 tests) and `vue-tsc && vite build` passed cleanly.


