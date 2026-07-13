# Mentor Hub — Mentor SPA

This repository contains a Vue 3 single-page application (SPA) for the mentor service.

## Prerequisites
- Mentor Hub [Developers Edition](https://github.com/mentor-forge/mentorhub/blob/main/CONTRIBUTING.md)
- Developer [SPA Standard Prerequisites](https://github.com/mentor-forge/mentorhub/blob/main/DeveloperEdition/standards/spa_standards.md)

## Quick Start

```sh
## Containerized stack (db + api + spa)
npm run service

## Local Vite dev (API + welcome/login on :8080 must be running)
npm run api
npm run dev
```

| Service | Port | URL |
|---------|------|-----|
| Developer Edition login (IdP) | **8080** | `http://127.0.0.1:8080/login.html` |
| Mentor SPA (Vite dev or container) | **8392** | `http://localhost:8392` |
| Mentor API | **8391** | proxied via SPA at `/api` |

## Developer Commands

```sh
## install dependencies (Node >= 24)
npm install

## reproducible install including devDependencies
npm ci --include=dev

## install Cypress binaries (after npm install when cypress version changes)
npx cypress install

## package code for deployment
npm run build

## preview production build locally
npm run preview

## run Vite dev server on http://localhost:8392 (requires mentor-api profile)
npm run api
npm run dev

## run unit tests
npm run test

## run unit tests with coverage
npm run test:coverage

## run unit tests with Vitest UI
npm run test:ui

## open Cypress E2E test runner (interactive)
npm run cypress

## run all Cypress E2E tests headlessly
npm run cypress:run

## run one Cypress spec headlessly
npm run cypress:run:spec -- cypress/e2e/profile.cy.ts

## Developer Edition: stop stack, then start db + mentor-api only
npm run api

## Developer Edition: stop stack, start db + api + spa container, open browser
npm run service

## open SPA in browser (http://localhost:8392)
npm run open

## build SPA docker container locally
npm run container
```

### Typical local development workflow

1. Start the API stack: `npm run api`
2. Start the Vite dev server: `npm run dev`
3. Sign in via Developer Edition login (`http://127.0.0.1:8080/login.html`) when prompted
4. Default landing page is the **Mentor Dashboard** at `/profiles`

## Mentor Dashboard and Profile Edit

| Route | Page | API |
|-------|------|-----|
| `/profiles` | `ProfilesListPage` — mentee cards for the logged-in mentor | `GET /api/profile` |
| `/profiles/:id` | `ProfileEditPage` — mentee detail with Profile, Notes, and Encounters sections | `GET /api/profile/{id}` → `ProfileDetail` |

**ProfileEditPage** loads composite profile detail (`profile`, `mentee`, `encounters`):

- **Profile** — read-only mentee contact and experience fields from `ProfileDetail.profile`
- **Notes** — editable mentee notes via blur-to-save (`AutoSaveField`) and `PATCH /api/mentee/{mentee_id}`
- **Encounters** — read-only list from `ProfileDetail.encounters`; **New Encounter** opens a plan-selection dialog, creates the encounter (server auto-fills `agenda` from plan), and navigates to `/encounters/{id}`

API client methods: `api.getProfiles()`, `api.getProfile(profileId)`, `api.getProfileProperties(profileId)`, `api.getMentee(profileId)`, `api.updateMentee(menteeId, data)`.

E2E coverage: `cypress/e2e/profile.cy.ts` (run with `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts` while `npm run api` and `npm run dev` are running).

For E2E tests, keep the dev server running on port `8392` and the API stack up, then run `npm run cypress:run` or `npm run cypress:run:spec -- <spec-path>`.

## Encounter Plans Dashboard

| Route | Page | API |
|-------|------|-----|
| `/plans` | `PlansListPage` — encounter plan cards with name, description, and step count | `GET /api/plan` |
| `/plans/:id` | `PlanEditPage` — plan detail editor with metadata and sequential **Steps** checklist | `GET /api/plan/{id}` |

**PlansListPage** shows all plans as clickable cards (no search or pagination). **New Plan** opens a dialog to enter a plan name, creates the plan via `POST /api/plan`, and navigates to the edit page.

**PlanEditPage** loads plan metadata (`name`, `description`, `status`) with blur-to-save (`AutoSaveField` / `AutoSaveSelect`) and a **Steps** section for the ordered `checklist` array:

- **Add** — rapid-input field or **+** button appends a step (empty steps allowed) and PATCHes the full `checklist`
- **Edit** — inline blur-to-save per step text
- **Delete** — removes a step and PATCHes the remaining array
- **Reorder** — drag handle per step persists the new sequence via `PATCH /api/plan/{id}` with `{ checklist: string[] }`
- **Audit metadata** — Created / Created By / Last Saved / Last Saved By fields are visible only to users with the `admin` role

API client methods: `api.getPlans()`, `api.getPlan(planId)`, `api.createPlan(data)`, `api.updatePlan(planId, data)`.

E2E coverage: `cypress/e2e/plan.cy.ts`.

## Encounter Detail

| Route | Page | API |
|-------|------|-----|
| `/encounters/:id` | `EncounterEditPage` — Encounter Detail with Profile, Checklist, TLDR, Summary, and Transcript sections | `GET /api/encounter/{id}`, `GET /api/profile/{id}`, `GET /api/profile/{id}/properties`, `PATCH /api/encounter/{id}`, `PATCH /api/mentee/{id}` |

**Encounter Detail** page layout:

- **Profile** (collapsible) — read-only goals/interests and journey activity (recent completions, resources in Now); editable mentor notes
- **Checklist** (collapsible) — `encounter.agenda` items (server-filled from plan checklist); checked state persisted via PATCH
- **Encounter** — TLDR one-sentence summary (always visible, autosave)
- **Summary** / **Transcript** (collapsible) — large textarea autosave fields

**New Encounter** flow from Profile Detail: select a plan → `POST /api/encounter` with required `mentor_id`, `mentee_id`, and `plan_id` → navigate to detail page.

E2E coverage: `cypress/e2e/encounter.cy.ts`, `cypress/e2e/profile.cy.ts`.

## Architecture Overview

```
src/
  api/              # API client layer (types.ts, client.ts)
  components/       # App-specific UI components (admin components)
  pages/            # Route-level components (List, New, Edit/View pages)
  composables/      # App-specific composables (useAuth, useConfig, useRoles wrapper)
  stores/           # Pinia stores (UI state only)
  router/           # Vue Router configuration
  plugins/          # Vuetify plugin configuration
```

**Note**: This template uses `@mentor-forge/mentorhub_spa_utils` for reusable components, composables, and utilities. See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for complete documentation on available components (`AutoSaveField`, `AutoSaveSelect`, `ListPageSearch`), composables (`useResourceList`, `useErrorHandler`, `useRoles`), and utilities (`formatDate`, `validationRules`).

## Key Implementation Patterns

### Authentication
- JWT tokens stored in localStorage (`access_token`, `token_expires_at`)
- `useAuth()` composable manages authentication state
- Sign-in uses IdP / URL hash (`bootstrapAuthFromUrl` from spa_utils); APIs are not used as a login surface
- Router guards protect routes requiring authentication

### API Client
- Located in `src/api/client.ts`
- All API calls include JWT token from localStorage
- Error handling via `ApiError` class
- Type-safe with TypeScript interfaces in `src/api/types.ts`

### Data Fetching
- Uses TanStack Query (Vue Query) for server state management
- Query keys follow pattern: `['resource', id]` or `['resources']`
- Mutations invalidate related queries on success
- Use `useResourceList` composable from `spa_utils` for list pages with search support
- Example: `useQuery({ queryKey: ['control', id], queryFn: () => api.getControl(id) })`

### Reusable Components and Composables
This template uses components and composables from `@mentor-forge/mentorhub_spa_utils`:
- **Components**: `AutoSaveField`, `AutoSaveSelect`, `ListPageSearch`
- **Composables**: `useResourceList`, `useErrorHandler`, `useRoles`
- **Utilities**: `formatDate`, `validationRules`

See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for complete documentation and usage examples.

### Component Architecture
- **Pages**: Own routing, data fetching, and mutations. Pass data + callbacks to components.
- **Components**: App-specific components (admin components). Reusable components come from `spa_utils`.
- **Composables**: App-specific logic (authentication, config). Reusable composables come from `spa_utils`.
- **Stores**: UI-only state (loading, error messages, etc.)

## Testing

### Unit Tests
- Uses Vitest for unit testing
- Test coverage target: 90%
- Tests cover: API client, composables, and components
- Run tests: `npm run test`
- Coverage report: `npm run test:coverage`

### E2E Tests
- Uses Cypress for end-to-end testing
- Tests cover main user flows: authentication, CRUD operations per domain, and the **Mentor Dashboard**
- Dashboard specs use `cy.loginAsMentor()` (seeded mentor user `marti`) to exercise `GET /api/profile`
- Run all specs: `npm run cypress:run` (headless) or `npm run cypress` (interactive)
- Run one spec: `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
- Requires dev server (`npm run dev`) and API stack (`npm run api`) to be running

## Adding New Features

When adding a new resource or feature:

1. **Add API Types**: Extend `src/api/types.ts` with new interfaces
2. **Add API Methods**: Add methods to `src/api/client.ts`
3. **Create Pages**: Follow the appropriate pattern (List/New/Edit or List/New/View)
4. **Add Routes**: Register routes in `src/router/index.ts`
5. **Use spa_utils Components**: For edit pages with PATCH support, use `AutoSaveField`/`AutoSaveSelect` from `spa_utils`. For list pages, use `useResourceList` and `ListPageSearch`.
6. **Query Management**: Use Vue Query for data fetching with appropriate query keys
7. **Cache Invalidation**: Invalidate related queries in mutation `onSuccess` callbacks
8. **Error Handling**: Use `useErrorHandler` from `spa_utils` for consistent error handling
9. **Write Tests**: Add unit tests and E2E tests for new functionality (note: common components are tested in `spa_utils`)

## Automation Support

All interactive elements in this SPA include `data-automation-id` attributes following the `{domain}-{page}-{element}` naming convention.

## CI

`.github/workflows/docker-push.yml` builds and pushes the container image. Registry credentials and dependency policy for your org live in SRE / standards docs, not in this README.

## Configuration
- Runtime configuration available at `/api/config` endpoint
- Use enumerator values from config, not hardcoded in OpenAPI spec
- **Dev server**: `.env.development` sets `VITE_IDP_LOGIN_URI` for login/logout redirects (matches Dockerfile default: `http://127.0.0.1:8080/login.html`)
- **Container**: `API_HOST` and `API_PORT` environment variables configure the NGINX API proxy; listens on port 80 internally (map host port to container port 80, e.g. `8392:80` in docker-compose)