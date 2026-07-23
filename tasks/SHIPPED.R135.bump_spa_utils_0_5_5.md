# R135 – Bump `@mentor-forge/mentorhub_spa_utils` to 0.5.5

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Bump the Mentor SPA dependency to `@mentor-forge/mentorhub_spa_utils@0.5.5` so list and edit pages can adopt `MhCard` / `CardGrid` / `DataCard`, typed editors (including enum editors), and drop deprecated infinite-scroll list helpers. Refresh the lockfile via CodeArtifact (`mh` + `npm install`).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Card / DataCard / typed-editor public API; deprecated infinite-scroll list APIs
- `../mentorhub_mentee_spa/src/pages` — example pages already adopted in the mentee SPA
- `package.json`
- `package-lock.json`
- `tasks/_PLANNING.md` — Dependency management (CodeArtifact / `mh`)

**External prerequisite:** `@mentor-forge/mentorhub_spa_utils@0.5.5` must be published to CodeArtifact. If install fails because the version is missing, set **Status** to `Blocked` and stop — do not invent a different version.

**Supersedes:** R128 (0.5.4 bump). Prefer this task over R128 if both remain Pending.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "0.5.5"`.
- `package-lock.json` resolves that version from CodeArtifact after `mh` (if needed) and `npm install --include=dev` (or `npm ci --include=dev` when appropriate).
- Existing app still builds and unit-tests against the new package (compatibility: `AutoSaveField` remains exported; no forced renames in this task).
- Do **not** migrate pages to cards/editors or change list pagination clients in this task — that is R136–R141.

## Testing Expectations

Run all commands from this SPA repository root.

- **Install**
  - Run `mh` once per shell session if CodeArtifact credentials are not already available
  - `npm install --include=dev` (or `npm ci --include=dev` after lockfile is committed/updated)

- **Unit / build**
  - `npm run test`
  - `npm run build`

- **Packaging verification**
  - `npm run container`

## Outputs

- `package.json` — bump `@mentor-forge/mentorhub_spa_utils` to `0.5.5`
- `package-lock.json` — lock resolved 0.5.5 tarball
- `vitest.config.ts` — inline `@mentor-forge/mentorhub_spa_utils` so Vitest can transform package CSS side-effect import (required for unit tests after 0.5.5)

The agent must not update files outside this list.

## Execution Notes

### Plan (2026-07-23)
- Confirm branch `FRS13try2` (do not switch).
- Goals already satisfied in tree: `package.json` and `package-lock.json` pin `@mentor-forge/mentorhub_spa_utils@0.5.5` (commit `ca36445`). Do not change version.
- No page migrations (R136+).
- Auth/install: `mh` then `npm install --include=dev`.
- Verify: `npm run test`, `npm run build`, `npm run container`.

### Results
- Install: `npm install --include=dev` — up to date at 0.5.5 (CodeArtifact tarball).
- Unit tests initially failed: Vitest `Unknown file extension ".css"` for spa_utils `dist/index.css` side-effect import.
- Fix: `vitest.config.ts` `server.deps.inline: ['@mentor-forge/mentorhub_spa_utils']` (same pattern as mentee SPA).
- `npm run test` — 13 files / 92 tests passed.
- `npm run build` — passed.
- `npm run container` — passed (`ghcr.io/mentor-forge/mentorhub_mentor_spa:latest`).
- Compatibility: no page renames; AutoSaveField not touched.
