# R169 – Encounter Detail: Header, Profile Title, and Buttons

**Status**: Pending  
**Type**: Feature  
**Depends On**: none (mentorhub_mentor_api L362 is Shipped — `plan_counts` is available on `GET /mentee/{profile_id}`)  
**Description**: Redesign the `EncounterEditPage` header and Mentee data card title bar. Covers the profile title line, plan counts badge, End Encounter button relocation, and Back button. Does not require R167 or R168.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`

Additional input files:

- `src/pages/EncounterEditPage.vue`
- `src/api/types.ts`
- `cypress/e2e/encounter.cy.ts`

Fetch the live Mentor API OpenAPI contract before touching any schema types:

```bash
npm run api
curl -X GET "http://localhost:8391/docs/openapi.yaml"
```

## Goals

- **Remove the page-level header row** that currently contains the `"End Encounter"` button and the `h1` heading. The page no longer needs a separate header row; the heading text moves to the Mentee data card title.

- **Profile card title bar** — In the Mentee (Profile) `DataCard` title area:
  - Display the mentee's full name and the encounter date/time (e.g., `"Jane Doe — Sep 18, 2026 10:00 AM"`).
  - Wrap the name/date in an anchor (`<a>`) that links to the mentee's `/mentee/:id` page, with `title="Open Profile"` and `data-automation-id="encounter-detail-profile-link"`.

- **Plan counts badge** — Append `(library, now, next)` counts after the date/time in the profile title line, for example `(15, 2, 30)`. Each count renders as a `<span>` with a `title` tooltip: `"Library"`, `"Now"`, `"Next"` respectively. Use `data-automation-id="encounter-detail-plan-counts"` on the wrapper. Read the counts from `mentee.plan_counts.library`, `mentee.plan_counts.now`, and `mentee.plan_counts.next` — these fields are added to `GET /mentee/{profile_id}` by API task L362. Update `src/api/types.ts` to add `plan_counts: { library: number; now: number; next: number }` to the `Mentee` TypeScript interface.


- **End Encounter button** — Move to the right side of the Mentee data card title bar. Keep `data-automation-id="encounter-detail-end-button"`.

- **Back button** — Add an icon-only button to the **left** of the End Encounter button in the Mentee card title bar. Icon: `mdi-arrow-left` (or equivalent). Tooltip: `"Back to Mentee"`. On click, navigate to `/mentee/:id` using `router.push`. Use `data-automation-id="encounter-detail-back-button"`. Remove the existing `"BACK TO PROFILE"` link element from the page entirely.

### Craftsmanship Expectations

- The page-level `h1` heading is removed; do not leave a blank header row.
- Delete the `"BACK TO PROFILE"` anchor/button — no dead markup.
- Keep all other data card sections unchanged (Goals, Interests, Notes, Checklist, etc.); those are handled in R170.

## Testing Expectations

- **Unit tests** — `npm run test` — all existing tests pass.

- **Dev verification**
  - `npm run api` + `npm run dev`.
  - Profile card title shows mentee name + date/time as a link.
  - Plan counts badge visible with correct tooltips (only if API returns the fields).
  - Back button is visible and navigates to the mentee page.
  - End Encounter button is in the Mentee card title bar (not the page header).
  - No `"BACK TO PROFILE"` text visible anywhere.

- **E2E tests** — `npm run cypress:run` — existing specs pass, then update `cypress/e2e/encounter.cy.ts`:
  - Assert `data-automation-id="encounter-detail-back-button"` is visible and navigates correctly.
  - Assert `data-automation-id="encounter-detail-end-button"` is inside the Mentee card title bar.
  - Assert `data-automation-id="encounter-detail-plan-counts"` is visible (if API supports it).

- **Packaging verification**
  - `npm run container` → `npm run service` → `npm run cypress:run`.

## Outputs

- `src/api/types.ts` — add `plan_counts: { library: number; now: number; next: number }` to the `Mentee` interface.
- `src/pages/EncounterEditPage.vue` — updated header, profile title, buttons, plan counts badge.
- `cypress/e2e/encounter.cy.ts` — updated assertions for new button placement, profile title, and plan counts badge.

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
