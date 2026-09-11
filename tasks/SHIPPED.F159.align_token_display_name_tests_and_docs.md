# F159 – Align Mentor SPA tests and docs to token `display_name`

**Status**: Pending  
**Type**: Feature  
**Depends On**: F158_verify_token_display_name_contract  
**Description**: If F158 confirms that mentor API issue [#29](https://github.com/mentor-forge/mentorhub_mentor_api/issues/29) changes the token field surfaced to this SPA, update the smallest necessary Mentor SPA tests, stubs, and documentation from token `name` assumptions to token `display_name`. If F158 proves no SPA change is required, this task should be marked Shipped with a no-op summary and no source edits.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F158.verify_token_display_name_contract.md` (or shipped/blocked successor) — use its Execution Notes as the source of truth for what actually changed
- `src/api/types.ts`
- `src/composables/useConfig.ts`
- `src/composables/useRoles.ts`
- `cypress/e2e/navigation.cy.ts`
- `src/api/types.test.ts`
- `src/composables/useConfig.test.ts`
- `src/composables/useRoles.test.ts`
- `../mentorhub_spa_utils/README.md` — shared Token tab ownership and any display-name wording already handled upstream

### What this task owns

This task only handles **Mentor SPA-local fallout** from the mentor API token field rename, such as:

- typed config models if this SPA benefits from stronger token typing
- local unit-test fixtures that model token/config payloads
- Cypress `/mentor/api/config` stubs or Token-tab assertions
- README wording if it names the old token field explicitly

### What this task does not own

- the mentor API implementation itself
- `api_utils` package changes
- `spa_utils` shared AdminPage implementation
- unrelated `display_name` usage for profile/domain entities already shipped in this SPA
- speculative refactors when F158 shows the current SPA code is already compatible

## Goals

- Any SPA-local token-contract fixtures, stubs, or docs use `display_name` instead of `name` when they model the authenticated token payload.
- There are no misleading tests that pass by using an obsolete token field name.
- Existing behavior for admin config navigation, Token tab visibility, and role handling remains intact after the fixture/doc updates.
- No unrelated `name` fields for domain models, filters, or profile data are renamed.
- If F158 concluded this repo is already compatible, this task completes as a documented no-op without unnecessary source churn.

### Craftsmanship Expectations

- Follow F158 rather than broad search-and-replace.
- Prefer fixture and documentation updates over production-code changes when the runtime code is already tolerant or unaffected.
- Keep shared Token-tab ownership in `spa_utils`; do not fork or restyle it locally to compensate for contract drift.
- Preserve stable automation IDs unless shared upstream behavior explicitly changed.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Confirmation searches**
  - `rg 'token\.name|token\[.name.\]|token\.get\(.name.\)' src cypress README.md`
  - `rg 'display_name' src cypress README.md`
- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Focused E2E / packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

The verification should confirm that admin Token-tab coverage still reflects the real runtime contract and that any token fixture updates did not break role-gated navigation.

## Outputs

Paths are relative to **this SPA repository root**.

Update only the files that F158 proves need changes:

- `cypress/e2e/navigation.cy.ts`
- `src/api/types.ts`
- `src/api/types.test.ts`
- `src/composables/useConfig.ts`
- `src/composables/useConfig.test.ts`
- `src/composables/useRoles.ts`
- `src/composables/useRoles.test.ts`
- `README.md`

Skip untouched files rather than churning them. The agent must not update files outside this list.

## Execution Notes

