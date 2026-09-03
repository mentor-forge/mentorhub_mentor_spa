# R166 – Encounter workflow E2E, packaging, and README close-out

**Status**: Pending  
**Type**: Feature  
**Depends On**: R161_mentee_page_three_datacards, R162_encounter_detail_active_readonly, R163_schedule_encounters_dialog, R164_start_encounter_button, R165_end_and_summarize_encounter  
**Description**: Finish F-RS12 documentation and Cypress so the packaged Mentor SPA covers the mentee three-card page, schedule, start-in-window, active editing, summarize, and end-to-read-only. Fix leftover New Encounter / always-editable copy and any broken automation ids from earlier tasks.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md` — Profile Edit and Encounter Detail sections
- `cypress/e2e/profile.cy.ts`
- `cypress/e2e/encounter.cy.ts`
- `src/pages/ProfileEditPage.vue`
- `src/pages/EncounterEditPage.vue`
- `tasks/PENDING.R161.mentee_page_three_datacards.md` through `tasks/PENDING.R165.end_and_summarize_encounter.md` (or their SHIPPED successors) — intended ids and flows

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)

This task is documentation and E2E/packaging close-out. Do not redesign the pages. Only change production Vue/TS if a prior task left an id or copy inconsistency that blocks the tests below.

## Goals

- README mentee page documents: name+mailto card (goals, interests, mentee notes), Encounters (`Date: {TLDR}`, Next then recently updated, date links), admin Breadcrumbs, Schedule Encounters, Start Encounter (±30 minutes on Next).
- README encounter detail documents: editable TLDR/Summary/Transcript only while in-progress; Summarize on Transcript; End Encounter then read-only. Remove leftover New Encounter / always-editable / AutoSaveField-as-primary-pattern wording for these pages.
- Cypress covers, using stable `data-automation-id`s:
  - Three mentee cards (Breadcrumbs present for admin, absent for mentor-without-admin)
  - Mailto present when the seeded mentee has email
  - Encounter rows show date link + tldr text
  - Schedule dialog fields and successful schedule (or intercept if create-many is expensive)
  - Start button hidden outside the window (unit coverage may already exist; E2E if clock control works)
  - Active encounter can edit TLDR; after End, TLDR is display-only
  - Summarize button exists on an active encounter (intercept the API)
- No remaining Cypress references to `profile-edit-new-encounter-button` unless that control still exists (it must not after R163).

### Craftsmanship Expectations

- Prefer intercepts for summarize/start/end when they depend on time windows or LLM. Do not weaken assertions to `cy.contains` without automation ids.
- Verify the real browser path (`/mentor/mentee/...`, `/mentor/encounter/...`) and `/mentor/api/` calls, not only final Vue Query cache.
- Do not reintroduce list dashboards or local nav.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **E2E (dev or container — packaging is required)**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`
- **Packaging verification** (required)
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run`

If `npm run service` port 8392 is occupied, follow the existing repo pattern: stop the conflicting Vite process or bind the image as prior shipped tasks did, and record the exact commands in Execution Notes.

## Outputs

- `README.md` — F-RS12 mentee + encounter workflow
- `cypress/e2e/profile.cy.ts` — remaining mentee-page gaps
- `cypress/e2e/encounter.cy.ts` — remaining detail-page gaps
- `src/pages/ProfileEditPage.vue` / `src/pages/EncounterEditPage.vue` — only if required to fix id/copy mismatches found while testing

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
