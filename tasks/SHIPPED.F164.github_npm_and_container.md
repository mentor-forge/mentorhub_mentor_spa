# F164 Install SPA utils from GitHub Packages

- Status: Shipped
- Type: Feature
- Depends On: none
- Description: Install SPA utils from GitHub Packages.

## Context

- https://github.com/mentor-forge/mentorhub_mentor_spa/issues/45
- `README.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub_spa_utils/README.md`
- Use the distribution policy in the originating issue while the shared standards are being updated.

## Goals

- Verify the published SPA utils package used by the Mentee SPA migration. Pin the exact version and regenerate the lock. Scope GitHub Packages to mentor-forge and use public npm elsewhere. Pass npm auth via a BuildKit secret and remove obsolete CodeArtifact tooling.

## Testing Expectations

- Verify clean locked install, JS, types, CSS and Cypress helpers, unit tests and production build. Check the image for persisted credentials.

## Acceptance Criteria

- Record the commands, results, and any follow-up evidence needed in the pull request. Preserve application contracts and existing local behavior.

## Outputs

- `.npmrc` scopes GitHub Packages and reads the credential from the shell.
- `package.json` and `package-lock.json` pin SPA utils 1.0.7 and its integrity, with third-party tarballs on public npm.
- `Dockerfile`, `.dockerignore`, and `scripts/docker-build.sh` switch to a required BuildKit secret and exclude npm credential config from the context.
- `README.md` documents token setup and the new package version.

## Execution Notes

Reused the published 1.0.7 artifact and ran npm's lockfile-only install. The only lock changes are the direct utils artifact and migration of three third-party tarball URLs to public npm. Verified the package integrity directly against GitHub Packages.

The clean locked install, all 128 Vitest tests, the production type check and Vite build, and the native Docker build succeeded. The installed artifact includes the declared JavaScript, types, CSS and Cypress exports. Confirmed the final image contains no token in its environment or history and no auth config or secret mount in the inspected runtime paths. The Docker wrapper rejects a missing token before launching the build.

The existing floating Nginx tag is unchanged for the dedicated Nginx task. CI and packaged browser checks are handled by the following tasks.
