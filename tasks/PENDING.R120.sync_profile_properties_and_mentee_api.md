# R120 – Sync Profile Properties and Mentee GET API from OpenAPI

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Align TypeScript types and API client methods with the latest mentor API OpenAPI spec for encounter-detail context data: `GET /api/profile/{ProfileId}/properties` (journey/activity) and `GET /api/mentee/{profile_id}` (mentee notes document).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md`
- `../mentorhub_mentor_api/docs/openapi.yaml` — verify with `npm run api` then `curl localhost:8391/docs/openapi.yaml` (or read sibling repo spec)
- `src/api/types.ts`
- `src/api/client.ts`
- `src/api/Profile.client.test.ts`

## Goals

- Add TypeScript interfaces matching OpenAPI for encounter-detail supporting data:
  - `ProfilePropertiesResponse`, `StatusSummary`, `SiteAndLink`, `ResourceUsageEntry`, `CelebrationEntry`, `MentorHistoryEntry` (and nested types as needed)
- Add `api.getProfileProperties(profileId: string): Promise<ProfilePropertiesResponse>` → `GET /api/profile/{ProfileId}/properties`
- Add `api.getMentee(profileId: string): Promise<Mentee>` → `GET /api/mentee/{profile_id}` (profile id path param per OpenAPI)
- Confirm existing `Encounter`, `EncounterInput`, `EncounterUpdate`, and `Plan` types still match OpenAPI (`mentor_id`, `mentee_id`, `plan_id`, `date`, `tldr`, `summary`, `transcript`, `Plan.checklist`)
- Unit tests cover new client methods with mocked responses including `sites_and_links` (scope `library` | `now` | `next`) and `celebrations` with `completed_at`

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `curl -H "Authorization: Bearer $TOKEN" localhost:8391/docs/openapi.yaml | head` — confirm spec is served
  - `curl -H "Authorization: Bearer $TOKEN" localhost:8391/api/profile/{ProfileId}/properties` — confirm properties payload shape for a seeded mentee

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/api/types.ts` — add Profile Properties and related interfaces
- `src/api/client.ts` — add `getProfileProperties`, `getMentee`
- `src/api/Profile.client.test.ts` — tests for new methods

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
