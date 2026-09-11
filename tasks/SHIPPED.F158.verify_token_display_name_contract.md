# F158 – Verify mentor API token `display_name` contract for Mentor SPA

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Plan the Mentor SPA side of [mentorhub_mentor_api#29](https://github.com/mentor-forge/mentorhub_mentor_api/issues/29). The SPA does not depend on `mentorhub_api_utils` directly, so this task verifies the actual mentor API `/mentor/api/config` and OpenAPI contract after the API change, confirms whether any local code or test fixtures still assume a token `name` field, and records the smallest necessary SPA updates. If the backing mentor API has not shipped the `display_name` contract yet, mark this task Blocked and stop rather than guessing.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` — confirm this SPA has no `mentorhub_api_utils` dependency and already pins `@mentor-forge/mentorhub_spa_utils`
- `src/api/types.ts` — `ConfigResponse` currently treats `token` loosely
- `src/composables/useConfig.ts`
- `src/composables/useRoles.ts`
- `src/pages/ProfileEditPage.vue` — already uses profile `display_name`; do not regress this
- `cypress/e2e/navigation.cy.ts` — current `/mentor/api/config` stubs and Token tab assertions
- `../mentorhub_spa_utils/README.md` — AdminPage / Token tab ownership and token claim display behavior

**Source issue**: [mentorhub_mentor_api#29](https://github.com/mentor-forge/mentorhub_mentor_api/issues/29) — bump `api_utils` to `1.0.1` and replace token `name` with `display_name`.

### External prerequisite

This SPA cannot implement the API contract itself. Before changing local code, confirm the backing mentor API now exposes the intended token contract at runtime:

- start the local backing API stack (`npm run api`) if needed
- fetch the live OpenAPI: `curl -X GET "http://localhost:8391/docs/openapi.yaml"`
- inspect authenticated `GET /mentor/api/config` behavior through this SPA stack or equivalent API verification

If mentor API issue `#29` has not shipped, or the live contract still exposes only token `name`, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F158.verify_token_display_name_contract.md`, and stop. Do not invent a local compatibility shim.

### Scope guardrails

- Do **not** bump `@mentor-forge/mentorhub_spa_utils`; this SPA already pins `1.0.2`.
- Do **not** add `mentorhub_api_utils` to this SPA.
- Do **not** rename domain model fields such as profile `name`, `full_name`, path `name`, resource `name`, or plan `name`.
- Do **not** create local token normalization like `display_name ?? name`.
- Do **not** change sibling repositories from this task.

## Goals

- Confirm whether `mentorhub_mentor_spa` has any real dependency on the mentor API token display-field rename beyond `/mentor/api/config` test fixtures and documentation.
- Verify there are zero local reads of token `name` in SPA source, tests, or docs where the value is meant to come from the authenticated token contract.
- If the live mentor API / AdminPage surface now exposes `display_name`, identify the precise local files that need to change and keep the change set minimal.
- If no local code changes are required, document that conclusion in **Execution Notes** with the proof used to reach it.
- Preserve existing profile UI behavior that already uses `display_name` for profile/person data; this task is only about token contract impact.

### Craftsmanship Expectations

- Prefer proving that no SPA code change is needed over speculative churn.
- Treat the mentor API runtime contract as authoritative; do not infer token shape from unrelated repositories.
- Keep ownership boundaries clear: mentor API owns token payload shape, `spa_utils` owns shared Token-tab rendering, this SPA owns only its local bindings, stubs, and docs.
- When a local update is required, change the narrowest source of truth instead of copying token fields across layers.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Contract verification**
  - `npm run api`
  - `curl -X GET "http://localhost:8391/docs/openapi.yaml"`
  - verify the live authenticated `/mentor/api/config` token payload shape with the current mentor API stack
- **Confirmation searches**
  - `rg 'token\.name|token\[.name.\]|token\.get\(.name.\)|\bname\b' src cypress README.md` — review hits and prove any remaining `name` references are domain/document fields, not token contract usage
  - `rg 'display_name' src cypress README.md`
- **Build / test gate**
  - `npm run test`
  - `npm run build`
- **Packaging verification**
  - `npm run container`
  - `npm run service`
  - `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts`

Testing should prove the actual browser/API path still works through `/mentor/api/config`, not only local TypeScript assumptions.

## Outputs

Paths are relative to **this SPA repository root**.

Possible updates, only if the verified contract requires them:

- `src/api/types.ts` — narrow `ConfigResponse.token` typing if the live contract is specific enough to justify it
- `src/composables/useConfig.ts` — only if token-contract typing or parsing needs alignment
- `src/composables/useRoles.ts` — only if token display-field assumptions exist
- `cypress/e2e/navigation.cy.ts` — only if token stubs/assertions must change for `display_name`
- `README.md` — only if token/admin documentation references the old token field name

If verification proves no file changes are needed, do not touch these files; record the no-op conclusion in **Execution Notes**.

## Execution Notes

