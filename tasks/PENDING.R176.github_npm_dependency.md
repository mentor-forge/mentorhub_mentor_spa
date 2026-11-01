# R176 – Migrate SPA npm source, exact package pin and lockfile

**Status**: Pending

**Type**: Feature

**Depends On**: R175

**Description**: Remove AWS dependencies and migrate builds/packages off CodeArtifact — migrate spa npm source, exact package pin and lockfile.

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
- `package.json`
- `package-lock.json`
- `.gitignore`

Source issue is authoritative for this migration. The agreed migration supersedes old CodeArtifact-auth prerequisites only in the paths explicitly migrated by these tasks; do not rewrite unrelated framework rules.

## Goals

- Create .npmrc.example with @mentor-forge scoped to https://npm.pkg.github.com; keep the user-owned ignored .npmrc untouched and document how the developer opts into the new template; use an environment variable for authentication scoped only to that registry. Public npm remains the default for third-party packages.
- Use the actual published I-US01 version as an exact pin without ^/~; regenerate package-lock.json and replace all CodeArtifact resolved URLs. Do not guess that candidate 1.0.7 exists or use Git/main/latest.
- Keep Vue/TS/CSS/Cypress helper import behavior and existing overrides/Cypress pins; avoid incidental upgrades. Preserve ignored local npm config values and never stage tokens; if a new tracked config conflicts with a user-owned ignored file, use .npmrc.example and document setup instead of overwriting it.

### Craftsmanship Expectations

Keep package, auth and deployment ownership in the existing shared modules. Preserve APIs and runtime contracts unless the recorded migration decision explicitly requires a change; remove obsolete AWS auth knowledge rather than duplicate it. Keep every dependency reference reproducible.

## Testing Expectations

These checks are for future execution; none were run while creating this plan.

- External prerequisite: published I-US01 package available and read access configured. npm install --include=dev then npm ci in a clean temp environment using only GitHub npm credentials; npm run test and npm run build. Confirm unscoped dependencies resolve publicly and missing token fails clearly without AWS fallback.

## Outputs

- `package.json`
- `package-lock.json`
- `.npmrc.example`
- `.gitignore`
- `docs/aws-exit.md`

Only these implementation files may change. The orchestrator may also update/rename this task record under the established lifecycle.

## Execution boundary

This is a reviewable plan, not an execution record. Execute only this task's listed outputs when orchestration is separately authorized. Do not touch excluded MongoDB/Runbook utility repos, publish packages/tags, mutate issue/project state, or delete/provision AWS resources as a side effect. Future workflow publication happens only through the reviewed maintainer release path.

Where a task requires an unpublished release, unavailable live schema or operator evidence, stop execution at that prerequisite and report it; do not guess values or substitute the unrelated PyPI api-utils package. Pending status describes the plan's review state, not proof that external execution gates are satisfied.

## External prerequisites

SPA utils package publication and consumer registry access: https://github.com/mentor-forge/mentorhub_spa_utils/issues/43. Cloud-agnostic local configuration boundary: https://github.com/mentor-forge/mentorhub/issues/80. No production provider choice is required for this package/build work. Keep these as execution gates rather than cross-repo Depends On IDs.

## Cloud-agnostic deployment boundary

The deliverable is a cloud-agnostic **local** deployment plus the agreed GitHub dependency/build migration. Existing identity/hosting implementations are largely placeholders: audit actual executable dependencies before proposing changes. Selecting, implementing or migrating to a production IdP/hosting provider is not a prerequisite for library releases, journey package/build/CI changes or local acceptance.

Keep application-facing backing-service contracts and environment settings provider neutral. Concentrate necessary integration changes in Admin API and DeveloperEdition/docker-compose.yaml where inspection proves coupling; preserve the existing shared JWT/redirect contracts and local persona/mocked-service behavior. Do not create per-journey provider adapters, new identity schemas or a general multi-cloud framework speculatively.

Cloud-specific provisioning, backing-service configuration, identity-provider wiring, roles/secrets and deployment overlays belong to the relevant infrastructure repo: mentorhub_cloudformation owns AWS, including future CodeArtifact provisioning. Future separate repos may implement Google, Microsoft/Azure, IBM or Red Hat platforms against the same contracts; do not create or implement them in this effort. Core compose must not require AWS accounts, credentials or endpoints. A locally optional emulator is not a live AWS dependency; retain it only if useful without making it a required cloud-specific integration.

AWS inventory, secure backup/restore evidence and separately approved decommissioning remain I-S01 responsibilities. Production provider selection or a live production cutover is future infrastructure/integration work, not an acceptance gate for the cloud-agnostic local stack.

## Execution Notes

Reserved for the execution agent. No implementation, tests, service changes or publication have been performed.
