# F160 – Pin `@mentor-forge/mentorhub_spa_utils@1.0.6`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: This repo owns the Mentor SPA **1.0.6 pin** (spa_utils 1.0.6 wave — CardGrid removal, harvest DataCardGrid / MarkdownEditor). Bump `@mentor-forge/mentorhub_spa_utils` from exact `1.0.5` to exact **`1.0.6`**, refresh the lockfile from CodeArtifact, remove any remaining `CardGrid` import or README advertising of package `CardGrid`, and fix compile/unit-test breakage from the removed export. Do **not** harvest local `DataCardGrid` / `MarkdownEditor` in this task (F161). Do **not** reintroduce list card dashboards.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — exact semver pins for shared packages; CodeArtifact (`mh` then `npm install`)
- `../mentorhub_spa_utils/README.md` — install pin **1.0.6**; **MhCard / DataCard / DataCardGrid**; shared list **`CardGrid` left this package in 1.0.6**; **Type-aligned editors** (`markdown` / `MarkdownEditor`); list dashboards belong to Discovery
- `README.md` — currently documents spa_utils **1.0.5** and still lists package `CardGrid` under reusable components; already prohibits CardGrid list dashboards in this SPA
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` / `package-lock.json` — currently `"@mentor-forge/mentorhub_spa_utils": "1.0.5"`
- `src/App.vue` — `PageFrame` with `pageTitle` only (keep; do not pass `navItems`, ALB URLs, or role tables)
- `vitest.config.ts` — comment may still say an older spa_utils version

**Source issue**: Pin spa_utils 1.0.6 — CardGrid removal, harvest DataCardGrid and MarkdownEditor (Mentor SPA). This task delivers **only** the pin and CardGrid cleanup.

**External prerequisite**: `mentorhub_spa_utils` F050–F056 shipped and **`@mentor-forge/mentorhub_spa_utils@1.0.6` is published to CodeArtifact**. Run `mh`, then `npm view @mentor-forge/mentorhub_spa_utils version`. If **1.0.6** is not available, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F160.pin_spa_utils_1_0_6.md`, and stop — do not stay on `1.0.5` and do not point `package.json` at a git URL.

This SPA is the **first** `mentorhub_mentor_spa` issue in the 1.0.6 wave and **owns this repo’s pin**. Sibling SPAs pin independently; do not change other repos.

**Out of scope**: Switching pages to package `DataCardGrid` / `MarkdownEditor` or deleting SPA-local copies (F161). Cypress markdown edit-mode / packaging (F162). Do not reintroduce list card dashboards. Collections stay on Discovery. Keep detail/edit/create for resources, paths, plans, and encounters.

### Wave ordering

Pin + CardGrid cleanup (F160) → harvest DataCardGrid / MarkdownEditor (F161) → Cypress + packaging (F162). Pinning first makes the 1.0.6 catalog (no `CardGrid`, package `DataCardGrid` / rendered `MarkdownEditor`) available before harvest. Existing Cypress may still assume older markdown DOM behavior, so **do not run** `npm run cypress:run` here.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "1.0.6"` — exact semver, **no caret**.
- `package-lock.json` resolves `1.0.6` from the CodeArtifact registry after `mh` and `npm install --include=dev`.
- `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.6`.
- No `src/**` (or test) import of `CardGrid` from `@mentor-forge/mentorhub_spa_utils`. If any import/layout remains, delete it — do **not** replace it with a local list-card dashboard.
- `README.md` names the pinned version **1.0.6**. Stop advertising package `CardGrid` / `ListPageSearch` list-dashboard chrome as something this SPA consumes. Document that multi-card view/edit uses `DataCardGrid` (harvested in F161) and that list collections live on Discovery. Keep the existing **Prohibited:** CardGrid list dashboards note.
- The app still builds and unit-tests under 1.0.6. Local `src/components/DataCardGrid.vue` and `src/components/MarkdownEditor.vue` may remain for this task; F161 deletes them.
- `vitest.config.ts` may be touched **only** to correct a stale spa_utils version comment or if 1.0.6 changes whether the package must be inlined for Vitest. Do not change coverage thresholds.
- The three spa_utils Cypress subpath imports still resolve under 1.0.6: `cypress/jwtDefaults`, `cypress/registerJwtSignTask`, and `cypress/registerAuthCommands`. If a subpath or option name moved, update the import here — do **not** vendor a local copy. Do not rewrite detail Cypress specs here.

### Craftsmanship Expectations

- Reuse `mentorhub_spa_utils` for shared SPA behavior rather than creating local equivalents.
- Treat DRY as avoiding duplicated knowledge: list-card dashboards are Discovery-owned; do not grow a parallel CardGrid here because the package export disappeared.
- Keep journey-specific behavior in this SPA (detail/edit/create). Prefer deleting obsolete local behavior when responsibility has moved — CardGrid layout that depended on the removed export is deleted, not reinvented.
- Do not introduce local workarounds for 1.0.6 CardGrid removal.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm ls @mentor-forge/mentorhub_spa_utils` — confirm **1.0.6**
- `npm run test` — full Vitest suite
- `npm run test:coverage` — **waived for this task** (developer decision). Record the result. A pre-existing `src/components/**` function-threshold miss (`dashboard/index.ts`, `ScheduleEncountersDialog.vue`) must not block F160. Do not change thresholds or add coverage here — **F163** owns restoring the gate.
- `npm run build` — `vue-tsc` must be clean. **This repo defines no `lint` script**, so `npm run build` is the type gate. Do not add a lint script in this task.

Do **not** run `npm run cypress:run` in this task. Markdown resting-view / `${automationId}-input` Cypress updates are F162. Do not “fix” detail specs here unless a unit test or `vue-tsc` fails.

Packaging (`npm run container` / `npm run service`) is **F162**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `package.json` — `"@mentor-forge/mentorhub_spa_utils": "1.0.6"`
- `package-lock.json` — resolved 1.0.6 from CodeArtifact
- `README.md` — spa_utils version note **1.0.6**; remove package `CardGrid` from the reusable-components list; note Discovery owns list collections and F161 harvests `DataCardGrid` / `MarkdownEditor`
- `vitest.config.ts` — stale version comment only (or the inline setting if 1.0.6 requires it)
- `cypress.config.ts`, `cypress/support/e2e.ts` — only if a spa_utils Cypress subpath or option moved in 1.0.6
- Any `src/**` import or type that fails to compile against 1.0.6 because `CardGrid` (or another removed export) was imported

Do not switch pages to package `DataCardGrid` / `MarkdownEditor` yet. Do not delete `src/components/DataCardGrid.vue` or `src/components/MarkdownEditor.vue`. Do not remove `marked` / `dompurify` yet. Do not pass disallowed `PageFrame` props. Do not change Cypress detail specs in this task unless a compile of test helpers breaks. Do not change `src/router/index.ts`, `vite.config.ts`, `nginx.conf.template`, or `Dockerfile`.

## Execution Notes

### Planned approach

1. Confirm `@mentor-forge/mentorhub_spa_utils@1.0.6` on CodeArtifact (`mh`, `npm view`); stop with Blocked if missing.
2. Bump `package.json` to exact `1.0.6`; run `npm install --include=dev` to refresh `package-lock.json`.
3. Scan `src/**` for `CardGrid` / removed exports from spa_utils — none expected (local `DataCardGrid` stays until F161).
4. Update `README.md`: pin **1.0.6**, drop package `CardGrid` / `ListPageSearch` from consumed components; note Discovery list ownership and F161 harvest of `DataCardGrid` / `MarkdownEditor`; update Ownership Boundaries table.
5. Touch `vitest.config.ts` only to fix stale spa_utils version comment (keep inline deps).
6. Adjust Cypress config/support only if 1.0.6 subpaths moved (verify after install).
7. Run `npm ls`, `npm run test`, `npm run test:coverage`, `npm run build`.

### Summary

- Confirmed CodeArtifact publishes `@mentor-forge/mentorhub_spa_utils@1.0.6` (`npm view` after `mh`).
- Pinned exact **1.0.6** in `package.json`; lockfile refreshed via `npm install --include=dev`.
- No `src/**` import of package `CardGrid` from spa_utils (pages use local `DataCardGrid` until F161). Cypress subpaths unchanged.
- README updated for **1.0.6**, removed package `CardGrid` / `ListPageSearch` from consumed components, noted Discovery list ownership and F161 harvest.
- `vitest.config.ts` comment updated to 1.0.6 (inline deps unchanged).

### Files changed

- `package.json`, `package-lock.json`
- `README.md`
- `vitest.config.ts`

### Command results

| Command | Result |
|---------|--------|
| `npm view @mentor-forge/mentorhub_spa_utils version` | `1.0.6` |
| `npm ls @mentor-forge/mentorhub_spa_utils` | `1.0.6` |
| `npm run test` | **PASS** — 18 files, 137 tests |
| `npm run test:coverage` | **FAIL** — `src/components/**` functions **80.48%** (threshold 90%); pre-existing on `1.0.5` baseline (`dashboard/index.ts` 0%, `ScheduleEncountersDialog.vue` ~42% functions) |
| `npm run build` | **PASS** — `vue-tsc && vite build` clean |

### Coverage waiver

Developer waived `npm run test:coverage` for F160–F162. The component function-threshold miss is pre-existing (same on `1.0.5`) and is owned by **F163**. Pin, unit tests, and build are the F160 acceptance gates.
