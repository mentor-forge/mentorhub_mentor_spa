# F167 Pin and verify patched stable Nginx

- Status: Shipped
- Type: Defect
- Depends On: F166_migration_acceptance
- Description: Pin and verify patched stable Nginx.

## Context

- https://github.com/mentor-forge/mentorhub_mentor_spa/issues/46
- `README.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub_spa_utils/README.md`
- Use the distribution policy in the originating issue while the shared standards are being updated.

## Goals

- Check official Nginx releases and advisories, document applicable findings, pin the current patched stable Alpine tag, and ensure both CI builds refresh the base.

## Testing Expectations

- Verify nginx version and configuration on amd64 and arm64, run packaged history fallback, prefixed proxy and runtime config smoke tests, scan the images and verify the published manifest digest after merge.

## Acceptance Criteria

- Record the commands, results, and any follow-up evidence needed in the pull request. Preserve application contracts and existing local behavior.

## Outputs

- `Dockerfile` pins the official stable Alpine runtime image by its multi-platform index digest.
- `.github/workflows/ci.yml` and `.github/workflows/docker-push.yml` explicitly pull base images.
- `README.md` documents base validation and immutable promotion.
- This task records local evidence and the post-merge verification gate.

## Execution Notes

Verified on November 22, 2026. The [official stable release](https://nginx.org/en/download.html)
is Nginx 1.30.7. The [upstream security advisories](https://nginx.org/en/security_advisories.html)
identify stable 1.30.7 as patched for the resolver advisory (CVE-2026-123634). The SPA config
declares Docker DNS and serves plain HTTP on port 80. HTTP/2, HTTP/3, TLS,
mail, and stream modules may be present in the binary, but the corresponding
listeners are absent from this configuration. The issue did not identify a
specific CVE or historical application image digest.

`docker buildx imagetools inspect nginx:1.30.7-alpine` confirmed the official
Docker Hub OCI index
`sha256:caf4e1e032a20f9c3c5e28fc7f25ffd768ad8677b4975c54193075997b3a97e3`
and both AMD64 and ARM64 manifests. The local container
wrapper already passes `--pull`. Both GitHub build workflows now request
fresh bases while preserving their existing GitHub Packages authentication.

### Pre-merge verification

- Built ARM64 with `npm run container` and AMD64 with an isolated Buildx
  builder using `--pull --platform linux/amd64 --load` and the existing
  scoped BuildKit secret. Both final images report Nginx 1.30.7.
- Ran the full packaged Cypress suite against ARM64. All 44 tests passed.
  Ran the eight packaged deployment tests against AMD64 under a locally
  mounted QEMU executable. All passed. The AMD64 check ran the image's
  `envsubst` and Nginx binaries directly under QEMU to reproduce startup
  inputs on this ARM64 host.
- Both generated Nginx configurations passed `nginx -t -c /tmp/nginx.conf`.
  The shared-origin gateway served the Mentor shell and runtime configuration,
  and the prefixed API returned 200 with the seeded credential and 401 without it.
- Trivy 0.76.2 scanned both saved Alpine 3.24.4 application images with
  vulnerability database schema 2 updated November 21, 2026 at 18:38 UTC.
  Neither scan reported an Nginx package finding. Each reported 12 Alpine
  library findings (five each for libcrypto3 and libssl3, plus one each for
  libxml2 and zlib).
- Confirmed the existing two-platform publish target and fresh-base settings
  in parsed workflow YAML. `git diff --check` passed.

| Architecture | Local application image ID |
| --- | --- |
| ARM64 | `sha256:8387693750981940ccc756408b4031697b1ae157bca476bed8fff87bca7447c4` |
| AMD64 | `sha256:9c3cf72ffba4751aa0ae1544dcdb2a7bb4e5407230d413b9ac75dc4dbf565a4e` |

### Post-merge publication

After GitHub Actions publishes from main, use `docker buildx imagetools inspect`
to record the GHCR index and both platform manifest digests. Pull each by
digest, confirm the binary version and scan results, then verify package
deployment and use the same immutable application digest for promotion.
Close the Nginx issue after this evidence is available.
