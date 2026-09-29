# R168 – DataCardGrid Layout Component

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Create a local `DataCardGrid` Vue layout component designed to be harvested to `spa_utils`. Used by R170 and R173.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`

Additional input files:

- `src/components/dashboard/` — review existing `CardGrid` component(s) here for the column rule pattern to exceed.
- `src/components/PlanChecklistEditor.test.ts` — example unit test pattern.

## Goals

- Create `src/components/DataCardGrid.vue`:
  - A wrapper component that renders a CSS grid container via scoped `<style>`.
  - Exposes a default `<slot>` — no component-specific logic beyond layout.
  - Responsive column rules:
    - **Mobile** (max-width 640 px): 1 column.
    - **Laptop** (~640 px – 1919 px): 2 columns.
    - **Wide** (min-width 1920 px): 4 columns.
  - Column width uses `minmax` or `auto-fill` so cards fill all available horizontal space.
  - The column minimum must be wider than the existing `CardGrid` column minimum (inspect the existing component and set a value explicitly larger).
  - Root element uses `data-automation-id="data-card-grid"`.
  - No mentor-specific imports (no API, no store, no domain composables).

### Craftsmanship Expectations

- Pure layout component — no props required for v1.
- Use CSS media queries in a scoped `<style>` block; do not rely on Vuetify grid classes for the outer grid (the component is intended for `spa_utils` where Vuetify may not be available).

## Testing Expectations

- **Unit tests** — `npm run test`
  - `src/components/DataCardGrid.test.ts` must cover:
    - The root element renders with `data-automation-id="data-card-grid"`.
    - Slotted children are rendered inside the root element.
  - All existing tests continue to pass.

- **Build check** — `npm run build` — no type errors.

## Outputs

- `src/components/DataCardGrid.vue` — **[NEW]**
- `src/components/DataCardGrid.test.ts` — **[NEW]**

The agent must not update files outside this list.

## Execution Notes

- **Planned Approach**:
  - Review `spa_utils/src/components/CardGrid.vue`: CardGrid scaled up to 6 columns at 1920px and 8 columns at 2560px with ~300px column tracks.
  - Create `src/components/DataCardGrid.vue` with scoped CSS grid:
    - 1 column on mobile (max-width: 640px)
    - 2 columns on laptop (641px - 1919px)
    - 4 columns on wide displays (min-width: 1920px)
    - Column tracks use `minmax(0, 1fr)` so cards expand to fill horizontal space, with minimum column width significantly wider than CardGrid.
    - Root element has `data-automation-id="data-card-grid"` and default slot.
  - Create unit tests in `src/components/DataCardGrid.test.ts`.
  - Verify with `npm run test` and `npm run build`.

- **Implementation Summary**:
  - Created `src/components/DataCardGrid.vue` layout wrapper with scoped CSS grid responsive breakpoints (1 col <= 640px, 2 cols 641px-1919px, 4 cols >= 1920px), minimum width explicitly larger than `CardGrid`, default slot, and root `data-automation-id="data-card-grid"`.
  - Created unit tests in `src/components/DataCardGrid.test.ts` verifying automation ID, class, and slotted children rendering.
  - All 18 test suites (123 tests) passed; `npm run build` passed with zero errors.


