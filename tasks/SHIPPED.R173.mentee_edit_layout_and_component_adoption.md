# R173 – MenteeEditPage: Goals/Interests Layout and Component Adoption

**Status**: Shipped  
**Type**: Feature  
**Depends On**: R167, R168, R171, R172  
**Description**: Update the MenteeEditPage layout: Goals and Interests side-by-side, adopt `DataCardGrid`, and adopt `MarkdownSentenceField` for any long-text fields.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`

Additional input files:

- `src/pages/MenteeEditPage.vue` (updated in R171 + R172)
- `src/components/DataCardGrid.vue` (created in R168)
- `src/components/MarkdownSentenceField.vue` (created in R167)
- `cypress/e2e/profile.cy.ts`

## Goals

- **Goals and Interests side-by-side**: Within the Goals/Interests data card (or section), lay out the Goals editor and Interests editor horizontally side-by-side.
  - At narrow/mobile widths (≤ 640 px) they stack vertically.
  - Use a `v-row`/`v-col` split (50%/50%) at standard widths, falling back to `cols="12"` at `sm` breakpoint or below.
  - Do not create a new wrapper component for this — use the existing Vuetify grid system inline.

- **DataCardGrid layout**: Replace the current outer `v-row`/`v-col` page layout with `<DataCardGrid>` (from `src/components/DataCardGrid.vue`), so all DataCards sit in the responsive grid.

- **MarkdownSentenceField adoption**: For any long-text field on the page that currently uses a plain `<textarea>` or a bare `AutoSaveField` with a text area (e.g., Mentor Notes if present), replace it with `MarkdownSentenceField` (from `src/components/MarkdownSentenceField.vue`). Pass `readonly` based on the page's current read/edit state. If no such field exists on this page, note it in Execution Notes and skip this goal.

### Craftsmanship Expectations

- Do not modify Goals or Interests data-fetching or save logic — only the layout.
- The Goals/Interests side-by-side arrangement must be inside the existing card, not a new top-level section.
- `DataCardGrid` and `MarkdownSentenceField` must be imported from `src/components/`; do not re-implement inline.

## Testing Expectations

- **Unit tests** — `npm run test` — all existing tests pass.

- **Dev verification**
  - `npm run api` + `npm run dev`.
  - Goals and Interests sections appear side-by-side at laptop width.
  - At narrow width (resize browser to ≤ 640 px) they stack vertically.
  - DataCards render in a responsive two-column grid.

- **E2E tests** — `npm run cypress:run` — existing specs pass, then update `cypress/e2e/profile.cy.ts`:
  - Assert Goals and Interests containers are siblings within the same row element at desktop viewport.

- **Packaging verification**
  - `npm run container` → `npm run service` → `npm run cypress:run`.

## Outputs

- `src/pages/MenteeEditPage.vue` — Goals/Interests side-by-side layout, `DataCardGrid` outer layout, `MarkdownSentenceField` for long-text fields.
- `cypress/e2e/profile.cy.ts` — updated assertions for side-by-side Goals/Interests.

The agent must not update files outside this list.

## Execution Notes

- **Implementation Summary**:
  - Replaced outer `v-row` and `v-col` layout with `<DataCardGrid>` in `src/pages/MenteeEditPage.vue`, using `<v-container fluid>` for full viewport width.
  - Reorganized Goals and Interests inside the Mentee card to be side-by-side using `<v-row class="mb-4">` with `<v-col cols="12" sm="6">` each.
  - Adopted `MarkdownSentenceField` for the Mentee card Notes field: enables vertical auto-expansion to show all content up to 40vh, with debounced save and instant save on blur.
  - Adopted `MarkdownSentenceField` for the Encounters card list: renders TLDR in read-only mode with word-wrapping, removing single-line ellipsis truncation.
  - Updated `cypress/e2e/profile.cy.ts` with assertions verifying side-by-side Goals/Interests, Notes auto-expanding input, and Encounters TLDR rendering.
  - All 124 Vitest unit tests and `vue-tsc && vite build` passed cleanly; all 43 Cypress E2E tests passed 100%.

