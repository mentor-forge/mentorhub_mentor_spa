# R106 – Profile types and Properties API client

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Add TypeScript types and an API client method for the mentee Properties hub response. This task is SPA-only; the backing mentor API must expose `GET /api/profile/{id}/properties` before runtime verification succeeds (coordinate with `../mentorhub_mentor_api`).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_mentor_api/docs/openapi.yaml` — confirm or request `ProfilePropertiesResponse` and nested schemas
- `src/api/types.ts`
- `src/api/client.ts`
- `src/api/Profile.client.test.ts`

**External dependency (not in this repo)**

- `../mentorhub_mentor_api` must implement `GET /api/profile/<id>/properties` and publish an updated container image (or run `pipenv run dev` from a branch that includes the route) before Properties E2E can pass against a live API.

## Goals

- The `Profile` interface includes fields needed by the mentee section (`email`, `mentor_id`, `location`, `phone`, etc.) matching OpenAPI where defined; optional fields use `?`.
- New interfaces exist for the Properties hub payload: `ProfilePropertiesResponse`, `StatusSummary`, `SiteAndLink`, `MentorHistoryEntry`, `ResourceUsageEntry`, `CelebrationEntry`.
- `api.getProfileProperties(profileId)` calls `GET /api/profile/{profileId}/properties` via the existing `request()` helper.
- Unit test in `Profile.client.test.ts` mocks a successful properties response and asserts the correct URL and return shape.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — must pass, including new `getProfileProperties` test

- **Dev verification** (optional until API endpoint ships)
  - `npm run api` — start db + mentor API containers
  - `npm run dev` — confirm app builds; properties call will fail with 404 until API is updated

- **Packaging verification**
  - `npm run container` — SPA image builds successfully

## Outputs

- `src/api/types.ts` — expand `Profile`; add Properties hub interfaces
- `src/api/client.ts` — add `getProfileProperties(profileId: string)`
- `src/api/Profile.client.test.ts` — test `getProfileProperties` mock fetch

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
