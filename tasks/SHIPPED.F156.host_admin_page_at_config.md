# F156 – Host packaged `AdminPage` at `/mentor/config`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F155_pin_spa_utils_1_0_1`  
**Description**: Register Vue `path: '/config'` under the existing journey `base` so Settings (`hostingConfigHref()`) lands on **this** SPA at `/mentor/config`. Reuse the existing packaged `AdminPage` wrapper. Gate the route with the **admin** role; non-admins redirect away. Keep existing detail/edit/create pages. Do not pass nav config into `PageFrame`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame**: Settings is **admin-only** and uses `hostingConfigHref()` → `{origin}/{journeyPrefix}/config` (not `/admin/settings`, not welcome-port rewrite). **Admin config and Token claims**: Token tab ids `admin-token-profile-id-display`, `admin-token-customer-id-display`, `admin-token-mentor-id-display`
- `README.md` — In-App Route Table currently lists `/mentor/admin` only
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `src/router/index.ts` — `/admin` already loads `src/pages/AdminPage.vue` with `requiresAuth` + `requiresRole: 'admin'`; missing role calls `redirectToDiscoveryDashboard()` then `next(false)`; catch-all `/:pathMatch(.*)*` is last and forwards unmatched paths (including a missing `/config`) to Discovery on `:8080`
- `src/pages/AdminPage.vue` — already imports `{ AdminPage }` from `@mentor-forge/mentorhub_spa_utils` and feeds `GET` config via `api.getConfig()`
- `src/App.vue` — `PageFrame` with `pageTitle` only
- `src/composables/useDiscoveryRedirect.ts` — `window.location.replace(buildJourneyUrl('discovery'))`; the role-gate fallback (not a local Home page)
- `vite.config.ts` — `base: '/mentor/'` already shipped (F152); Vue `path: '/config'` is browser URL `/mentor/config`

spa_utils 1.0.1 compiles Settings to **this** SPA’s `/mentor/config` on the **current origin** (Vite/container `:8392` during Cypress; welcome `:8080` when entered through ALB). The hamburger must not be given local `navItems`. Do not hard-code ALB URLs or role tables on `PageFrame`.

**Out of scope**: Cypress click-through, Token tab, catalog rows, logout `return_to`, and non-admin redirect coverage (F157). Do not add Events or any list dashboard. Do not change the spa_utils pin.

## Goals

- Vue route `path: '/config'` (public URL **`/mentor/config`** under existing Vite `base` `/mentor/`) renders the existing packaged `AdminPage` wrapper. Import remains `{ AdminPage }` from `@mentor-forge/mentorhub_spa_utils`. Register `/config` **before** the catch-all; otherwise unmatched `/config` forwards the browser to Discovery.
- Gate `/config` with the **admin** role using the same `requiresRole: 'admin'` pattern as `/admin`. Unauthenticated callers still hit IdP via the existing `requiresAuth` guard (`redirectToIdpLogin`). Authenticated non-admins redirect away via the existing `redirectToDiscoveryDashboard()` fallback — do not invent a local Home page to absorb the gate.
- Keep `/admin` working so existing bookmarks and F154 visits do not 404 before F157: either an **alias** of `/config` or a redirect to `{ name }` of the config route. Do not keep two different admin page implementations.
- Keep existing detail/edit/create pages and routes for resources, paths, plans, encounters, and profiles. Config route only — no new list dashboards, no Events route.
- Do **not** pass `navItems`, ALB URLs, or role tables into `PageFrame`. Settings is already in the compiled 1.0.1 catalog (`hostingConfigHref()` → `{origin}/mentor/config`).
- README In-App Route Table includes `/mentor/config` as the admin Settings host (Token / Config Items / Versions / Enumerators). Note that hamburger Settings stays on the hosting origin (no `:8080` rewrite). `/mentor/admin` may remain listed as an alias.
- No new local admin chrome. Token claim labels/ids are owned by spa_utils 1.0.1 `TokenClaimsCard`. Do not restore Products / Customer / Customer Members hamburger rows locally.

### Craftsmanship Expectations

- Reuse the packaged `AdminPage`; do not fork Config/Token UI locally.
- Treat DRY as avoiding duplicated knowledge: the Settings href is `hostingConfigHref()`, not a Mentor-owned URL table and not `/admin/settings`.
- Prefer deleting a second admin page if `/admin` and `/config` would otherwise diverge.
- Keep journey-specific create/edit pages in this SPA; do not reintroduce collection lists that belong on Discovery.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test`
- `npm run test:coverage` — thresholds unchanged
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)

Do not add Cypress here (F157). Router unit tests are optional; pages remain E2E-covered in F157. If a router test is added, cover: admin can resolve `/config`; authenticated non-admin `requiresRole` does not stay on `/config` (existing Discovery fallback is correct). Do not weaken `src/App.test.ts` enumerator / `provideEditorConfig` assertions.

Optional smoke (`npm run api` then `npm run dev` at `http://localhost:8392/mentor/`): an admin token can open `/mentor/config`; a mentor-only token is sent away; `/mentor/paths/new` and other kept pages still render. Do not treat this as a substitute for F157.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `src/router/index.ts` — `/config` (admin-gated) registered before the catch-all; `/admin` alias or redirect to config
- `src/pages/AdminPage.vue` — only if the wrapper must change to stay a single host for both paths
- `README.md` — `/mentor/config` as the Settings / AdminPage host; `/admin` alias if kept
- A colocated router unit test **only if** one is added for the `/config` role gate

Do not add Events or list pages. Do not pass disallowed `PageFrame` props. Do not change the spa_utils pin. Do not rewrite `cypress/e2e/navigation.cy.ts` in this task.

## Execution Notes

### Planned approach (before implementation)

1. **Router** — Register Vue `path: '/config'` (name `Admin`) loading the existing `src/pages/AdminPage.vue` wrapper, with `requiresAuth` + `requiresRole: 'admin'`, **before** the `/:pathMatch(.*)*` catch-all. Keep `/admin` as a Vue Router **`alias`** of `/config` (one record, one component, one gate) so F154 bookmarks still resolve. Unauthenticated callers keep `redirectToIdpLogin`; authenticated non-admins keep `redirectToDiscoveryDashboard()` then `next(false)`.
2. **AdminPage.vue** — No change. It already hosts packaged `{ AdminPage }` from spa_utils 1.0.1.
3. **README** — Add `/mentor/config` as the Settings / AdminPage host (Token / Config Items / Versions / Enumerators). List `/mentor/admin` as an alias. Note hamburger Settings stays on the hosting origin (no `:8080` rewrite). Drop “once F156 registers” future-tense in the 1.0.1 catalog prose.
4. **Router unit test** — Add `src/router/index.test.ts`: `/config` resolves to the admin-gated host (not Discovery catch-all); `/admin` alias resolves the same record; admin can stay on `/config`; authenticated non-admin hits Discovery fallback and does not stay on `/config`.
5. **Out of scope** — No Cypress rewrite, no spa_utils pin change, no Events/list dashboards, no `PageFrame` navItems/ALB/role tables.
6. **Verify** — `npm run test`, `npm run test:coverage`, `npm run build`.

### Summary

Registered Vue `/config` (browser `/mentor/config`) as the Settings / AdminPage host, admin-gated with the existing `requiresAuth` + `requiresRole: 'admin'` guard, before the Discovery catch-all. `/admin` is a Vue Router **alias** of `/config` (same component, same gate). `AdminPage.vue` unchanged. README documents `/mentor/config` as the host and `/admin` as the alias. Colocated router unit test covers resolve + role gate.

### Files changed

- `src/router/index.ts` — `/config` + `/admin` alias
- `src/router/index.test.ts` — new role-gate unit test
- `README.md` — In-App Route Table + catalog prose
- `tasks/PENDING.F156.host_admin_page_at_config.md` — Execution Notes only

Unchanged: `src/pages/AdminPage.vue`, `src/App.vue`, spa_utils pin `1.0.1`, Cypress.

### Commands / results

- `npm run test` — 15 files, 104 tests passed (4 new router tests)
- `npm run test:coverage` — passed; api/composables/components thresholds unchanged
- `npm run build` — `vue-tsc` + Vite succeeded

### Follow-ups

F157 owns Cypress click-through, Token tab, catalog rows, logout `return_to`, non-admin redirect coverage, and packaging. Do not treat this task as E2E-complete.

### Orchestrator confirmation

- `npm run test:coverage` — **pass** (15 files, 104 tests)
- `npm run build` — **pass** (`vue-tsc` clean)
