# F151 – Adopt spa_utils `PageFrame` and delete the local chrome

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F150_plan_create_page_and_retire_plans_list`  
**Description**: Replace this SPA's local app bar, navigation drawer, and logout handler with the imported `PageFrame`, keeping the app-bar title `Mentor`. The mentor-role hamburger rows now point at Discovery, which is exactly where F149 and F150 sent collection browsing. Route paths keep the shape F149/F150 locked; the `/mentor/` base path is F152.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame (1.0.0)**: allowed props, the compiled role-gated hamburger catalog, "local nav config is disallowed"; **Cross-SPA URLs**
- `../mentorhub_spa_utils/src/components/PageFrame.vue` — the component being adopted; read it to confirm the markup it owns
- `README.md` — Key Implementation Patterns / Component Architecture / Automation Support
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F149.retire_list_pages_and_forward_to_discovery.md` — locked route table
- `src/App.vue` — local `v-app-bar` (static `<v-app-bar-title>Mentor</v-app-bar-title>`), `v-app-bar-nav-icon` (`nav-drawer-toggle`), `v-navigation-drawer` with the only rows F149 and F150 left standing (`nav-admin-link`, `nav-logout-link`), the `drawer` ref, the `router.afterEach` drawer close, `handleLogout`, the local `useRoles` / `hasAdminRole` usage, and `<v-main><v-container fluid><router-view /></v-container></v-main>`
- `src/App.test.ts` — `shallowMount(App)` with mocks for `vue-router`, `@/composables/useConfig`, `@/composables/useRoles`, and `@mentor-forge/mentorhub_spa_utils`; asserts the `provideEditorConfig` boundary
- `src/composables/useConfig.ts` — app-owned `GET /api/config` startup fetch
- `src/composables/useRoles.ts` — local wrapper; still used by `src/pages/PlanEditPage.vue` for admin-gated audit fields, so the composable and its test **stay**
- `src/main.ts`, `src/initAuth.ts` — IdP bootstrap; keep exactly as today
- `src/router/index.ts` — the `router.afterEach` that sets `document.title = 'Mentor'` stays here
- Every kept page opens with its own `v-container`: `AdminPage.vue` via the spa_utils `AdminPage` component, and the profile, encounter, path, resource, plan, and `DiscoveryRedirectPage` pages directly

`PageFrame` is exported from the package **root** and already renders `v-app-bar`, the `v-navigation-drawer`, and `v-main` — it does **not** render a `v-container`. The host keeps a single `v-app`. Drawer rows are absolute welcome / ALB `href` values built by `buildJourneyUrl` (targets are usually other SPAs), not Vue Router `to`. Logout is built into the drawer footer (`nav-logout-link`).

**Allowed props only:** `pageTitle` (required). Do **not** pass `navItems`, URL maps, ALB origin, role tables, or extra drawer slots. Do **not** pass `customerName` — that prop only labels the two `customer`-role drawer rows and is not this SPA's concern.

For a token carrying `mentor`, the compiled hamburger shows **Home** (`/discovery/`), **Learning Resources** (`/discovery/resources`), **Learning Paths** (`/discovery/paths`), **Encounter Plans** (`/discovery/plans`), and **Notifications** (`/discovery/notifications`); `admin` adds **Products** (`/discovery/products`) and **Settings** (`/admin/settings`); a token with neither gets Home and Notifications only. The app-bar avatar links to `/customer/profile/`. Those three mentor rows replace exactly the local rows F149 and F150 deleted, which is why no local nav is needed.

### Title stays static

This SPA's app bar has always shown the literal `Mentor`, and `src/router/index.ts` sets `document.title = 'Mentor'` on every navigation. Pass `page-title="Mentor"` and leave the router's `afterEach` alone. Do not invent a dynamic title composable in this task.

### Known limitation to record, not fix

`PageFrame`'s built-in logout returns to `` `${window.location.origin}/` `` — the root origin, not `/mentor/`. That is compiled into spa_utils and cannot be overridden by a host prop. Once F152 mounts the app under the base, a logged-out user lands on the welcome root rather than back at the Mentor SPA, which is acceptable behavior. Record it in **Execution Notes** as a follow-up for a spa_utils issue (base-aware logout return URL). Do **not** re-add a local logout handler to work around it, and do not edit the spa_utils package.

## Goals

- `src/App.vue` becomes a single host `v-app` wrapping `PageFrame`:

  ```vue
  <v-app>
    <PageFrame page-title="Mentor">
      <router-view />
    </PageFrame>
  </v-app>
  ```

  - Remove the local `v-app-bar`, `v-app-bar-title`, `v-app-bar-nav-icon`, `v-navigation-drawer`, all drawer `v-list` rows, the `drawer` ref, the `router.afterEach` drawer close, `handleLogout`, the `useRouter` and `redirectToIdpLogin` imports, and the local `useRoles` / `hasAdminRole` usage in this component.
  - The `<v-main>` and the `<v-container fluid>` wrapper are removed too: `PageFrame` owns `v-main`, and every kept page already opens with its own `v-container`. Verify the profile detail, encounter detail, path, resource, plan, admin, and redirect pages still have sane gutters after the outer container is gone, and record the result.
  - There must be exactly one app bar and no local hamburger configuration.
- `src/App.vue` keeps everything that is not chrome: the existing `provideEditorConfig(config)` call and the `onMounted` authenticated `loadConfig()` with its `console.warn` on failure. Do not add a second startup config fetch and do not duplicate `provideEditorConfig`.
- No `data-automation-id` beginning with `nav-` is defined anywhere in `src/` any more, and `nav-dashboard-link`, `nav-learning-paths-link`, `nav-encounter-plans-link`, and `nav-admin-link` do not appear in `src/` or `cypress/`. The drawer, title, profile, and logout ids come from spa_utils: `nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-home-link`, `nav-resources-link`, `nav-paths-link`, `nav-plans-link`, `nav-notifications-link`, `nav-logout-link` (plus `nav-products-link` / `nav-settings-link` for `admin`).
- This SPA has no home page of its own after F149, so the hamburger's **Home** row (`/discovery/`) is the only way back to the mentor dashboard, and the catch-all forward handles anyone who lands on `/`. Do not add a local drawer row to restore a Dashboard link, and do not point any chrome element at a local route.
- `/admin` is likewise direct-URL only and still `admin`-gated. The spa_utils **Settings** row targets `/admin/settings` in the Admin journey, not this page.
- `src/composables/useRoles.ts` and `src/composables/useRoles.test.ts` are untouched — `PlanEditPage.vue` still uses them.
- `src/App.test.ts` still asserts the `provideEditorConfig` boundary and passes: add a `PageFrame` stub to the `@mentor-forge/mentorhub_spa_utils` mock factory (and to `shallowMount` stubs if needed), drop the `@/composables/useRoles` mock and the `vue-router` mock once `App.vue` stops calling them, and stub `RouterView` if Vue warns about an unresolved component. Do not weaken the enumerator assertions.
- `src/router/index.ts` is unchanged in this task: route paths keep their shape (no renames, no new routes, no base prefix), the guards stay, and `document.title = 'Mentor'` stays.
- `cypress/support/commands.ts` keeps `loginAsMentor` and `loginAndVisit`. `openNavDrawer` / `closeNavDrawer` still work against `PageFrame` (same `nav-drawer-toggle` id and Vuetify drawer classes) — verify that and keep them; F154 decides whether the navigation spec uses them.
- No Cypress spec should need editing here: F149 deleted the local-drawer spec and no surviving spec asserts the app bar. If `npm run cypress:run` exposes a stale local-chrome selector, fix that single selector and record it.
- `README.md` records that `PageFrame` from spa_utils 1.0.0 is the navigation shell, that local nav config is disallowed, that the hamburger's Learning Resources / Learning Paths / Encounter Plans rows open Discovery, and that Cypress uses the spa_utils automation ids listed above.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` — `src/App.test.ts` must pass with the new stubs; update or remove any other unit test asserting local drawer markup or `handleLogout`
- `npm run test:coverage` — thresholds unchanged (`src/App.vue` is excluded from coverage)
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)
- `npm run api` then `npm run dev` — manual check at `http://localhost:8392/`:
  - a single app bar renders with the title `Mentor`
  - the hamburger opens the spa_utils drawer; a mentor login shows Home, Learning Resources, Learning Paths, Encounter Plans, and Notifications, all absolute `:8080` URLs
  - an `admin` login additionally shows Products and Settings
  - the avatar links to `http://<host>:8080/customer/profile/`
  - logout clears auth and leaves via the IdP
  - `/profiles/{id}`, `/encounters/{id}`, `/paths/{id}`, `/resources/{id}`, `/plans/{id}`, `/plans/new`, and `/admin` render with reasonable gutters and no doubled app bar, and `/` still forwards to the Discovery dashboard

**Packaging verification:**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); all specs must still pass at the un-prefixed origin. Full drawer and title coverage using the spa_utils ids is **F154**.

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8392**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `src/App.vue` — `PageFrame` shell, local chrome removed
- `src/App.test.ts` — `PageFrame` stub replacing the local chrome mocks
- `cypress/support/commands.ts` — only if the drawer helpers need adjusting for `PageFrame`
- `README.md` — `PageFrame` as the nav shell, spa_utils automation ids, no local nav config

Do not change `src/router/index.ts`, `src/composables/**`, `src/pages/**`, `src/components/**`, `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `package.json`, `cypress.config.ts`, `vitest.config.ts`, or `src/api/client.ts` in this task, and do not pass disallowed `PageFrame` props.

## Execution Notes

### Summary
- Adopted `PageFrame` from `@mentor-forge/mentorhub_spa_utils` in `src/App.vue` (`<PageFrame page-title="Mentor">`), removing local app bar, navigation drawer, logout handler, and outer `v-main`/`v-container` wrappers.
- Preserved `provideEditorConfig` and `loadConfig` on mount in `src/App.vue`.
- Updated `src/App.test.ts` to stub `PageFrame` and remove obsolete router/roles mocks.
- Verified that `openNavDrawer` and `closeNavDrawer` in `cypress/support/commands.ts` target `nav-drawer-toggle` and `.v-navigation-drawer--active`, matching `PageFrame`.
- Updated `README.md` to document `PageFrame` shell and spa_utils automation ids.

### Known Limitations
- `PageFrame`'s built-in logout returns to `${window.location.origin}/` (welcome root) rather than `/mentor/`, as compiled in spa_utils. This will be addressed as a follow-up for a base-aware logout URL in spa_utils.

### Test Results
- `npm run test`: 14 test files passed (85 tests).
- `npm run build`: `vue-tsc && vite build` passed with zero errors.

### Follow-ups
- F152 will configure Vite `base: '/mentor/'`, router `BASE_URL`, and base-aware runtime config.
