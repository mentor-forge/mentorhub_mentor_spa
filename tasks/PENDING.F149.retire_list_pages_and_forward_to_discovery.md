# F149 – Retire the Resource, Path, and Mentor Dashboard list pages; forward unmatched routes to Discovery

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F148_pin_spa_utils_1_0_0`  
**Description**: Delete `ResourcesListPage.vue`, `PathsListPage.vue`, and `ProfilesListPage.vue` (the Mentor Dashboard, now served by Discovery), their `/resources`, `/paths`, and `/profiles` routes, the local `useOffsetList` composable, the `getResources` / `getPaths` / `getProfiles` client methods, the dead Event-domain cursor surface, their Cypress coverage, and their drawer rows. This SPA keeps only **detail / edit / create** pages that Discovery cards deep-link into, so it no longer has a default route: `/` and any unmatched path forward out to the Discovery dashboard. Repoint every "Back to List" / "Back to Dashboard" action to Discovery with `buildJourneyUrl` (available now that F148 pinned 1.0.0). Plans are **F150**; route `path` strings stay unprefixed — Vite `base` is F152.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — `data-automation-id` convention `{domain}-{page}-{element}`
- `../mentorhub_spa_utils/README.md` — **List cards** ("Discovery is the only journey SPA that hosts CardGrid list dashboards; other journey SPAs keep detail, edit, and create pages that Discovery cards and universal nav target"); **Cross-SPA URLs** (`buildJourneyUrl`, `JOURNEY_APP_PATHS`, `resolveAlbOrigin`); **Removed: infinite-scroll list APIs**
- `../mentorhub_spa_utils/src/utils/journeyUrls.ts` — `buildJourneyUrl('discovery')` yields `{albOrigin}/discovery/`; `JOURNEY_APP_PATHS.home` is the same target
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F148.pin_spa_utils_1_0_0.md` — wave-ordering rationale
- `src/router/index.ts` — today `/` redirects to `/profiles` and `/encounters` redirects to `/profiles`; routes `/resources`, `/resources/new`, `/resources/:id`, `/paths`, `/paths/new`, `/paths/:id`, `/plans`, `/plans/:id`, `/encounters/:id`, `/profiles`, `/profiles/:id`, `/admin`; role-gate fallback is `next({ name: 'Profiles' })`
- `src/App.vue` — local app bar and drawer with `nav-dashboard-link`, `nav-resources-link`, `nav-learning-paths-link`, `nav-encounter-plans-link`, `nav-admin-link`, `nav-logout-link`
- `src/pages/ResourcesListPage.vue`, `src/pages/PathsListPage.vue` — CardGrid + `ListPageSearch` dashboards being deleted
- `src/pages/ProfilesListPage.vue` — the Mentor Dashboard (`GET /api/profile` mentee cards) being deleted
- `src/composables/useOffsetList.ts` — local TanStack `useInfiniteQuery` wrapper; the resource and path pages are its only consumers
- `src/api/client.ts` — `getResources(params?: ResourceListParams)` and `getPaths(params?: ListParams)` send `offset` / `size` request headers and return plain arrays; `getProfiles()` returns the dashboard cards; `getPlans` uses the same list helpers and **stays** (see below); `getEvents` / `getEvent` / `createEvent` are dead Event-domain code
- `src/api/types.ts` — `ListParams`, `ResourceListParams`, `MentorDashboardProfile` (with `JourneyProgress` and `RecentEncounterSummary`, which nothing else references), and the Event domain (`Event`, `EventInput`, `InfiniteScrollParams`, `InfiniteScrollResponse`)
- `src/api/Resource.client.test.ts`, `src/api/Path.client.test.ts`, `src/api/Profile.client.test.ts`, `src/api/Event.client.test.ts`, `src/api/types.test.ts`
- `src/pages/ResourceEditPage.vue`, `src/pages/PathEditPage.vue` — kept; each has a `*-edit-back-button` calling `router.push('/resources')` / `router.push('/paths')`
- `src/pages/ProfileEditPage.vue` — kept (Discovery dashboard card target); has `profile-edit-back-button` ("Back to Dashboard") calling `router.push('/profiles')`
- `src/pages/EncounterEditPage.vue` — kept; `goBack` pushes `/profiles/{menteeId}` when a mentee is known and falls back to `router.push('/profiles')`, with `backLabel` switching between "Back to Profile" and "Back to Dashboard"
- `src/pages/ResourceNewPage.vue`, `src/pages/PathNewPage.vue` — kept create pages; Cancel uses `router.back()`
- `src/pages/AdminPage.vue` — kept
- `src/components/dashboard/DashboardPageLayout.vue` — used by `ProfilesListPage.vue` **and** `PlansListPage.vue`; it survives this task and is deleted in F150 with the plans dashboard
- `cypress/e2e/resource.cy.ts`, `cypress/e2e/path.cy.ts`, `cypress/e2e/navigation.cy.ts`, `cypress/e2e/profile.cy.ts`, `cypress/e2e/encounter.cy.ts`
- `cypress/support/commands.ts` — `loginAsMentor(visitPath = '/')` signs a `['mentor','admin']` JWT for the seeded mentor (`MENTOR_DASHBOARD_USER`, `marti`) via the spa_utils `signCypressJwt` task
- `vitest.config.ts` — coverage thresholds for `src/api/**`, `src/composables/**`, `src/components/**`

**Source issue**: F-RS16, plus the follow-up decision that **Discovery now serves the mentor dashboard at its default route**. Mentors find their mentees, learning resources, paths, and plans on Discovery (`/discovery/`, `/discovery/resources`, `/discovery/paths`, `/discovery/plans`); this SPA exists only for the detail, edit, and create pages those cards target.

**External prerequisite**: the Discovery dashboard must already host the mentor's mentee list. That is the premise of this task — do not build a replacement dashboard here, and do not read or change the Discovery repo.

### Locked route decisions

Vue route `path` strings stay **unprefixed** in this task. The browser URLs in the left column are what F152/F153 produce once `base: '/mentor/'` ships. Vite `base` prefixes every browser URL without touching route `path` strings, so nothing decided here is re-prefixed later.

| Browser URL (after F152–F153) | Vue path | Page | Owner |
|---|---|---|---|
| `http://<host>:8080/mentor/` and anything unmatched | `/:pathMatch(.*)*` | `DiscoveryRedirectPage.vue` — forwards to `http://<host>:8080/discovery/` | **new in this task** |
| `http://<host>:8080/mentor/profiles/{id}` | `/profiles/:id` | `ProfileEditPage.vue` (Discovery dashboard card target) | kept |
| `http://<host>:8080/mentor/encounters/{id}` | `/encounters/:id` | `EncounterEditPage.vue` | kept |
| `http://<host>:8080/mentor/resources/new` | `/resources/new` | `ResourceNewPage.vue` | kept |
| `http://<host>:8080/mentor/resources/{id}` | `/resources/:id` | `ResourceEditPage.vue` (Discovery resource card target) | kept |
| `http://<host>:8080/mentor/paths/new` | `/paths/new` | `PathNewPage.vue` | kept |
| `http://<host>:8080/mentor/paths/{id}` | `/paths/:id` | `PathEditPage.vue` (Discovery path card target) | kept |
| `http://<host>:8080/mentor/plans/new` | `/plans/new` | `PlanNewPage.vue` | **added in F150** |
| `http://<host>:8080/mentor/plans/{id}` | `/plans/:id` | `PlanEditPage.vue` (Discovery plan card target) | kept |
| `http://<host>:8080/mentor/admin` | `/admin` | `AdminPage.vue` (runtime-config viewer, `requiresRole: 'admin'`) | kept |

**Removed in this task**: `/resources`, `/paths`, `/profiles`, the `/` → `/profiles` redirect, and the `/encounters` → `/profiles` redirect. **Removed in F150**: `/plans`.

Three decisions are locked here so a later task does not churn them:

- **This SPA has no home page.** Discovery's default route is the mentor dashboard, so do not keep, rebuild, or rename a local mentee list, and do not point `/` at a detail page. Everything that used to land on `/profiles` now leaves for Discovery.
- **One catch-all handles `/`, the old redirects, and unknown paths.** A single `/:pathMatch(.*)*` route rendering `DiscoveryRedirectPage.vue` covers all three cases; do not add separate redirect routes per legacy path. The catch-all carries **no** `requiresAuth` meta — an unauthenticated visitor should be forwarded to Discovery, not bounced through this SPA's IdP guard.
- **`/admin` keeps its path.** Under the `/mentor/` base it reads as `/mentor/admin`, so it does not collide with the Admin journey prefix. Do not rename it.

### Leaving for Discovery

Every outbound target uses the same helper the `PageFrame` hamburger uses:

```typescript
import { buildJourneyUrl } from '@mentor-forge/mentorhub_spa_utils'

const dashboardHref = buildJourneyUrl('discovery')            // {origin}/discovery/
const browseResourcesHref = buildJourneyUrl('discovery', 'resources')
const browsePathsHref = buildJourneyUrl('discovery', 'paths')
```

These are absolute welcome / ALB hrefs on `:8080`, not Vue Router `to` targets — they leave this SPA. Use an anchor (`:href`) for links and `window.location.replace(...)` / `assign(...)` for programmatic forwards, never `router.push`. Do not hardcode an origin, a direct SPA debug port, or the IdP host.

Put the programmatic forward in one place — `src/composables/useDiscoveryRedirect.ts` exporting `redirectToDiscoveryDashboard()` — so the catch-all page and the router role gate share it and it can be unit-tested. `src/pages/**` and `src/router/**` are excluded from coverage; `src/composables/**` is not, which is the other reason the logic lives there.

### Cypress can no longer seed auth on `/`

`cypress/support/e2e.ts` calls `registerAuthCommands({ visitPath: '/' })`, and `loginAsMentor` defaults to `'/'` as well, so every `cy.login()` currently seeds `localStorage` by visiting the root. Once `/` forwards to Discovery on `:8080`, that first visit navigates cross-origin and every spec fails before its own `cy.visit`. Point both at a benign, same-origin, authenticated page that fetches nothing and renders immediately — **`/paths/new`** is the natural choice because it survives this whole wave. Do not use `/`, `/admin` (role-gated, so a non-admin token would be forwarded straight back out), or a detail route that needs a seeded id.

### Cypress can no longer click its way to a profile

Both the profile and encounter specs currently reach `ProfileEditPage` by clicking a dashboard card. With the dashboard gone they must visit `/profiles/{id}` directly, and the id has to come from somewhere. Resolve it at runtime instead of hardcoding seed data: `GET /api/profile` still exists **server-side** on the Mentor API (only the SPA client method is being deleted), so add a Cypress support helper that signs the seeded mentor JWT with the existing `signCypressJwt` task and `cy.request`s that endpoint for the first mentee `_id`. Keep the request path un-prefixed here — F154 re-points it to `/mentor/api/profile` with everything else.

The outbound forward itself is **not** e2e-testable from this repo: Cypress `baseUrl` is `http://localhost:8392` and Discovery answers on `:8080`, a different origin, and Discovery is not part of this SPA's compose stack. Cover the forward with the `useDiscoveryRedirect` unit test and record the e2e gap in **Execution Notes** rather than adding `cy.origin` machinery or asserting a cross-origin URL.

### Keep `getPlans`

`src/components/dashboard/PlanSelectDialog.vue` calls `api.getPlans()` for the New Encounter flow, so `getPlans`, `ListParams`, `listHeaders`, and `appendListQuery` all **stay** in `src/api/client.ts` — in this task and in F150, when `PlansListPage.vue` is deleted. Only `ResourceListParams` (used exclusively by `getResources`) is removed.

### Dead Event-domain code goes with the list surface

`GET /event` is the last contract in this SPA carrying the cursor fields (`after_id`, `limit`, `has_more`, `next_cursor`) that spa_utils **1.0.0** bans from SPA ↔ API contracts. The Event pages and routes were already removed (`SHIPPED.R113.remove_event_pages_and_routes.md`), so `getEvents`, `getEvent`, and `createEvent` have no callers. Remove them here with the rest of the list surface rather than leaving a banned contract shape in `src/api/`.

## Goals

- `src/pages/ResourcesListPage.vue`, `src/pages/PathsListPage.vue`, and `src/pages/ProfilesListPage.vue` are deleted, and no source, test, or Cypress file references them or their `resource-list-*` / `path-list-*` / `profile-dashboard-*` automation ids.
- `src/composables/useOffsetList.ts` is deleted — the resource and path pages were its only consumers. A grep for `useOffsetList` across `src/` and `cypress/` returns nothing.
- `src/composables/useDiscoveryRedirect.ts` exports `redirectToDiscoveryDashboard()`, which calls `window.location.replace(buildJourneyUrl('discovery'))`. `src/composables/useDiscoveryRedirect.test.ts` asserts the built URL and that navigation is a replace, not a `router.push`, keeping the `src/composables/**` thresholds satisfied.
- `src/pages/DiscoveryRedirectPage.vue` forwards on mount via `redirectToDiscoveryDashboard()` and renders a minimal "Returning to the Discovery dashboard" placeholder (a `v-container` with a progress indicator) so there is no blank frame during the hop. It fetches nothing and reads no route params.
- `src/router/index.ts` matches the locked route table above minus the F150 rows:
  - the `/` → `/profiles` redirect, the `/encounters` → `/profiles` redirect, and the `/resources`, `/paths`, and `/profiles` list routes are gone,
  - a final `/:pathMatch(.*)*` route (name `DiscoveryRedirect`, no `requiresAuth`) renders `DiscoveryRedirectPage.vue`,
  - `/profiles/:id`, `/resources/new`, `/resources/:id`, `/paths/new`, `/paths/:id`, `/plans`, `/plans/:id`, `/encounters/:id`, and `/admin` are otherwise untouched,
  - the `requiresRole` fallback no longer targets a local route: call `redirectToDiscoveryDashboard()` and then `next(false)`. Never render a gated page to a user without the role.
  - `createWebHistory()` stays as-is and the unauthenticated guard still calls `redirectToIdpLogin(window.location.origin + to.fullPath)` — F152 owns the base.
- `src/api/client.ts` no longer has `getResources`, `getPaths`, `getProfiles`, `getEvents`, `getEvent`, or `createEvent`. Everything else is unchanged: `getConfig`, `getResource`, `createResource`, `updateResource`, `getPath`, `createPath`, `updatePath`, `getPlans`, `getPlan`, `createPlan`, `updatePlan`, `getEncounter`, `createEncounter`, `updateEncounter`, `getProfile`, `getProfileProperties`, `getMentee`, and `updateMentee` keep their current signatures and behavior, including the `Authorization` header, the `401` logout-and-redirect path, and the `204` / empty-body handling. `listHeaders` and `appendListQuery` remain, now serving `getPlans` only.
- `src/api/types.ts` no longer declares `ResourceListParams`, `MentorDashboardProfile`, `JourneyProgress`, `RecentEncounterSummary`, `Event`, `EventInput`, `InfiniteScrollParams`, or `InfiniteScrollResponse`. `ListParams` **stays** for `getPlans`, and `Profile`, `ProfileDetail`, `Mentee`, and `ProfilePropertiesResponse` are untouched. A grep for `after_id`, `has_more`, `next_cursor`, and `InfiniteScroll` across `src/`, `cypress/`, and `tests/` returns nothing — record it in **Execution Notes**.
- `src/api/Event.client.test.ts` is deleted. `src/api/Resource.client.test.ts`, `src/api/Path.client.test.ts`, and `src/api/Profile.client.test.ts` drop only the `it` blocks covering `getResources` / `getPaths` / `getProfiles` (including their offset/size header assertions); every kept method keeps its existing coverage. `src/api/types.test.ts` drops its `ResourceListParams` describe and that import; leave its pre-existing stale type-only imports (`Control`, `Create`, `Consume`) alone — they are erased at runtime and `tsconfig.json` excludes test files from `vue-tsc`.
- The `src/api/**` and `src/composables/**` coverage thresholds in `vitest.config.ts` still pass after the deletions and the new composable. Confirm with `npm run test:coverage`.
- `src/pages/ResourceEditPage.vue` replaces `resource-edit-back-button` with an absolute Discovery link (id `resource-edit-browse-resources-link`, label "Browse Resources"); `src/pages/PathEditPage.vue` replaces `path-edit-back-button` the same way (id `path-edit-browse-paths-link`, label "Browse Paths"). Neither page keeps an unused `useRouter` import or `router` const — `noUnusedLocals` is on in `tsconfig.json`.
- `src/pages/ProfileEditPage.vue` replaces `profile-edit-back-button` with an absolute Discovery dashboard link (id `profile-edit-dashboard-link`, label "Back to Dashboard"). Its `router` is still needed for the New Encounter navigation, so keep that import.
- `src/pages/EncounterEditPage.vue` keeps its single `encounter-detail-back-button`: with a known mentee it still `router.push`es `/profiles/{menteeId}` and reads "Back to Profile"; without one it forwards to the Discovery dashboard and reads "Back to Dashboard".
- No `router.push` or `to` anywhere in `src/` targets `/resources`, `/paths`, or `/profiles` as a list route. Links to `/resources/:id`, `/resources/new`, `/paths/:id`, `/paths/new`, `/profiles/:id`, and `/encounters/:id` are unaffected, including the `router.push` after create in the two New pages. Leave the `['resources']` / `['paths']` query-key invalidations in the New pages as they are.
- `src/App.vue` keeps its current chrome shape but the drawer no longer has rows for deleted routes: `nav-dashboard-link`, `nav-resources-link`, and `nav-learning-paths-link` are gone; `nav-encounter-plans-link` (F150 removes it), the admin row, and the logout row stay. Logout behavior and `provideEditorConfig` are unchanged. Do **not** add replacement local nav — F151 deletes this chrome for `PageFrame`.
- Cypress is reduced to coverage of kept routes, still at the un-prefixed origin:
  - `cypress/support/e2e.ts` seeds on a page that stays put: `registerAuthCommands({ visitPath: '/paths/new' })`. `cypress/support/commands.ts` uses the same default for `loginAsMentor`. Every `cy.login()` / `cy.loginAsMentor()` call that relied on landing somewhere useful now passes an explicit path.
  - `cypress/support/commands.ts` gains a helper (suggested `cy.mentorMenteeProfileId()`) that signs the seeded mentor JWT with the existing `signCypressJwt` task and `cy.request`s `GET /api/profile` with `Authorization: Bearer <token>`, yielding the first mentee `_id`. It must fail loudly if the seeded mentor has no mentees.
  - `cypress/e2e/profile.cy.ts` and `cypress/e2e/encounter.cy.ts` start from `cy.loginAsMentor('/profiles/{id}')` using that helper instead of visiting the dashboard and clicking a card. All `ProfileEditPage` coverage survives — sections, collapse buttons, typed notes editors, the New Encounter plan dialog, and the "no New Profile button" / "no Properties button" assertions that apply to the edit page. The dashboard-only `it` blocks (heading, card grid, card contents, card-click navigation, and the unassigned-mentor empty state) are deleted.
  - `cypress/e2e/encounter.cy.ts` also drops `should not expose a standalone encounters list route`: visiting `/encounters` now forwards cross-origin to Discovery, which Cypress cannot follow from this baseUrl.
  - `cypress/e2e/resource.cy.ts` and `cypress/e2e/path.cy.ts` drop every `it` that visits `/resources` or `/paths`, waits on a `getResources` / `getPaths` intercept, or drives `*-list-search` / `*-list-load-more` / `*-list-grid` / `*-list-new-button`. The create and update flows survive by visiting `/resources/new` and `/paths/new` directly; where the update spec ended by clicking back to the list and searching, assert instead that the new browse link's `href` is an absolute `:8080` Discovery URL and that the edited value persists on the edit page (`cy.reload()` is fine).
  - `cypress/e2e/navigation.cy.ts` is deleted — it asserts the local drawer that F151 removes and a default route that no longer exists. F154 rewrites navigation coverage against the spa_utils `PageFrame` ids. Do **not** move its default-route `it` anywhere: that behavior is now a cross-origin forward covered by the `useDiscoveryRedirect` unit test.
  - `cypress/support/commands.ts` keeps `loginAsMentor`, `loginAndVisit`, `openNavDrawer`, and `closeNavDrawer` for now; F151 and F154 decide their fate.
  - Do not re-point any visit to a `/mentor/` prefix here. **F154** owns the whole prefixed Cypress rewrite.
- `README.md` reflects the new page set: no local list dashboards, no default route, mentee/resource/path/plan browsing lives on Discovery, unmatched paths forward to the Discovery dashboard, and this repo hosts the detail, edit, and create pages Discovery cards target. Drop the "Mentor Dashboard" list row and the `useOffsetList` and `offset` / `size` list-dashboard guidance from "Data Fetching" and "Adding New Features".
- Dependency versions are untouched: `package.json` keeps the exact `1.0.0` pin from F148.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` — the reduced `src/api/*.client.test.ts` and `src/api/types.test.ts` suites plus the new `src/composables/useDiscoveryRedirect.test.ts` must pass
- `npm run test:coverage` — `src/api/**` and `src/composables/**` thresholds must still hold
- `npm run build` — `vue-tsc` must be clean; this repo defines no `lint` script, so `npm run build` is the type gate
- `npm run api` then `npm run dev` — manual check at `http://localhost:8392/`:
  - `/`, `/profiles`, `/resources`, `/paths`, and any unknown path forward the browser to `http://<host>:8080/discovery/`
  - `/profiles/{id}` still renders the profile edit page, and its "Back to Dashboard" action points at `http://<host>:8080/discovery/`
  - `/resources/{id}` and `/paths/{id}` still render their edit pages, with browse actions at `http://<host>:8080/discovery/resources` and `http://<host>:8080/discovery/paths`
  - `/resources/new` and `/paths/new` still create and land on the edit page
  - `/encounters/{id}` renders, and its back button returns to the mentee profile when one is known
  - the drawer has no Dashboard, Resources, or Learning Paths rows
  - a login without the `admin` role visiting `/admin` is forwarded to the Discovery dashboard
  - the plans dashboard is unaffected until F150

**Packaging verification:**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running). All surviving specs must pass at the un-prefixed origin; prefixed visits arrive in F154.

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8392**.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `src/composables/useDiscoveryRedirect.ts` — `redirectToDiscoveryDashboard()` built on `buildJourneyUrl('discovery')`
- `src/composables/useDiscoveryRedirect.test.ts` — unit coverage for the forward
- `src/pages/DiscoveryRedirectPage.vue` — catch-all page that forwards on mount

**Update:**

- `cypress/support/e2e.ts` — `visitPath: '/paths/new'` so auth seeding no longer lands on the forwarding root
- `src/router/index.ts` — list routes and both legacy redirects removed, catch-all added, role-gate fallback forwards to Discovery
- `src/App.vue` — drawer rows for deleted routes removed
- `src/api/client.ts` — `getResources`, `getPaths`, `getProfiles`, and the Event methods removed
- `src/api/types.ts` — `ResourceListParams`, the dashboard card types, and the Event / cursor types removed
- `src/api/Resource.client.test.ts`, `src/api/Path.client.test.ts`, `src/api/Profile.client.test.ts` — list `it` blocks removed
- `src/api/types.test.ts` — `ResourceListParams` describe and import removed
- `src/pages/ResourceEditPage.vue`, `src/pages/PathEditPage.vue` — Discovery browse links replace "Back to List"
- `src/pages/ProfileEditPage.vue` — Discovery dashboard link replaces "Back to Dashboard"
- `src/pages/EncounterEditPage.vue` — dashboard fallback forwards to Discovery
- `cypress/support/commands.ts` — mentee profile id helper and the new default visit path
- `cypress/e2e/profile.cy.ts`, `cypress/e2e/encounter.cy.ts` — direct `/profiles/{id}` entry, dashboard-only `it` blocks removed
- `cypress/e2e/resource.cy.ts`, `cypress/e2e/path.cy.ts` — list-dependent `it` blocks removed, browse-link assertions added
- `README.md` — page set, no default route, "collections and the mentor dashboard live on Discovery"

**Delete:**

- `src/pages/ResourcesListPage.vue`
- `src/pages/PathsListPage.vue`
- `src/pages/ProfilesListPage.vue`
- `src/composables/useOffsetList.ts`
- `src/api/Event.client.test.ts`
- `cypress/e2e/navigation.cy.ts` — local-drawer spec; F154 adds the `PageFrame` replacement

Do not change `package.json`, `package-lock.json`, `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `cypress.config.ts`, `vitest.config.ts`, `src/components/**`, `src/composables/useRoles.ts`, or any plan page in this task.

## Execution Notes

_Reserved for the task execution agent: plan, commands run, test results, follow-ups._
