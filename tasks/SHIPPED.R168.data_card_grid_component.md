# R168 – DataCardGrid Layout Component

**Status**: Pending  
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

_Reserved for the task execution agent._
