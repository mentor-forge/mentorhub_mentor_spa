# R124 – Encounter Detail Profile section

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R123  
**Description**: Implement the collapsible **Profile** section on the Encounter Detail page: read-only mentee profile fields, read-only journey activity, and editable mentor notes.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md` — `AutoSaveField`, `formatDate`
- `src/pages/EncounterEditPage.vue` — shell from R123
- `src/pages/ProfileEditPage.vue` — mentee notes autosave pattern
- `src/api/client.ts` — `getProfile`, `getProfileProperties`, `getMentee`, `updateMentee`
- `../mentorhub_mentor_api/docs/openapi.yaml` — `Profile` (`goals`, `interests`), `ProfilePropertiesResponse` (`sites_and_links`, `celebrations`), `Mentee` (`notes`, etc.)

## Goals

Within the **Profile** collapsible section (`encounter-detail-profile-section`):

### Profile data (read-only)

- Display mentee **goals** and **interests** from `ProfileDetail.profile` (chips or comma-separated list; show `—` when empty)
- Automation IDs: `encounter-detail-profile-goals`, `encounter-detail-profile-interests`

### Journey data (read-only)

- Fetch `api.getProfileProperties(menteeProfileId)` via Vue Query (`['profile-properties', menteeProfileId]`)
- **Resources completed in last 7 days**: list items from `celebrations` where `completed_at` is within the past 7 days (name + formatted date); empty state when none
  - `data-automation-id="encounter-detail-journey-recent-completions"`
- **Resources in Now**: list items from `sites_and_links` where `scope === 'now'` (name, optional url); empty state when none
  - `data-automation-id="encounter-detail-journey-now-resources"`

### Mentor notes (editable)

- Editable **Mentor Notes** field bound to mentee document `notes` via `AutoSaveField` + `PATCH /api/mentee/{mentee_id}` (use mentee document `_id` from `ProfileDetail.mentee._id`, same pattern as ProfileEditPage)
- Additional mentee note fields (focus, homework, description) are **out of scope** — only the primary **Mentor Notes** (`notes`) field on this page
- `data-automation-id="encounter-detail-mentor-notes-input"`
- Invalidate `['profile', menteeProfileId]` on successful save

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Encounter Detail → Profile section shows goals/interests, journey lists, and blur-to-save mentor notes

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterEditPage.vue` — Profile section content

The agent must not update files outside this list.

## Execution Notes

- Profile section with goals/interests, journey data from properties API, editable mentor notes.
- `npm run test`: 83/83 passed._
