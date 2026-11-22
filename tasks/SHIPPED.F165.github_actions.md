# F165 Move Mentor SPA CI off AWS

- Status: Shipped
- Type: Feature
- Depends On: F164_github_npm_and_container
- Description: Move Mentor SPA CI off AWS.

## Context

- https://github.com/mentor-forge/mentorhub_mentor_spa/issues/45
- `README.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub_spa_utils/README.md`
- Use the distribution policy in the originating issue while the shared standards are being updated.

## Goals

- Grant package read access to consuming jobs, use the GitHub workflow token and BuildKit secret, and retain GHCR publishing permissions, triggers and both target platforms.

## Testing Expectations

- Validate CI and verify hosted package access and image builds.

## Acceptance Criteria

- Record the commands, results, and any follow-up evidence needed in the pull request. Preserve application contracts and existing local behavior.

## Outputs

- `.github/workflows/ci.yml`
- `.github/workflows/docker-push.yml`

## Execution Notes

Adapt the Mentee SPA workflow to validate lockfile sources on all pull requests
targeting main. Keep token-backed installation, unit tests, production build,
and container build on trusted same-repository pull requests. Preserve the
main-branch GHCR publish trigger, image name, build cache, and both architectures
while switching the build secret to GitHub Packages. Remove AWS authentication
and obsolete workflow permissions. Confirm the hosted token has package access
through the PR workflow after the branch is opened for review.

Local validation passed the workflow lock assertion, YAML checks for package
permissions, image destination and platform list, and `git diff --check`.
With the existing local package token, `CYPRESS_INSTALL_BINARY=0 npm ci`,
`npm test` (128 tests), `npm run build`, and a native Docker build with the
`github_npm_token` BuildKit secret all passed. The existing Docker shell-form
CMD warning remains. Hosted PR validation and main-branch multi-architecture
publishing require their respective GitHub trigger.
