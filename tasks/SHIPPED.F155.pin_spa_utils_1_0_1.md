# F155 – Pin `@mentor-forge/mentorhub_spa_utils@1.0.1`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: This repo owns the Mentor SPA **1.0.1 pin** (issue F-RS17 / GitHub #36). Bump `@mentor-forge/mentorhub_spa_utils` from exact `1.0.0` to exact **`1.0.1`**, refresh the lockfile from CodeArtifact, and fix any compile or unit-test breakage from the 1.0.1 catalog, logout `return_to=/discovery/`, Settings `hostingConfigHref`, and Token claims. Do **not** add `/config` in this task.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — exact semver pins for shared packages; CodeArtifact (`mh` then `npm install`)
- `../mentorhub_spa_utils/README.md` — install pin **1.0.1**; **Universal PageFrame** (1.0.1 catalog: Home, Events, Resources, Paths, Plans; Notifications + Settings **admin-only**; Settings = `hostingConfigHref()` → `{origin}/{prefix}/config`; empty/missing roles → Home + Events); logout `logout()` then `redirectToIdpLogin(buildJourneyUrl('discovery'))` → `/discovery/`; **Admin config and Token claims**; removed hamburger ids `nav-products-link`, `nav-customer-link`, `nav-customer-members-link`; new `nav-events-link`
- `README.md` — currently documents spa_utils **1.0.0**, `/mentor/admin` as the admin host, and admin hamburger rows `nav-products-link` / `nav-settings-link`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` / `package-lock.json` — currently `"@mentor-forge/mentorhub_spa_utils": "1.0.0"`
- `src/App.vue` — `PageFrame page-title="Mentor"` only (keep; do not add `navItems`, ALB URLs, or role tables)
- `src/initAuth.ts` — `bootstrapAuthFromUrl()` then `syncAuthFromStorage()` (keep)
- `src/pages/AdminPage.vue` — already imports `{ AdminPage }` from spa_utils (do not change the host wrapper here)
- `src/router/index.ts` — `/admin` is still the only admin route; `/config` is **F156**
- `cypress/e2e/navigation.cy.ts` — still encodes the **1.0.0** catalog (mentor Notifications; admin Products + Settings → `/admin/settings`; logout comment that `return_to` is the root origin)
- `vitest.config.ts` — comment still says "spa_utils 1.0.0"

**Source issue**: F-RS17 ("Pin spa_utils 1.0.1 and host AdminPage at /mentor/config"). This task delivers **only** the pin.

**External prerequisite**: `mentorhub_spa_utils` F041–F046 shipped and **`@mentor-forge/mentorhub_spa_utils@1.0.1` is published to CodeArtifact**. Vue `base` + SPA nginx prefix `/mentor/` are already shipped (F152–F154 / mentorhub L022). Run `mh`, then `npm view @mentor-forge/mentorhub_spa_utils version`. If **1.0.1** is not available, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F155.pin_spa_utils_1_0_1.md`, and stop — do not stay on `1.0.0` and do not point `package.json` at a git URL.

This SPA is the **first** `mentorhub_mentor_spa` issue in the 1.0.1 wave and **owns this repo’s pin**. Sibling SPAs pin independently; do not change other repos.

**Out of scope**: Vue `/config` (F156). Cypress catalog / Settings / Token / logout `return_to` assertions (F157). Do not pass `navItems`, ALB origins, or role tables into `PageFrame`. Do not override logout locally. Do not restore Products / Customer / Customer Members drawer rows. Do not add list dashboards.

### Wave ordering

Pin (F155) → config route (F156) → Cypress and packaging (F157). Pinning first makes the 1.0.1 `PageFrame` catalog, `hostingConfigHref()`, Token claim labels, and logout `return_to` available before F156 registers the Settings destination. Cypress still encodes the 1.0.0 catalog, so **do not run** `npm run cypress:run` here.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "1.0.1"` — exact semver, **no caret**.
- `package-lock.json` resolves `1.0.1` from the CodeArtifact registry after `mh` and `npm install --include=dev`.
- `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.1`.
- The app still builds and unit-tests: `PageFrame` still receives only `pageTitle` (`page-title="Mentor"`). IdP bootstrap / `urlAuthBootstrap` / `redirectToIdpLogin` stay as today. Logout `return_to` remains owned by spa_utils — do not add a local logout handler and do not re-introduce `handleLogout`.
- `README.md` names the pinned version **1.0.1** in ownership / component notes. Document the 1.0.1 hamburger catalog in prose (Home, Events, Resources, Paths, Plans; Notifications and Settings **admin-only**; Settings lands on this SPA’s `/config` once F156 ships; Products / Customer / Customer Members are **not** hamburger rows). Do not invent a local nav config API. Do not claim `/mentor/config` is already routed — F156 owns that row in the In-App Route Table.
- Fix any `src/**` import or type breakage from 1.0.1. Do not add routes in this task. Keep existing detail/edit/create pages for resources, paths, plans, encounters, and profiles.
- `vitest.config.ts` may be touched **only** to correct the stale "spa_utils 1.0.0" comment or if 1.0.1 changes whether the package must be inlined for Vitest. Do not change coverage thresholds.
- The three spa_utils Cypress subpath imports still resolve under 1.0.1: `cypress/jwtDefaults`, `cypress/registerJwtSignTask`, and `cypress/registerAuthCommands`. If a subpath or option name moved, update the import here — do **not** vendor a local copy. Do not rewrite `navigation.cy.ts` catalog expectations here.

### Craftsmanship Expectations

- Reuse `mentorhub_spa_utils` for shared SPA behavior rather than creating local equivalents.
- Treat DRY as avoiding duplicated knowledge: catalog, logout `return_to`, and Settings href are owned by 1.0.1 `PageFrame` / `hostingConfigHref` / `buildJourneyUrl`. Do not grow a parallel hamburger.
- Keep journey-specific behavior in this SPA; do not restore Products / Customer / Members drawer rows locally.
- Prefer deleting obsolete local behavior when responsibility has moved to spa_utils. Do not introduce local workarounds for 1.0.1 catalog or logout.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm ls @mentor-forge/mentorhub_spa_utils` — confirm **1.0.1**
- `npm run test` — full Vitest suite, including `src/App.test.ts`
- `npm run test:coverage` — the `src/api/**`, `src/composables/**`, and `src/components/**` thresholds in `vitest.config.ts` must still hold
- `npm run build` — `vue-tsc` must be clean. **This repo defines no `lint` script**, so `npm run build` is the type gate. Do not add a lint script in this task.

Do **not** run `npm run cypress:run` in this task. Existing Cypress still encodes the 1.0.0 catalog (`nav-products-link`, Settings → `/admin/settings`, mentor Notifications, logout to root origin). Leave those specs to F157. Do not “fix” them here unless a unit test or `vue-tsc` fails.

Packaging (`npm run container` / `npm run service`) is **F157**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `package.json` — `"@mentor-forge/mentorhub_spa_utils": "1.0.1"`
- `package-lock.json` — resolved 1.0.1 from CodeArtifact
- `README.md` — spa_utils version note and 1.0.1 catalog ownership (do not add `/mentor/config` to the route table yet)
- `vitest.config.ts` — stale version comment only (or the inline setting if 1.0.1 requires it)
- `cypress.config.ts`, `cypress/support/e2e.ts` — only if a spa_utils Cypress subpath or option moved in 1.0.1
- Any `src/**` import or type that fails to compile against 1.0.1

Do not add a `/config` route. Do not pass disallowed `PageFrame` props. Do not change Cypress specs in this task unless a compile of test helpers breaks. Do not change `src/router/index.ts`, `vite.config.ts`, `nginx.conf.template`, or `Dockerfile`.

## Execution Notes

### Planned approach

1. Confirm `@mentor-forge/mentorhub_spa_utils@1.0.1` is published on CodeArtifact (`mh` then `npm view`). If missing, mark this task Blocked and stop — do not stay on 1.0.0 or use a git URL.
2. Pin `package.json` to exact `"1.0.1"` (no caret) and refresh `package-lock.json` with `npm install --include=dev`.
3. Update `README.md` ownership / component notes to 1.0.1 and document the compiled hamburger catalog in prose (Home, Events, Resources, Paths, Plans; Notifications + Settings admin-only; Settings lands on `/config` once F156 ships). Do not add `/mentor/config` to the In-App Route Table. Do not invent a local nav config API.
4. Correct the stale spa_utils version comment in `vitest.config.ts`. Leave coverage thresholds and the inline setting unchanged unless 1.0.1 forces a Vitest change.
5. Keep `PageFrame` receiving only `pageTitle`. Do not add `/config`, a local logout handler, or Cypress catalog rewrites. Touch `cypress.config.ts` / `cypress/support/e2e.ts` only if 1.0.1 moved a Cypress subpath. Touch `src/**` only if import/type compile breakage appears.
6. Verify with `npm ls`, `npm run test`, `npm run test:coverage`, and `npm run build`. Do not run Cypress or packaging.

### Summary

Pinned `@mentor-forge/mentorhub_spa_utils` to exact **1.0.1** from CodeArtifact. `PageFrame` still receives only `pageTitle`. No `/config` route, no local logout handler, no Cypress spec rewrites. Cypress subpaths (`cypress/jwtDefaults`, `cypress/registerJwtSignTask`, `cypress/registerAuthCommands`) are unchanged in 1.0.1, so `cypress.config.ts` and `cypress/support/e2e.ts` were left alone. No `src/**` import or type breakage.

### Files changed

- `package.json` — exact pin `"1.0.1"`
- `package-lock.json` — resolved `1.0.1` from CodeArtifact
- `README.md` — ownership / component notes and 1.0.1 hamburger catalog prose (In-App Route Table still lists `/mentor/admin` only)
- `vitest.config.ts` — comment `1.0.0` → `1.0.1` (inline setting unchanged)

### Commands / results

- `mh` — CodeArtifact auth refreshed
- `npm view @mentor-forge/mentorhub_spa_utils version` — **1.0.1** (published; not blocked)
- `npm install --include=dev` — changed 1 package
- `npm ls @mentor-forge/mentorhub_spa_utils` — `@mentor-forge/mentorhub_spa_utils@1.0.1`
- `npm run test` — **pass** (14 files, 100 tests)
- `npm run test:coverage` — **pass** (14 files, 100 tests); thresholds held (`src/api/**` 98.01% lines / 100% funcs / 90.69% branches; `src/composables/**` 99.09% / 100% / 75.47%; `src/components/**` 95.42% / 100% / 88.73%)
- `npm run build` — **pass** (`vue-tsc` clean + Vite production build)

### Follow-ups

- **F156** owns Vue `/config` (host `AdminPage` at `/mentor/config`; In-App Route Table row).
- **F157** owns Cypress catalog / Settings href / Token claims / logout `return_to=/discovery/` assertions and packaging.

Status left **Pending** for the orchestrator to mark Shipped. No commit.

### Orchestrator confirmation

- `npm ls @mentor-forge/mentorhub_spa_utils` — `@mentor-forge/mentorhub_spa_utils@1.0.1`
- `npm run test:coverage` — **pass** (14 files, 100 tests); thresholds held
- `npm run build` — **pass** (`vue-tsc` clean)
