# R123 – Encounter Detail page shell and data loading

**Status**: Pending  
**Type**: Feature  
**Depends On**: R120  
**Description**: Replace the minimal `EncounterEditPage` layout with the Encounter Detail page shell: page heading, collapsible section cards, and coordinated data loading for encounter, mentee profile, and plan.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md`
- `src/pages/EncounterEditPage.vue` — page to rewrite (keep route `/encounters/:id`)
- `src/pages/ProfileEditPage.vue` — collapsible section pattern reference
- `src/router/index.ts` — `EncounterEdit` route
- `../mentorhub_mentor_api/docs/openapi.yaml` — `Encounter`, `Plan`, `ProfileDetail`

## Page outline (target structure)

```
# {Mentee} - {Date}
## > Profile          (collapsible — implemented in R124)
## > Checklist        (collapsible — implemented in R125)
## Encounter          (always visible TLDR — implemented in R126)
## > Summary          (collapsible — implemented in R126)
## > Transcript       (collapsible — implemented in R126)
```

## Goals

- Rewrite `EncounterEditPage.vue` as the **Encounter Detail** page (filename may stay `EncounterEditPage.vue`; user-visible title is not “Edit Encounter”)
- Page heading: `{menteeDisplayName} - {encounterDate}` using `formatDate` from spa_utils
  - Mentee display name from `profile.full_name || profile.name` (fetch via `api.getProfile(encounter.mentee_id)` when `mentee_id` present)
  - Encounter date from `encounter.date` or fallback to `encounter.created.at_time`
  - `data-automation-id="encounter-detail-heading"`
- Loading and error states consistent with other edit pages
- Parallel Vue Query loads:
  - `['encounter', encounterId]` → `api.getEncounter(encounterId)`
  - `['profile', menteeId]` → `api.getProfile(menteeId)` when encounter has `mentee_id`
  - `['plan', planId]` → `api.getPlan(planId)` when encounter has `plan_id`
- Collapsible section shell (expand/collapse chevron pattern matching ProfileEditPage) with placeholder content and automation IDs:
  - `encounter-detail-profile-section`, `encounter-detail-profile-toggle`
  - `encounter-detail-checklist-section`, `encounter-detail-checklist-toggle`
  - `encounter-detail-encounter-section` (TLDR area — placeholder until R126)
  - `encounter-detail-summary-section`, `encounter-detail-summary-toggle`
  - `encounter-detail-transcript-section`, `encounter-detail-transcript-toggle`
- **Back** link to originating mentee profile when `mentee_id` is known (`/profiles/{mentee_id}`); otherwise back to `/encounters`
  - `data-automation-id="encounter-detail-back-button"`
- Remove legacy “Edit Encounter” h1, status select, and created/saved audit fields from the main layout (audit fields out of scope for this page design)

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open an existing encounter (or one created via R122 flow) — heading shows mentee name and date; section toggles expand/collapse

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterEditPage.vue` — rewrite as Encounter Detail shell

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
