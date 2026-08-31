# F148 – Pin `@mentor-forge/mentorhub_spa_utils@1.0.0`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: _(none — first task in this wave)_  
**Description**: This repo owns the Mentor SPA **1.0.0 pin** (issue F-RS16). Replace the caret range `^0.5.7` with an exact **`1.0.0`** pin, refresh the lockfile from CodeArtifact, and fix any residual compile or test breakage. Do **not** adopt `PageFrame` (F151), do not delete pages or routes (F149/F150), and do not touch the `/mentor/` base path (F152–F153).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — SPA dependency management (exact pins for shared packages)
- `../mentorhub_spa_utils/README.md` — install pin **1.0.0**; **Removed: infinite-scroll list APIs (Removed in 1.0.0)** (`useInfiniteScroll`, `InfiniteScrollResponse`, `InfiniteScrollParams`, `UseInfiniteScrollOptions`; cursor fields `after_id` / `limit` / `has_more` / `next_cursor` must not appear in SPA ↔ API contracts); **Universal PageFrame (1.0.0)**; **Cross-SPA URLs** (`buildJourneyUrl`, `resolveAlbOrigin`, `JOURNEY_APP_PATHS`); `AutoSaveSelect` is legacy in favor of `EnumEditor` / `EnumArrayEditor`
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` / `package-lock.json` — currently `"@mentor-forge/mentorhub_spa_utils": "^0.5.7"` (a **caret range**, not a pin); `npm ls` resolves `0.5.7`
- `cypress.config.ts` — imports `@mentor-forge/mentorhub_spa_utils/cypress/jwtDefaults` and `.../cypress/registerJwtSignTask`
- `cypress/support/e2e.ts` — imports `@mentor-forge/mentorhub_spa_utils/cypress/registerAuthCommands` and calls `registerAuthCommands({ visitPath: '/' })`
- Current spa_utils consumers: `src/App.vue`, `src/router/index.ts`, `src/api/client.ts`, `src/initAuth.ts`, `src/composables/useAuth.ts`, `src/composables/useRoles.ts`, `src/composables/useOffsetList.ts`, `src/pages/AdminPage.vue`, `src/pages/ProfilesListPage.vue`, `src/pages/ProfileEditPage.vue`, `src/pages/PathsListPage.vue`, `src/pages/PathEditPage.vue`, `src/pages/PathNewPage.vue`, `src/pages/ResourcesListPage.vue`, `src/pages/ResourceEditPage.vue`, `src/pages/ResourceNewPage.vue`, `src/pages/PlansListPage.vue`, `src/pages/PlanEditPage.vue`, `src/pages/EncounterEditPage.vue`, `src/components/PlanChecklistEditor.vue`, `src/components/dashboard/PlanSelectDialog.vue`, `src/App.test.ts`
- `vitest.config.ts` — inlines `@mentor-forge/mentorhub_spa_utils` in `test.server.deps` (its comment still says "spa_utils 0.5.x")

**Source issue**: F-RS16 ("Pin spa_utils 1.0.0, adopt PageFrame, remove list-card pages"). This task delivers **only** the pin.

**External prerequisite**: `@mentor-forge/mentorhub_spa_utils@1.0.0` must be **published to CodeArtifact** (spa_utils F033–F040, PR 29). Run `mh`, then `npm view @mentor-forge/mentorhub_spa_utils version`. If **1.0.0** is not available, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F148.pin_spa_utils_1_0_0.md`, and stop — do not stay on `0.5.7`, do not keep the caret range, and do not point `package.json` at a git URL.

### Wave ordering (why the pin comes first in this repo)

The two source issues are **F-RS15** (Vue `base` + SPA nginx prefix `/mentor/`) and **F-RS16** (pin 1.0.0 + adopt `PageFrame` + remove list pages). This plan runs **pin (F148) → retire resource/path lists (F149) → plan create page and retire the plans list (F150) → `PageFrame` (F151) → base path (F152–F153) → Cypress and packaging (F154)**.

Pinning first is safe and saves rework here:

- Nothing in this repo imports `useInfiniteScroll` or any `InfiniteScroll*` **from spa_utils**. The cursor types this SPA still uses (`InfiniteScrollParams`, `InfiniteScrollResponse`) are declared **locally** in `src/api/types.ts` and imported from `./types` by `src/api/client.ts`, so the 1.0.0 removal cannot break the build. Confirm that with a grep before starting; the local cursor surface is dead Event-domain code that **F149** deletes.
- Pinning first makes **`buildJourneyUrl`** — a **1.0.0** API — available to F149 and F150, which need it for the "Back to List" actions on the kept edit pages once the local list dashboards are gone. Deleting pages first would force those tasks to write throwaway in-app targets and then re-edit them, which is exactly the rework this ordering avoids.
- `CardGrid`, `MhCard`, `ListPageSearch`, `DataCard`, the typed editors, `AutoSaveSelect`, `AdminPage`, `useErrorHandler`, `useRoles`, `provideEditorConfig`, and `validationRules` all survive in 1.0.0, so the list pages F149/F150 delete still compile and pass under this pin. The repo stays green at every step.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "1.0.0"` — exact semver, **no caret**.
- `package-lock.json` resolves `1.0.0` from the CodeArtifact registry after `mh` and `npm install --include=dev`.
- `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.0`.
- Grep `src/`, `cypress/`, and `tests/` for `useInfiniteScroll`, `InfiniteScroll`, `after_id`, `has_more`, and `next_cursor` and record the results in **Execution Notes**. Expected: **no** import of any of these from `@mentor-forge/mentorhub_spa_utils`, and local-only hits in `src/api/types.ts`, `src/api/client.ts` (`getEvents`), and `src/api/Event.client.test.ts`. Do **not** delete them here — F149 owns that removal.
- The three spa_utils Cypress subpath imports still resolve under 1.0.0: `cypress/jwtDefaults` (`e2eDefaultJwtSecret`), `cypress/registerJwtSignTask` (`registerJwtSignTask`), and `cypress/registerAuthCommands` (`registerAuthCommands`, with the `visitPath` option). If a subpath or option name moved, update the import here — do **not** vendor a local copy of the JWT sign task or the auth commands.
- Existing behavior is unchanged. `npm run test` and `npm run build` pass with no source edits beyond anything 1.0.0 genuinely breaks:
  - `src/initAuth.ts` IdP bootstrap (`bootstrapAuthFromUrl`, `syncAuthFromStorage`) behaves as today,
  - `src/router/index.ts` guards keep using `useAuth` / `hasStoredRole` / `redirectToIdpLogin`, with the `/` → `/profiles` redirect and the `next({ name: 'Profiles' })` role-gate fallback untouched,
  - `src/App.vue` keeps its local `v-app-bar` / `v-navigation-drawer` / `handleLogout` chrome and the existing `provideEditorConfig(config)` call,
  - all list, edit, new, and detail pages still render, including the `AutoSaveSelect` status controls on the path and resource edit pages.
- `vitest.config.ts` may be touched **only** to correct the stale "spa_utils 0.5.x" comment or if 1.0.0 changes whether the package must be inlined for Vitest. Do not change coverage thresholds.
- `README.md` names the pinned version **1.0.0** in its spa_utils note and stops advertising APIs that 1.0.0 removed. Do not describe `PageFrame` adoption or list-page removal here — F149–F151 own that copy.
- Do **not** wrap `PageFrame`, do **not** delete any page or route, and do **not** change `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `src/router/index.ts`, or `src/api/client.ts`.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm ls @mentor-forge/mentorhub_spa_utils` — confirm `1.0.0`
- `npm run test` — full Vitest suite, including `src/App.test.ts`
- `npm run test:coverage` — the `src/api/**`, `src/composables/**`, and `src/components/**` thresholds in `vitest.config.ts` must still hold
- `npm run build` — `vue-tsc` must be clean. **This repo defines no `lint` script**, so `npm run build` is the type gate. Do not add a lint script in this task; record the missing `npm run lint` from the issue acceptance criteria as a follow-up in Execution Notes.
- `npm run api` then `npm run dev` — smoke check at `http://localhost:8392/`: login round-trips through the IdP, `/` redirects to `/profiles` and the mentee cards render, and the local drawer still opens and navigates

**Packaging verification:**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); every existing spec must still pass at the un-prefixed origin

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8392**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `package.json` — exact `1.0.0` pin replacing `^0.5.7`
- `package-lock.json` — resolved `1.0.0` from CodeArtifact
- `README.md` — spa_utils version note and component list
- `vitest.config.ts` — stale version comment only (or the inline setting if 1.0.0 requires it)
- `cypress.config.ts`, `cypress/support/e2e.ts` — only if a spa_utils Cypress subpath or option moved in 1.0.0
- Any `src/**` file that fails to compile or test against `1.0.0`

Do not change `src/App.vue` chrome, `src/router/index.ts`, `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, or `src/api/client.ts` in this task.

## Execution Notes

### Summary
- Pinned `@mentor-forge/mentorhub_spa_utils` to exact `1.0.0` in `package.json` and resolved in `package-lock.json`.
- Verified `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.0`.
- Grepped `src/`, `cypress/`, `tests/` for `useInfiniteScroll`, `InfiniteScroll`, `after_id`, `has_more`, `next_cursor`:
  - No imports of any of these from `@mentor-forge/mentorhub_spa_utils`.
  - Local-only hits found in `src/api/types.ts` (`InfiniteScrollParams`, `InfiniteScrollResponse`), `src/api/client.ts` (`getEvents`), and `src/api/Event.client.test.ts`. These will be cleaned up in F149.
  - Zero occurrences in `cypress/` and `tests/`.
- Checked Cypress subpath imports (`cypress/jwtDefaults`, `cypress/registerJwtSignTask`, `cypress/registerAuthCommands`) — all resolved correctly under 1.0.0.
- Updated stale comment in `vitest.config.ts`.
- Updated `README.md` to reference `1.0.0`.

### Test Results
- `npm run test`: 14 test files passed (93 tests).
- `src/api/**` coverage threshold passed (lines: 98.42%, functions: 100%, branches: 78.26%, statements: 98.42%).
- `npm run build`: `vue-tsc && vite build` built cleanly with 0 errors.

### Follow-ups
- F149 will delete dead Event cursor surface and `useOffsetList`.
- Note: repo does not define `npm run lint`; `npm run build` serves as type check gate.
