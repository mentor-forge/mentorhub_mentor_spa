# F166 Verify Mentor SPA locally and document rollback

- Status: Shipped
- Type: Feature
- Depends On: F165_github_actions
- Description: Verify Mentor SPA locally and document rollback.

## Context

- https://github.com/mentor-forge/mentorhub_mentor_spa/issues/45
- `README.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub_spa_utils/README.md`
- Use the distribution policy in the originating issue while the shared standards are being updated.

## Goals

- Audit runtime AWS coupling and document the GitHub token setup, AWS-free local workflow and rollback. Use the validated Mentor API container for cross-service checks.

## Testing Expectations

- Run Vite Cypress and packaged Cypress separately. Verify Mentor persona login, Mentor deep links, API routing and runtime configuration against local services.

## Acceptance Criteria

- Record the commands, results, and any follow-up evidence needed in the pull request. Preserve application contracts and existing local behavior.

## Outputs

- `README.md`
- This task's execution notes.

## Execution Notes

- Audited active workflows, Dockerfile, scripts, Vite configuration, application
  source and package files. The local build uses public npm and the scoped
  GitHub Packages registry. The running SPA proxies to the Mentor API and uses
  the configured Developer Edition sign-in URL. No AWS runtime integration was
  found. The lockfile entries for `aws-sign2` and `aws4` are transitive Cypress
  dependencies from public npm and do not require AWS access.
- Documented token setup, distinct Vite and packaged Cypress coverage, promotion
  by image digest and deployment rollback.
- Ran the six Vite browser specs against a fresh seeded local stack. All 36
  tests passed. An earlier Vite probe had one blank-page timeout in the
  mentor-only mentee card test. That test passed in both the packaged run and
  the fresh Vite run with the existing test assertions and app code.
- Ran `npm run cypress:run` against the built F165 image with a seeded local
  MongoDB, the validated Mentor API image and the Developer Edition gateway.
  All 44 tests passed, including all eight deployment checks. The gateway
  served the Mentor shell and runtime config, the prefixed API returned 200
  for authenticated requests and 401 for unauthenticated requests, and
  `nginx -t -c /tmp/nginx.conf` passed.
