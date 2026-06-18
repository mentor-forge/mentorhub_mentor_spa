# R107 – ProfileEditPage route and page shell

**Status**: Pending  
**Type**: Feature  
**Depends On**: R106  
**Description**: Replace the flat `ProfileViewPage` route with a new `ProfileEditPage` at `/profiles/:id`. The dashboard (`/profiles`) stays unchanged. This task wires routing and the page shell; section content is completed in R108 and R109.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `src/router/index.ts`
- `src/pages/ProfilesListPage.vue` — dashboard cards; no changes expected
- `src/pages/ProfileViewPage.vue` — current detail page to replace
- `tasks/PENDING.R108.profile_edit_profile_and_notes_sections.md`
- `tasks/PENDING.R109.profile_edit_encounters_section.md`

## Goals

- Route `/profiles/:id` uses `ProfileEditPage.vue` (route name `ProfileEdit`), not `ProfileViewPage`.
- Page loads data with `api.getProfile(profileId)` (returns `ProfileDetail` from R106).
- Show loading spinner, error snackbar (`useErrorHandler`), and **Back to Dashboard** → `/profiles`.
- Page heading uses the mentee display name from `profileDetail.profile` (prefer `full_name`, fall back to `name`).
- Reserve layout structure for three sections on one page (not nested routes, no Properties button):
  1. **Profile** — placeholder card/section (R108)
  2. **Notes** — placeholder card/section (R108)
  3. **Encounters** — placeholder card/section (R109)
- `ProfileViewPage.vue` is no longer registered in the router (file may remain until cleanup).
- Use `data-automation-id="profile-edit-heading"` on the page heading.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test` — existing tests still pass

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Log in as mentor (`marti`), open `/profiles`, click a card → URL is `/profiles/:id`
  - Heading shows mentee name (not "View Profile")
  - Back to Dashboard returns to `/profiles`

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/router/index.ts` — swap `ProfileView` for `ProfileEdit` at `/profiles/:id`
- `src/pages/ProfileEditPage.vue` — **new** page shell with data fetch and section placeholders

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
