# R179 – Document SPA setup and verify provider-neutral runtime behavior

**Status**: Pending

**Type**: Feature

**Depends On**: R178

**Description**: Remove AWS dependencies and migrate builds/packages off CodeArtifact — document spa setup and verify provider-neutral runtime behavior.

**Issue**: [I-RS01](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/45)

## Path anchoring

All output paths are relative to this repository root. Sibling references are read-only context permitted by the repo planning guide.

## Context

- `README.md`
- `tasks/_PLANNING.md`
- `tasks/_ORCHESTRATE.md`
- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/sre_standards.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub_spa_utils/README.md`

Source issue is authoritative for this migration. The agreed migration supersedes old CodeArtifact-auth prerequisites only in the paths explicitly migrated by these tasks; do not rewrite unrelated framework rules.

## Goals

- Update README and dependency-auth guidance only in tasks/_PLANNING.md for GitHub npm token onboarding, exact versions, lock sync, AWS-free builds and rollback. No new per-SPA auth provider implementation.
- Validate central approved non-AWS login endpoint through shared spa_utils and runtime config: redirects, URL bootstrap, claims, roles, logout and 401 clearing remain consistent. Historical Cognito log labels/types may remain until the approved contract says otherwise; do not rename provider enums or API fields speculatively.
- Record npm install/ci, unit/build, container/Cypress and GitHub Actions evidence. If the approved provider requires new client types/OpenAPI behavior, stop and plan it from the live authoritative spec; do not invent schemas or change excluded utility repos.

### Craftsmanship Expectations

Keep package, auth and deployment ownership in the existing shared modules. Preserve APIs and runtime contracts unless the recorded migration decision explicitly requires a change; remove obsolete AWS auth knowledge rather than duplicate it. Keep every dependency reference reproducible.

## Testing Expectations

These checks are for future execution; none were run while creating this plan.

- npm install --include=dev, npm ci, npm run test, npm run build; npm run lint if declared. npm run container && npm run api && npm run cypress:run using the documented SPA service/server; verify least-privileged/expired-token paths, runtime IDP URL and base path. Record the central runtime readiness prerequisite separately from successful package-only migration.

## Outputs

- `README.md`
- `tasks/_PLANNING.md`
- `docs/aws-exit.md`

Only these implementation files may change. The orchestrator may also update/rename this task record under the established lifecycle.

## Execution boundary

This is a reviewable plan, not an execution record. Execute only this task's listed outputs when orchestration is separately authorized. Do not touch excluded MongoDB/Runbook utility repos, publish packages/tags, mutate issue/project state, or delete/provision AWS resources as a side effect. Future workflow publication happens only through the reviewed maintainer release path.

Where a task requires an unpublished release, an undecided production contract, unavailable live schema or operator evidence, stop execution at that prerequisite and report it; do not guess values or substitute the unrelated PyPI api-utils package. Pending status describes the plan's review state, not proof that external execution gates are satisfied.

## External prerequisites

SPA utils package publication and consumer registry access: https://github.com/mentor-forge/mentorhub_spa_utils/issues/43. Production identity/hosting readiness: https://github.com/mentor-forge/mentorhub/issues/80. Keep these as execution gates rather than cross-repo Depends On IDs.

## Execution Notes

Reserved for the execution agent. No implementation, tests, service changes or publication have been performed.
