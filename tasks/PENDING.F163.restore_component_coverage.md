# F163 – Restore `src/components/**` coverage gate

**Status**: Pending  
**Type**: Defect  
**Depends On**: `F162_markdown_editor_cypress_and_packaging`  
**Description**: The `npm run test:coverage` gate already failed on this branch before the spa_utils **1.0.6** pin (`src/components/**` functions below 90%, driven by `dashboard/index.ts` and `ScheduleEncountersDialog.vue`). F160–F162 waived that gate. This task raises component coverage so the existing thresholds pass again, and fixes any unit-test failures that were already present (not introduced as new product behavior).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `vitest.config.ts` — thresholds for `src/api/**`, `src/composables/**`, and `src/components/**` (functions 90% on components). Do not lower them.
- `src/components/dashboard/index.ts` — barrel re-export; reported **0%** function/line coverage when nothing imports it from a test
- `src/components/dashboard/ScheduleEncountersDialog.vue` — reported ~**42%** functions (v8 counts template/script functions that current tests do not invoke)
- `src/components/dashboard/ScheduleEncountersDialog.test.ts` — existing mount/shallowMount coverage (closed render, cancel emit, submit payload)

**Known baseline (pre-pin, confirmed during F160):** `npm run test` passed; `npm run test:coverage` failed with `src/components/**` functions **80.48%** (threshold 90%). Lines/statements on components were already above threshold. After F161 deletes local `DataCardGrid` / `MarkdownEditor` (high function coverage), the function percentage can drop further — measure against the tree after F162, not the F160 number.

**Out of scope**: Changing the spa_utils pin. Reintroducing local `DataCardGrid` / `MarkdownEditor` or `CardGrid` list dashboards. Lowering thresholds or excluding `src/components/**` to make the gate pass.

## Goals

- `npm run test` passes (all unit tests).
- `npm run test:coverage` exits 0. Existing thresholds in `vitest.config.ts` hold, including `src/components/**` functions ≥ 90%, without lowering any threshold.
- `src/components/dashboard/index.ts` is exercised (import the barrel from a unit test, or equivalent) so it is no longer 0%.
- `ScheduleEncountersDialog` function coverage rises enough that the components threshold passes: cover loading state, dialog `update:modelValue`, plan/day/time/date handlers, and submit/cancel paths that v8 currently counts as uncovered. Keep assertions on the public contract (`submit` payload, automation ids), not private implementation details.
- If `npm run test` fails for a reason that existed before this task’s edits, fix that failure in the smallest test or fixture change. Do not change production behavior except where a test exposes a real defect in files this task may edit.
- `npm run build` stays clean.

### Craftsmanship Expectations

- Prefer more tests over excluding files or dropping thresholds.
- Keep journey-specific dialog behavior in this SPA; do not move `ScheduleEncountersDialog` into spa_utils in this task.
- Do not reintroduce harvested local editors to inflate coverage.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test`
- `npm run test:coverage` — must pass with current thresholds
- `npm run build`

Do not run Cypress or packaging unless a test change requires it (it should not).

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `src/components/dashboard/ScheduleEncountersDialog.test.ts` — additional cases that raise function coverage
- A unit test that imports `src/components/dashboard/index.ts` (new `src/components/dashboard/index.test.ts` or an import inside the dialog test file)

**Update only if required to make an existing failing unit test pass:**

- `src/components/dashboard/ScheduleEncountersDialog.vue`
- Other `src/**/*.test.ts` files that fail for a pre-existing reason

Do not change `vitest.config.ts` thresholds. Do not add coverage excludes for `src/components/**`.

## Execution Notes

_Reserved for the task execution agent._
