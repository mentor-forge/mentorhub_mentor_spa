# R138 – Provide runtime editor config for typed enum editors

**Status**: Shipped
**Type**: Feature  
**Depends On**: R135  
**Description**: Wire `provideEditorConfig` from spa_utils at the app root using the existing `useConfig` fetch so `EnumEditor` / `EnumArrayEditor` can resolve enumerator options from `/api/config`. Required before DataCard migrations prefer typed enum editors over hard-coded `AutoSaveSelect` items.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md` — Runtime enumerators / `provideEditorConfig`
- `src/App.vue` — already calls `loadConfig()` when authenticated
- `src/composables/useConfig.ts`
- `src/composables/useConfig.test.ts`
- `src/App.test.ts` (create if missing and needed for coverage)

## Goals

- After config is available (same authenticated startup path that already calls `loadConfig`), call `provideEditorConfig(...)` with a reactive ref/computed/getter over the loaded config object so editors update when load completes.
- Do not hard-code enumerator option arrays in App.
- Keep existing `useConfig` / roles behavior intact.
- Add or update a focused unit test that App (or a thin wrapper) provides editor config and that missing/unknown enumerators resolve to empty options at the SPA boundary (without duplicating spa_utils package tests).

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit / build**
  - `npm run test`
  - `npm run build`

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/App.vue` — `provideEditorConfig` wired to config from `useConfig`
- `src/composables/useConfig.ts` — only if a small export is needed to expose reactive config for provide
- `src/App.test.ts` — create or update coverage for editor-config provide
- `src/composables/useConfig.test.ts` — only if useConfig contract changes

The agent must not update files outside this list.

## Execution Notes

- Approach: pass the reactive `config` computed ref from `useConfig()` to spa_utils'
  `provideEditorConfig` at the app root through a typed getter, then cover the SPA
  boundary with a focused App test that verifies the provided getter tracks loading,
  loaded, and unknown-enumerator states.
- `useConfig()` already returned the shared reactive `config` as a computed ref; no
  composable change was required.
- `npx vitest run src/App.test.ts`: passed (1 file, 1 test).
- `npm run test`: R138 coverage passed, with 46 tests passing overall; command exited
  non-zero because 8 pre-existing suites cannot load the spa_utils root package's
  CSS side-effect (`ERR_UNKNOWN_FILE_EXTENSION` for `dist/index.css`).
- `npm run build`: passed.
- `npm run container`: passed; built
  `ghcr.io/mentor-forge/mentorhub_mentor_spa:latest`.
