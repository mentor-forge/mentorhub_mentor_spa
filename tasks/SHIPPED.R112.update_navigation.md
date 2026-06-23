# R112 – Update navigation drawer

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Refactor the mentor SPA navigation drawer to match `Specifications/features.md` — simplified top-level links only.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub/Specifications/features.md` — Update navigation item
- `src/App.vue`
- `cypress/e2e/navigation.cy.ts`

External Inputs

- After running `npm run api`, use `curl localhost:8391/docs/openapi.yaml` to confirm backing API routes (navigation is SPA-only; no new endpoints).

## Goals

- Navigation drawer shows only:
  - **Dashboard** → `/profiles`
  - **Resources** → `/resources`
  - **Learning Paths** → `/paths`
  - **Encounter Plans** → `/plans`
  - **Admin** → `/admin` (visible when role contains `admin`)
  - **Logout** → IdP login redirect (existing `handleLogout`)
- Remove domain subheaders and list/new links for Resources, Paths, Plans, Encounters, and Events from the drawer.
- Use `data-automation-id` values: `nav-dashboard-link`, `nav-resources-link`, `nav-learning-paths-link`, `nav-encounter-plans-link`, `nav-admin-link`, `nav-logout-link`.
- Update `cypress/e2e/navigation.cy.ts` for the new drawer structure.

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open drawer → verify six items (Admin only for admin user)
  - Each link navigates to the correct list page

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/App.vue` — simplified navigation drawer
- `cypress/e2e/navigation.cy.ts` — updated drawer assertions

The agent must not update files outside this list.

## Execution Notes

- Simplified `src/App.vue` drawer: four top-level links (Dashboard, Resources, Learning Paths, Encounter Plans) plus Admin/Logout in append slot; removed domain subheaders and list/new links.
- Updated `cypress/e2e/navigation.cy.ts` for new automation IDs and navigation flows; asserts domain subheaders no longer appear.
- `npm run test`: 80/80 passed; `npm run build` succeeded.
- `npm run container` not run — AWS SSO token expired in this environment.
