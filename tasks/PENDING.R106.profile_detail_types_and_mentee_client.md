# R106 – ProfileDetail types and Mentee API client

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Align SPA types and API client with the updated mentor API OpenAPI for composite profile detail and mentee notes PATCH. SPA-only; requires mentor API on `main` (L010–L040) with `GET /api/profile/{id}` returning `ProfileDetail` and `PATCH /api/mentee/{mentee_id}`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/api/types.ts`
- `src/api/client.ts`
- `src/api/Profile.client.test.ts`

External Inputs
- after running ``npm run api`` to start the backing services, use ``curl localhost:8391/docs/openapi.yaml`` to get the latest api specifications, review schemas for — `ProfileDetail`, `Profile`, `Mentee`, `MenteeUpdate`

**Out of scope for this feature**
- `GET /api/profile/{id}/properties` and any Properties hub UI 

## Goals

- Expand the `Profile` interface with OpenAPI fields used on the detail page (`full_name`, `email`, `email_verified`, `mentor_id`, `location`, `phone`, `status`, `experience`, etc.); optional fields use `?`.
- Add `Mentee`, `MenteeUpdate`, and `ProfileDetail` interfaces matching OpenAPI (`ProfileDetail` = `{ profile, mentee, encounters }`).
- Change `api.getProfile(profileId)` to return `ProfileDetail` (still `GET /api/profile/{profileId}`).
- Add `api.updateMentee(menteeId, data: MenteeUpdate)` calling `PATCH /api/mentee/{menteeId}`.
- Unit tests in `Profile.client.test.ts`:
  - `getProfile` mock returns composite shape and correct URL.
  - `updateMentee` mock sends PATCH body and correct URL.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — must pass, including updated profile client tests

- **Dev verification** (optional)
  - `npm run api`
  - `npm run dev` — app builds; no page changes yet in this task

- **Packaging verification**
  - `npm run container` — SPA image builds successfully

## Outputs

- `src/api/types.ts` — expand `Profile`; add `Mentee`, `MenteeUpdate`, `ProfileDetail`
- `src/api/client.ts` — `getProfile` return type; add `updateMentee`
- `src/api/Profile.client.test.ts` — tests for composite `getProfile` and `updateMentee`

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
