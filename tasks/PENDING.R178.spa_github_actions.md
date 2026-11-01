# R178 – Update SPA GitHub Actions registry permissions and validation

**Status**: Pending

**Type**: Feature

**Depends On**: R177

**Description**: Remove AWS dependencies and migrate builds/packages off CodeArtifact — update spa github actions registry permissions and validation.

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
- `.github/workflows/docker-push.yml`

Source issue is authoritative for this migration. The agreed migration supersedes old CodeArtifact-auth prerequisites only in the paths explicitly migrated by these tasks; do not rewrite unrelated framework rules.

## Goals

- Replace AWS OIDC/CodeArtifact steps in docker-push.yml with built-in workflow GITHUB_TOKEN access to GitHub npm. Grant consuming repo package Actions read access when required; preserve packages: write needed for GHCR push and contents: read, remove unnecessary AWS id-token/actions permissions.
- Pass npm token to Docker Buildx using the matching BuildKit secret. Preserve main-only image publishing/platforms; never put the token in build-args or step outputs.
- Add separate PR validation using locked npm dependencies, test/build and secret-aware container checks without publication. Untrusted fork PRs must not receive read/write package secrets; document the limited check path when GitHub package auth is unavailable.

### Craftsmanship Expectations

Keep package, auth and deployment ownership in the existing shared modules. Preserve APIs and runtime contracts unless the recorded migration decision explicitly requires a change; remove obsolete AWS auth knowledge rather than duplicate it. Keep every dependency reference reproducible.

## Testing Expectations

These checks are for future execution; none were run while creating this plan.

- Review trigger/permission/secret wiring and npm registry access failure modes. Validate unit/type/build checks and clean container build. Record actual CI evidence only after separate authorized push; no issue mutations or publication from PR validation.

## Outputs

- `.github/workflows/docker-push.yml`
- `.github/workflows/ci.yml`
- `docs/aws-exit.md`

Only these implementation files may change. The orchestrator may also update/rename this task record under the established lifecycle.

## Execution boundary

This is a reviewable plan, not an execution record. Execute only this task's listed outputs when orchestration is separately authorized. Do not touch excluded MongoDB/Runbook utility repos, publish packages/tags, mutate issue/project state, or delete/provision AWS resources as a side effect. Future workflow publication happens only through the reviewed maintainer release path.

Where a task requires an unpublished release, an undecided production contract, unavailable live schema or operator evidence, stop execution at that prerequisite and report it; do not guess values or substitute the unrelated PyPI api-utils package. Pending status describes the plan's review state, not proof that external execution gates are satisfied.

## External prerequisites

SPA utils package publication and consumer registry access: https://github.com/mentor-forge/mentorhub_spa_utils/issues/43. Production identity/hosting readiness: https://github.com/mentor-forge/mentorhub/issues/80. Keep these as execution gates rather than cross-repo Depends On IDs.

## Execution Notes

Reserved for the execution agent. No implementation, tests, service changes or publication have been performed.
