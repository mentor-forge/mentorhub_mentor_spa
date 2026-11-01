# R177 – Use GitHub npm BuildKit secrets in SPA container builds

**Status**: Pending

**Type**: Feature

**Depends On**: R176

**Description**: Remove AWS dependencies and migrate builds/packages off CodeArtifact — use github npm buildkit secrets in spa container builds.

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
- `Dockerfile`
- `scripts/docker-build.sh`
- `.dockerignore`

Source issue is authoritative for this migration. The agreed migration supersedes old CodeArtifact-auth prerequisites only in the paths explicitly migrated by these tasks; do not rewrite unrelated framework rules.

## Goals

- Replace codeartifact_token secret and AWS CLI calls in docker-build.sh/Dockerfile with a GitHub npm token BuildKit secret. Generate host-scoped npm auth only inside the secret-mounted install step; do not COPY user npm tokens, use build args or persist secret config in image layers/cache.
- Require npm ci from the committed lock for release builds. Preserve Node version, Vite cache, nginx API proxy, runtime IDP_LOGIN_URI injection, cache headers, SPA base path and GHCR identity.
- Keep npm run container usable with developer GITHUB_TOKEN and no mh/AWS authentication prerequisite; keep credentials out of logs and final image.

### Craftsmanship Expectations

Keep package, auth and deployment ownership in the existing shared modules. Preserve APIs and runtime contracts unless the recorded migration decision explicitly requires a change; remove obsolete AWS auth knowledge rather than duplicate it. Keep every dependency reference reproducible.

## Testing Expectations

These checks are for future execution; none were run while creating this plan.

- npm run container without AWS CLI/env or CodeArtifact helper; inspect image/history and build inputs for credential leakage, not token values. npm run service then npm run cypress:run; verify runtime config, login/401/logout redirects and correct journey base path.

## Outputs

- `Dockerfile`
- `scripts/docker-build.sh`
- `.dockerignore`
- `docs/aws-exit.md`

Only these implementation files may change. The orchestrator may also update/rename this task record under the established lifecycle.

## Execution boundary

This is a reviewable plan, not an execution record. Execute only this task's listed outputs when orchestration is separately authorized. Do not touch excluded MongoDB/Runbook utility repos, publish packages/tags, mutate issue/project state, or delete/provision AWS resources as a side effect. Future workflow publication happens only through the reviewed maintainer release path.

Where a task requires an unpublished release, an undecided production contract, unavailable live schema or operator evidence, stop execution at that prerequisite and report it; do not guess values or substitute the unrelated PyPI api-utils package. Pending status describes the plan's review state, not proof that external execution gates are satisfied.

## External prerequisites

SPA utils package publication and consumer registry access: https://github.com/mentor-forge/mentorhub_spa_utils/issues/43. Production identity/hosting readiness: https://github.com/mentor-forge/mentorhub/issues/80. Keep these as execution gates rather than cross-repo Depends On IDs.

## Execution Notes

Reserved for the execution agent. No implementation, tests, service changes or publication have been performed.
