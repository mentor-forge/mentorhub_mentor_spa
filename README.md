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
| Mentor SPA (welcome / ALB — **supported browser entry**) | **8080** | `http://<host>:8080/mentor/` |
| Mentor SPA (Vite dev or container — **direct-port debugging only**) | **8392** | `http://localhost:8392/mentor/` |
| Mentor API | **8391** | this SPA's nginx at `/mentor/api/` (and `/api/` for direct-port debug) |

> [!WARNING]
> `npm run dev` and `npm run service` both bind host port **8392** and cannot run at the same time.

The supported browser entry is `http://<host>:8080/mentor/` through Developer Edition welcome / ALB. `http://localhost:8392/mentor/` is for Cypress, OpenAPI, and debugging only. API calls from the app use `/mentor/api/` and reach `mentor_api` through this SPA's nginx.

`npm run dev` serves the app at `http://localhost:8392/mentor/`.

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

## run Vite dev server on http://localhost:8392/mentor/ (requires mentor-api profile)
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

## open SPA in browser (http://localhost:8392/mentor/)
npm run open

## build SPA docker container locally
npm run container
```

### Typical local development workflow

1. Start the API stack: `npm run api`
2. Start the Vite dev server: `npm run dev` (served at `http://localhost:8392/mentor/`)
3. Sign in via Developer Edition login (`http://127.0.0.1:8080/login.html`) when prompted
4. This SPA has no default landing page; collection browsing lives on Discovery (`http://<host>:8080/discovery/`). Root `/mentor/` and unmatched paths forward to the Discovery dashboard.

### In-App Route Table

Vue route `path` strings stay unprefixed. Vite `base: '/mentor/'` prefixes the browser URL. There is no Vue route whose path is `/mentor` — that would produce `/mentor/mentor/...`.

| Browser URL | Vue Path | Page | Description |
|---|---|---|---|
| `/mentor/` (and unmatched) | `/:pathMatch(.*)*` | `DiscoveryRedirectPage` | Forwards to `http://<host>:8080/discovery/` via `buildJourneyUrl` |
| `/mentor/profiles/:id` | `/profiles/:id` | `ProfileEditPage` | Mentee detail (profile, notes, encounters) |
| `/mentor/encounters/:id` | `/encounters/:id` | `EncounterEditPage` | Encounter detail editor |
| `/mentor/resources/new` | `/resources/new` | `ResourceNewPage` | Create learning resource |
| `/mentor/resources/:id` | `/resources/:id` | `ResourceEditPage` | Edit learning resource |
| `/mentor/paths/new` | `/paths/new` | `PathNewPage` | Create learning path |
| `/mentor/paths/:id` | `/paths/:id` | `PathEditPage` | Edit learning path |
| `/mentor/plans/new` | `/plans/new` | `PlanNewPage` | Create encounter plan |
| `/mentor/plans/:id` | `/plans/:id` | `PlanEditPage` | Edit encounter plan and checklist |
| `/mentor/admin` | `/admin` | `AdminPage` | Runtime config viewer (`admin` role required) |

**Prohibited:** CardGrid list dashboards for resources, paths, plans, or mentee profiles in this SPA. Collection browsing lives on Discovery. Do not reintroduce list pages or hard-code journey prefixes / ALB origins in application code — use `buildJourneyUrl` from spa_utils.

## Profile Edit

| Route | Page | API |
|-------|------|-----|
| `/profiles/:id` | `ProfileEditPage` — mentee detail with Profile, Notes, and Encounters sections | `GET /api/profile/{id}` → `ProfileDetail` |

Mentee collection browsing is hosted on Discovery (`/discovery/`).

**ProfileEditPage** loads composite profile detail (`profile`, `mentee`, `encounters`):

- **Profile** — read-only mentee contact and experience fields from `ProfileDetail.profile`
- **Notes** — editable mentee notes via typed, blur-to-save editors and `PATCH /api/mentee/{mentee_id}`
- **Encounters** — read-only list from `ProfileDetail.encounters`; **New Encounter** opens a plan-selection dialog, creates the encounter (server auto-fills `agenda` from plan), and navigates to `/encounters/{id}`

API client methods: `api.getProfile(profileId)`, `api.getProfileProperties(profileId)`, `api.getMentee(profileId)`, `api.updateMentee(menteeId, data)`.

E2E coverage: `cypress/e2e/profile.cy.ts` (run with `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts` while `npm run api` and `npm run dev` are running).

For E2E tests, keep the dev server running on port `8392` and the API stack up, then run `npm run cypress:run` or `npm run cypress:run:spec -- <spec-path>`.

## Paths and Resources

| Route | Page | API |
|-------|------|-----|
| `/paths/new` | `PathNewPage` — create path form | `POST /api/path` |
| `/paths/:id` | `PathEditPage` — path detail editor | `GET /api/path/{id}`, `PATCH /api/path/{id}` |
| `/resources/new` | `ResourceNewPage` — create resource form | `POST /api/resource` |
| `/resources/:id` | `ResourceEditPage` — resource detail editor | `GET /api/resource/{id}`, `PATCH /api/resource/{id}` |

Collection browsing for learning paths and resources lives on Discovery (`/discovery/paths`, `/discovery/resources`).

The Path and Resource edit pages use `DataCard` with typed, blur-to-save
editors: `WordEditor` for names and `SentenceEditor` for descriptions.
Status uses `AutoSaveSelect`. Created and last-saved audit trails are displayed
with `BreadcrumbDisplay`. "Browse Paths" and "Browse Resources" actions link to Discovery.

E2E coverage: `cypress/e2e/path.cy.ts` and `cypress/e2e/resource.cy.ts`.

## Encounter Plans

| Route | Page | API |
|-------|------|-----|
| `/plans/new` | `PlanNewPage` — create plan form | `POST /api/plan` |
| `/plans/:id` | `PlanEditPage` — plan detail editor with metadata and sequential **Steps** checklist | `GET /api/plan/{id}`, `PATCH /api/plan/{id}` |

Collection browsing for encounter plans lives on Discovery (`/discovery/plans`). `GET /api/plan` now serves the New Encounter plan picker.

**PlanNewPage** creates a plan via `POST /api/plan` and navigates to the edit page.

**PlanEditPage** renders plan metadata in a shared `DataCard` with type-aligned
`WordEditor`, `SentenceEditor`, and runtime-configured `EnumEditor` controls.
"Browse Plans" actions link to Discovery.
The **Steps** section uses shared `MhCard` chrome for the ordered `checklist`
array:

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
  api/              # Mentor domain API client (profile, mentee, path, resource, plan, encounter)
  components/       # Journey-specific UI (PlanChecklistEditor, PlanSelectDialog, admin)
  pages/            # Detail/create pages only (no collection list dashboards)
  composables/      # useAuth (spa_utils re-export), useConfig, useRoles, useDiscoveryRedirect
  stores/           # Pinia stores (UI state only)
  router/           # Auth + role guards; BASE_URL history; Discovery catch-all
  plugins/          # Vuetify
```

### Ownership Boundaries

| Layer | Owns |
|-------|------|
| **This SPA** | Mentor journey create/edit pages, page state, domain API client (`API_BASE` from Vite `base`), Discovery redirect, Plan checklist / plan-select presentation |
| **`spa_utils` 1.0.1** | Auth/JWT bootstrap, IdP redirect, `PageFrame` chrome, role-gated hamburger catalog, `hostingConfigHref` Settings destination, Token claim labels, logout `return_to` `/discovery/`, `buildJourneyUrl` / ALB origin rules, `DataCard` / typed editors |
| **Discovery SPA** | Collection browsing (`/discovery/resources`, `/discovery/paths`, `/discovery/plans`, mentee lists); this SPA must not host those lists |
| **nginx (this container)** | `/mentor/` document prefix, SPA history fallback, `/mentor/api/` → `mentor_api`, dual runtime-config paths, cache headers |
| **Mentor API** | Authorization enforcement and domain mutations; UI gating is not security |

Uses `@mentor-forge/mentorhub_spa_utils` **1.0.1** `PageFrame` as the navigation shell. Local nav config is disallowed — do not pass `navItems`, URL maps, or ALB origins. The compiled hamburger catalog is Home, Events, Resources, Paths, and Plans for authenticated mentors; Notifications and Settings are **admin-only**. Settings uses `hostingConfigHref()` and will land on this SPA’s `/config` once F156 registers that route — it is not a hamburger row this SPA configures locally. Products, Customer, and Customer Members are **not** hamburger rows. Cross-SPA drawer hrefs (except Settings) are absolute welcome/ALB `:8080` URLs from `buildJourneyUrl`, never direct debug ports (`:8392`, etc.). Logout is owned by spa_utils (`logout()` then `redirectToIdpLogin(buildJourneyUrl('discovery'))` → `/discovery/`).

### Deployment Prefix & Runtime Config Invariants

- Browser document and assets load under `/mentor/` (Vite `base` + nginx rewrite onto a flat dist root).
- HTML and `/mentor/runtime-config.js` / `/runtime-config.js` are `Cache-Control: no-store` (never `immutable`).
- Fingerprinted `/mentor/assets/*` may be `public, immutable`.
- `location ^~ /mentor/api/` wins over the static-asset regex so `/mentor/api/*.js` cannot be cached as an asset.
- Prefixed and root `runtime-config.js` serve the **same** container-generated file for this image. The Mentor SPA must not silently consume another journey's runtime config; the HTML shell must request `/mentor/runtime-config.js`.
- Runtime config is injected at container start from compose `IDP_LOGIN_URI` — it is not baked into the immutable build artifact.
- Direct-port `/` and `/mentor` redirect to `/mentor/`; `/api/` remains for direct-port debugging only.

**Note**: See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for `PageFrame`, `DataCard`, typed editors, `useResourceList`, `useErrorHandler`, `useRoles`, and related contracts.

## Key Implementation Patterns

### Authentication
- Prefer spa_utils for the full auth flow — no local `useAuth` implementation
- `src/initAuth.ts` (imported first from `main.ts`) calls `bootstrapAuthFromUrl()` then `syncAuthFromStorage()`
- JWT tokens live in localStorage (`access_token`, `token_expires_at`, `user_roles`); reactive state comes from spa_utils `useAuth()`
- `src/composables/useAuth.ts` re-exports `useAuth`, `syncAuthFromStorage`, `getStoredRoles`, and `hasStoredRole` from spa_utils for app-local imports
- Router guards and logout use spa_utils `useAuth` + `redirectToIdpLogin`; API 401 handling calls `logout()` then redirects to the IdP
- Cypress uses spa_utils `registerJwtSignTask` / `registerAuthCommands` (`cy.login`); Mentor-only helpers (`loginAsMentor`, `loginAndVisit`, drawer) remain thin wrappers over the shared JWT task

### API Client
- Located in `src/api/client.ts`
- All API calls include JWT token from localStorage
- Error handling via `ApiError` class
- Type-safe with TypeScript interfaces in `src/api/types.ts`

### Data Fetching
- Uses TanStack Query (Vue Query) for server state management
- Query keys follow pattern: `['resource', id]` or `['resources']`
- Mutations invalidate related queries on success
- Example: `useQuery({ queryKey: ['control', id], queryFn: () => api.getControl(id) })`

### Reusable Components and Composables
This template uses components and composables from `@mentor-forge/mentorhub_spa_utils@1.0.1`:
- **Navigation Shell**: `PageFrame` provides the universal navigation shell with compiled, role-gated hamburger catalog; local navigation configuration is disallowed. Home and Events are always present for authenticated users; Resources, Paths, and Plans are mentor rows that open Discovery; Notifications and Settings are admin-only. Settings is compiled to this SPA’s `/config` via `hostingConfigHref()` (route registration is F156). Products / Customer / Customer Members are not hamburger rows.
- **Components**: `DataCard`, typed editors (`WordEditor`, `SentenceEditor`,
  `EnumEditor`, `BreadcrumbDisplay`), `CardGrid`, `MhCard`, and `ListPageSearch`;
  prefer `DataCard` + typed editors for view/edit forms. `AutoSaveField` is a
  compatibility wrapper for legacy pages, and `AutoSaveSelect` remains available
  where runtime enumerators have not yet migrated
- **Composables**: `useResourceList`, `useErrorHandler`, `useRoles`, `useDiscoveryRedirect`
- **Utilities**: `formatDate`, `validationRules`

See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for complete documentation and usage examples.

### Component Architecture
- **Shell**: `PageFrame` from `spa_utils` wraps the application in `App.vue`, owning the app bar, drawer, and `v-main`.
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
- Cypress against the packaged SPA on `http://localhost:8392` (`npm run service` must be running; do not run `npm run dev` at the same time — both bind **8392**)
- Prefer `cy.visitPrefixed(...)` over raw `cy.visit` for in-app routes — it asserts `PerformanceNavigationTiming` so a Vue Router rewrite cannot mask an un-prefixed document fetch
- Specs visit prefixed routes such as `/mentor/paths/new` and **never `cy.visit('/mentor/')`** (catch-all forwards the browser to Discovery on `:8080`). Shell checks for `/mentor/` use `cy.request` in `deployment.cy.ts` only
- `cy.login()` / `cy.loginAsMentor()` seed auth on `/mentor/paths/new`; `cy.login()` with no roles is an **admin** token — use `cy.login(['mentor'])` for mentor catalog rows
- `cy.mentorMenteeProfileId()` fetches mentee profile ID via `GET /mentor/api/profile`
- Specs cover detail CRUD, spa_utils `PageFrame` chrome (mentor vs admin roles + Discovery ALB hrefs), and the nginx deployment boundary (`deployment.cy.ts`: redirects, history fallback, cache headers, runtime-config, authenticated mentor and unauthenticated `/mentor/api` proxy)
- UI role gating is UX; API authorization is proven separately via Bearer requests through `/mentor/api/`
- Run all specs: `npm run cypress:run` (headless) or `npm run cypress` (interactive)
- Run one spec: `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`

## Adding New Features

When adding a new resource or feature:

1. **Add API Types**: Extend `src/api/types.ts` with new interfaces
2. **Add API Methods**: Add methods to `src/api/client.ts`
3. **Create Pages**: Follow the appropriate pattern (New/Edit or New/View)
4. **Add Routes**: Register routes in `src/router/index.ts`
5. **Use spa_utils Components**: For edit pages with PATCH support, use `DataCard` with type-aligned editors (`WordEditor`, `SentenceEditor`, `EnumEditor`, etc.); do not introduce new `AutoSaveField` usage.
6. **Query Management**: Use Vue Query for data fetching with appropriate query keys
7. **Cache Invalidation**: Invalidate related queries in mutation `onSuccess` callbacks
8. **Error Handling**: Use `useErrorHandler` from `spa_utils` for consistent error handling
9. **Write Tests**: Add unit tests and E2E tests for new functionality (note: common components are tested in `spa_utils`)

## Automation Support

All interactive elements in this SPA include `data-automation-id` attributes following the `{domain}-{page}-{element}` naming convention.

Cypress targets spa_utils `PageFrame` ids for chrome, not local ones:

- Always present when authenticated: `nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-home-link`, `nav-events-link`, `nav-logout-link`
- Role-gated (`mentor`): `nav-resources-link`, `nav-paths-link`, `nav-plans-link`
- Role-gated (`admin`): `nav-notifications-link`, `nav-settings-link`

Do not define host `nav-*` or `app-bar-title` ids in this SPA.

## CI

`.github/workflows/docker-push.yml` builds and pushes the container image. Registry credentials and dependency policy for your org live in SRE / standards docs, not in this README.

## Configuration
- **Supported browser entry**: `http://<host>:8080/mentor/` via Developer Edition welcome / ALB
- **Direct-port debugging only**: `http://localhost:8392/mentor/`; `http://localhost:8392/` and `/mentor` redirect to `/mentor/`
- **API proxy**: client calls `/mentor/api/` (derived from Vite `base`); container nginx proxies to `http://${API_HOST}:${API_PORT}/api/` on `mentor_api` (**8391**). Direct-port `/api/` kept for debugging
- Runtime enumerators come from `GET /mentor/api/config` (or `/api/config` on the direct port), not from OpenAPI
- **Dev server**: `.env.development` sets `VITE_IDP_LOGIN_URI` for login/logout redirects (matches Dockerfile default: `http://127.0.0.1:8080/login.html`)
- **Container**: `API_HOST`, `API_PORT`, and `IDP_LOGIN_URI` at startup; same image every environment; listens on port 80 internally (e.g. `8392:80`)