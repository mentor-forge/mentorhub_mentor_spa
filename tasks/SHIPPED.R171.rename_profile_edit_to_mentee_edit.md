# R171 – Rename ProfileEditPage to MenteeEditPage

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Pure rename of `ProfileEditPage.vue` to `MenteeEditPage.vue` and update all import references. No functional changes.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`

Additional input files:

- `src/pages/ProfileEditPage.vue`
- `src/router/index.ts`

## Goals

- Rename `src/pages/ProfileEditPage.vue` → `src/pages/MenteeEditPage.vue`.
- Update `src/router/index.ts` to import from `@/pages/MenteeEditPage.vue`. The route name (`ProfileEdit`) and path (`/mentee/:id`) remain **unchanged**.
- Search the entire `src/` and `cypress/` trees for any other import or reference to `ProfileEditPage` and update each one to `MenteeEditPage`. Do not leave any stale reference.
- No changes to the component's template, script, or style — this is a rename only.

### Craftsmanship Expectations

- Do not modify any component logic, template structure, or styles.
- Verify with `grep -r "ProfileEditPage" src/ cypress/` after the rename — the result must be empty.

## Testing Expectations

- **Unit tests** — `npm run test` — all existing tests pass. If there is a test file named `ProfileEditPage.test.ts`, rename it to `MenteeEditPage.test.ts` and update its import path; the test assertions are **not** changed.

- **Build check** — `npm run build` — no missing-module errors.

- **Grep check** — `grep -r "ProfileEditPage" src/ cypress/` returns no results.

## Outputs

- `src/pages/ProfileEditPage.vue` — **[DELETE]** (replaced by rename).
- `src/pages/MenteeEditPage.vue` — **[NEW]** (identical content to former `ProfileEditPage.vue`).
- `src/router/index.ts` — updated import path.
- _(If it exists)_ `src/pages/ProfileEditPage.test.ts` — **[DELETE]**; replaced by `src/pages/MenteeEditPage.test.ts` — **[NEW]** with updated import only.

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
