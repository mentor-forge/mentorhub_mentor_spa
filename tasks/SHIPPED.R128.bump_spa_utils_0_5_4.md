# R128 – Bump `@mentor-forge/mentorhub_spa_utils` to 0.5.4

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Bump the Mentor SPA dependency to `@mentor-forge/mentorhub_spa_utils@0.5.4` so list and edit pages can adopt `MhCard` / `CardGrid` / `DataCard` and type-aligned editors. Refresh the lockfile via CodeArtifact (`mh` + `npm install`).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Card / DataCard / typed-editor public API for 0.5.x
- `package.json`
- `package-lock.json`
- `tasks/_PLANNING.md` — Dependency management (CodeArtifact / `mh`)

**External prerequisite:** `@mentor-forge/mentorhub_spa_utils@0.5.4` must be published to CodeArtifact. If install fails because the version is missing, set **Status** to `Blocked` and stop — do not invent a different version.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "0.5.4"`.
- `package-lock.json` resolves that version from CodeArtifact after `mh` (if needed) and `npm install --include=dev` (or `npm ci --include=dev` when appropriate).
- Existing app still builds and unit-tests against the new package (compatibility: `AutoSaveField` remains exported; no forced renames in this task).
- Do **not** migrate pages to cards/editors in this task — that is R129–R133.

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

- `package.json` — bump `@mentor-forge/mentorhub_spa_utils` to `0.5.4`
- `package-lock.json` — lock resolved 0.5.4 tarball
- `vitest.config.ts` — only if needed so unit tests load spa_utils `dist/index.css` (e.g. `server.deps.inline` for `@mentor-forge/mentorhub_spa_utils`)

The agent must not update files outside this list.

## Execution Notes

### Plan
1. Pin `@mentor-forge/mentorhub_spa_utils` to `0.5.4` in `package.json` (was `0.2.2`).
2. Run `mh` for CodeArtifact auth, then `npm install --include=dev` to refresh `package-lock.json`.
3. If 0.5.4 is missing from CodeArtifact → Status `Blocked` and stop.
4. Fix Vitest CSS load via `vitest.config.ts` (`server.deps.inline`).
5. Run `npm run test`, `npm run build`, `npm run container`.
6. Document results; leave Status Pending for orchestrator.

### Commands run
- `mh` — CodeArtifact auth refreshed (ok)
- `npm install --include=dev` — resolved `@mentor-forge/mentorhub_spa_utils@0.5.4` from CodeArtifact (ok; Node engine warning v22 vs >=24 only)
- `npm run test` (before Vitest fix) — **FAIL** (CSS unknown extension)
- `npm run build` (initial) — **PASS**
- `npm run container` (initial) — **PASS**
- Orchestrator added `server.deps.inline: ['@mentor-forge/mentorhub_spa_utils']` to `vitest.config.ts`
- `npm run test` (after Vitest fix) — **PASS** — no further vitest tweaks needed
- `npm run build` (re-verify) — **PASS**
- `npm run container` — skipped on re-verify (no changes beyond vitest after prior container PASS)

### Dependency result
- `package.json`: `"@mentor-forge/mentorhub_spa_utils": "0.5.4"`
- `package-lock.json`: resolved `mentorhub_spa_utils-0.5.4.tgz` from CodeArtifact
  - integrity `sha512-8xmL/KK4kQKWNwz2EBr+22PEPEaphky6IO/yoJEmtP25Y7e/TR5o9/gyjHNuV62WPl8vmx+s9DZDyNGlVVEGuQ==`

### Vitest fix
- `vitest.config.ts`: `test.server.deps.inline: ['@mentor-forge/mentorhub_spa_utils']` so Vitest transforms spa_utils `dist/index.css` side-import (0.5.4+).

### Final test results
- **test**: 13 passed (13) | 92 passed (92). Exit 0.
- **build**: `vue-tsc && vite build` succeeded (re-verified).
- **container**: previously succeeded; not re-run.

### Orchestrator note
- **Ready to ship** — dependency bump + Vitest CSS inline fix green; Status left Pending for orchestrator rename/commit.
