# R107 – Mentee workspace routing and shell layout

**Status**: Pending  
**Type**: Feature  
**Depends On**: R106  
**Description**: Replace the flat profile detail route with a nested mentee workspace. The dashboard (`/profiles`) stays unchanged. Clicking a card opens `/profiles/:id` (mentee section). A **Properties** button appears only on the mentee section, not on the dashboard or global nav.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/router/index.ts`
- `src/pages/ProfilesListPage.vue` — dashboard cards; do not add Properties button here
- `src/pages/ProfileViewPage.vue` — current detail page to replace (may be removed from routing)
- `tasks/PENDING.R108.mentee_section_page.md` — child page this task wires in
- `tasks/PENDING.R109.properties_hub_page.md` — child page this task wires in

## Goals

- Route `/profiles/:id` uses a parent layout component (`ProfileWorkspacePage.vue`) with a nested `<router-view />`.
- Child route `''` (name `MenteeSection`) loads the mentee section page (implemented in R108).
- Child route `properties` (name `ProfileProperties`) loads the Properties hub page (implemented in R109).
- The workspace header shows the mentee name and a **Properties** button only when `route.name === 'MenteeSection'`.
- The workspace header includes **Back to Dashboard** → `/profiles`.
- Clicking **Properties** navigates to `/profiles/:id/properties` (client-side route change only).
- `ProfileViewPage.vue` is no longer registered in the router (file may remain until cleanup).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — existing tests still pass

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Log in as mentor (`marti`), open `/profiles`, click a card → URL is `/profiles/:id`
  - Confirm **Properties** button is visible on mentee section and absent on dashboard
  - Click **Properties** → URL is `/profiles/:id/properties` (child page may be empty until R109)

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/router/index.ts` — nested routes under `/profiles/:id`
- `src/pages/ProfileWorkspacePage.vue` — **new** parent shell (header, Properties button, router-view)

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
