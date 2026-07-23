# R135 – Bump `@mentor-forge/mentorhub_spa_utils` to 0.5.5

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Bump the Mentor SPA dependency to `@mentor-forge/mentorhub_spa_utils@0.5.5` so list/edit pages can adopt `MhCard` / `CardGrid` / `DataCard`, typed editors, and shared Cypress auth helpers. Refresh the lockfile via CodeArtifact (`mh` + `npm install`).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Card / DataCard / typed-editor / Cypress export public API for 0.5.x
- `package.json`
- `package-lock.json`
- `tasks/_PLANNING.md` — Dependency management (CodeArtifact / `mh`)

**External prerequisite:** `@mentor-forge/mentorhub_spa_utils@0.5.5` must be published to CodeArtifact. If install fails because the version is missing, set **Status** to `Blocked` and stop — do not invent a different version.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "0.5.5"`.
- `package-lock.json` resolves that version from CodeArtifact after `mh` (if needed) and `npm install --include=dev` (or `npm ci --include=dev` when appropriate).
- Existing app still builds and unit-tests against the new package (compatibility: `AutoSaveField` remains exported; no forced page migrations in this task).
- Do **not** migrate pages, API clients, or Cypress auth wiring in this task — that is R136–R144.

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

The agent must not update files outside this list.

## Execution Notes

- Plan:
  1. Confirm `@mentor-forge/mentorhub_spa_utils@0.5.5` is available from CodeArtifact.
  2. Pin the dependency to `0.5.5` and refresh `package-lock.json` with `npm install --include=dev`.
  3. Run unit tests, the production build, and the container build.
- Results:
  - CodeArtifact authentication refreshed with `mh`; version `0.5.5` is available.
  - `npm install --include=dev`: passed and refreshed the lockfile. Local Node 22 produced the expected engine warning because the repository and package require Node 24 or newer.
  - `npm run test`: passed, 13 files and 91 tests.
  - `npm run build`: passed with the existing chunk-size advisory.
  - `npm run container`: passed with the existing Docker JSON-form `CMD` advisory.
  - No Vitest configuration change was needed.
