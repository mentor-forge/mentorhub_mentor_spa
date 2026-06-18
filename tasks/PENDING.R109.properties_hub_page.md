# R109 – Properties hub page

**Status**: Pending  
**Type**: Feature  
**Depends On**: R106, R107  
**Description**: Implement the Properties hub at `/profiles/:id/properties`. Consumes `GET /api/profile/:id/properties` and displays aggregated mentee activity (status, sites/links, mentor history, resource usage, celebrations).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/pages/ProfileWorkspacePage.vue` — parent; Properties button navigates here
- `src/api/client.ts` — `getProfileProperties` from R106
- `src/api/types.ts` — `ProfilePropertiesResponse` from R106
- `../mentorhub_mentor_api/docs/openapi.yaml` — `ProfilePropertiesResponse` schema

**Known runtime requirement**

- The mentor API container image must include the properties route. If the API returns 404, show a clear error state (not a blank page).

## Goals

- New page `ProfilePropertiesPage.vue` loads at `/profiles/:id/properties`.
- On mount, call `api.getProfileProperties(profileId)` via Vue Query.
- **Loading**: show progress indicator.
- **Success**: render panels:
  - Status summary chips (`profile_status`, `journey_status`, library/now/next counts, encounters, resources engaged)
  - Sites & links (name, scope, URL)
  - Mentor history (mentor name, encounter count)
  - Resource usage table (name, times used, status)
  - Celebrations (completed library resources)
- **Empty sections**: informational alerts when arrays are empty.
- **Error** (404, 5xx, network): visible `v-alert` with actionable message (e.g. API not deployed with properties endpoint).
- **Back to profile** button → `/profiles/:id`.
- Use `data-automation-id` values: `profile-properties-summary`, `profile-properties-sites`, `profile-properties-mentors`, `profile-properties-usage`, `profile-properties-celebrations`, `profile-properties-back-button`.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api` — **must** use mentor API build that includes properties route
  - `npm run dev`
  - Mentee section → Properties → panels render with seed data (or clear error if API missing)

- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run` — after R111 updates profile spec

## Outputs

- `src/pages/ProfilePropertiesPage.vue` — **new** Properties hub child page

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
