# R175 – Audit SPA dependency, build and runtime coupling

**Status**: Pending

**Type**: Feature

**Depends On**: none

**Description**: Remove AWS dependencies and migrate builds/packages off CodeArtifact — audit spa dependency, build and runtime coupling.

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

- Inventory package pin/lock URLs, tracked versus ignored npm config, Dockerfile/codeartifact_token, build wrapper and GitHub Actions. Document package/runtime paths, external prerequisites and rollback.
- Audit initAuth/useAuth/runtime-config/nginx wiring for AWS endpoints or Cognito assumptions. Most current runtime auth is configurable through shared spa_utils; do not replace that ownership with per-SPA auth code.
- Record external prerequisite: I-US01 exact published GitHub npm version, public visibility, read:packages/Actions package access; central identity/hosting decision is required for production runtime cutover. No OpenAPI or data schema changes are intended.

### Craftsmanship Expectations

Keep package, auth and deployment ownership in the existing shared modules. Preserve APIs and runtime contracts unless the recorded migration decision explicitly requires a change; remove obsolete AWS auth knowledge rather than duplicate it. Keep every dependency reference reproducible.

## Testing Expectations

These checks are for future execution; none were run while creating this plan.

- Review tracked sources, exports used by this SPA and existing issue tasks. Do not read local ignored credential values or assume that Cognito display labels prove a service dependency.

## Outputs

- `docs/aws-exit.md`

Only these implementation files may change. The orchestrator may also update/rename this task record under the established lifecycle.

## Execution boundary

This is a reviewable plan, not an execution record. Execute only this task's listed outputs when orchestration is separately authorized. Do not touch excluded MongoDB/Runbook utility repos, publish packages/tags, mutate issue/project state, or delete/provision AWS resources as a side effect. Future workflow publication happens only through the reviewed maintainer release path.

Where a task requires an unpublished release, an undecided production contract, unavailable live schema or operator evidence, stop execution at that prerequisite and report it; do not guess values or substitute the unrelated PyPI api-utils package. Pending status describes the plan's review state, not proof that external execution gates are satisfied.

## External prerequisites

SPA utils package publication and consumer registry access: https://github.com/mentor-forge/mentorhub_spa_utils/issues/43. Production identity/hosting readiness: https://github.com/mentor-forge/mentorhub/issues/80. Keep these as execution gates rather than cross-repo Depends On IDs.

## Execution Notes

Reserved for the execution agent. No implementation, tests, service changes or publication have been performed.
