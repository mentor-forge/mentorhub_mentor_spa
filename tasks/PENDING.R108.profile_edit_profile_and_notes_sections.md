# R108 – Profile and Notes sections on ProfileEditPage

**Status**: Pending  
**Type**: Feature  
**Depends On**: R107  
**Description**: Implement the read-only **Profile** section and editable **Notes** section on `ProfileEditPage`. Profile data comes from `ProfileDetail.profile`; notes come from `ProfileDetail.mentee` and save via blur-to-save (`AutoSaveField`) and `PATCH /api/mentee/{mentee_id}`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/pages/ProfileEditPage.vue` — shell from R107
- `src/api/client.ts` — `getProfile`, `updateMentee`
- `src/api/types.ts` — `ProfileDetail`, `Mentee`, `MenteeUpdate`
- `src/pages/EncounterEditPage.vue` — `AutoSaveField` + `useMutation` pattern
- `../mentorhub_mentor_api/docs/openapi.yaml` — `Profile`, `Mentee`, `MenteeUpdate`

**Field notes**

- Profile fields are read-only (no PATCH on Profile in mentor API).
- Show `location`, `phone`, employer/job title from `profile.experience` when present; display `—` when absent.
- Start date: use earliest relevant date available (e.g. first role `start` in experience, or profile `created.at_time` as fallback).
- Notes editable fields map to the Mentee document (`notes` required; also show `focus`, `homework`, `description` if useful). PATCH uses `mentee._id`, not the profile id.
- Follow the same blur-to-save pattern as other edit pages: `AutoSaveField` from `@mentor-forge/mentorhub_spa_utils`, `useMutation` calling `api.updateMentee`, invalidate `['profile', profileId]` on success.

## Goals

- **Profile section** (read-only): display mentee name, status, start date, location, employer, job title, email, phone, and other useful OpenAPI profile fields.
- **Notes section** (editable): `AutoSaveField` controls for mentee notes fields; each blur triggers `PATCH /api/mentee/{mentee._id}` with the changed field.
- Section headings visible: **Profile**, **Notes**.
- `data-automation-id` values per spa_standards, e.g. `profile-edit-profile-section`, `profile-edit-notes-section`, `profile-edit-notes-input`.
- Dashboard (`ProfilesListPage.vue`) unchanged.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Mentor login → dashboard card → ProfileEditPage shows Profile and Notes sections
  - Edit notes text, blur field, refresh page — notes persist

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/ProfileEditPage.vue` — Profile and Notes sections

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
