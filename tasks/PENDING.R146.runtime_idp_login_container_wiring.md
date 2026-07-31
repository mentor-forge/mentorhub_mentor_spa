# R146 – Wire runtime `IDP_LOGIN_URI` in mentor SPA container

Status: Pending
Type: Defect
Depends On: none
Description: Apply the same runtime `IDP_LOGIN_URI` container wiring and spa_utils **0.5.7** dependency as mentee_spa (L122/L125) so mentor SPA containers honor compose / cloud env for IdP redirects (issue F-W08).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub/DeveloperEdition/standards/sre_standards.md`
- `../mentorhub_spa_utils/README.md`
- `README.md`
- `Dockerfile`
- `nginx.conf.template`
- `index.html`
- `src/vite-env.d.ts`
- `package.json`
- `../mentorhub_mentee_spa/tasks/PENDING.L122.runtime_idp_login_container_wiring.md` — reference implementation (read for pattern only after L122 ships)
- `../mentorhub_mentee_spa/tasks/PENDING.L125.adopt_spa_utils_0_5_7_codeartifact.md`

**External prerequisites:**

- `mentorhub_spa_utils` **0.5.7** published (F031).
- `mentorhub_mentee_spa` **L126** approved — mentee path validated on CodeArtifact build.

## Goals

- Bump `@mentor-forge/mentorhub_spa_utils` to **^0.5.7** (CodeArtifact — no temporary local file dependency).
- Mirror mentee_spa runtime injection: Dockerfile `IDP_LOGIN_URI` env, startup script generation, `index.html` load order — **minimal diff**, same pattern as L122/L125 outputs.
- `.env.development` unchanged (`VITE_IDP_LOGIN_URI=http://127.0.0.1:8080/login.html`).
- No router / auth logic changes unless required for runtime global typing.
- Commit and push on F-W08 branch; open PR for Mike.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` then `npm install`
- `npm run test`
- `npm run build`
- `npm run dev` — redirect to `127.0.0.1:8080/login.html`
- `npm run container` then from mentorhub: `make update && mh up mentor`:
  - Unauthenticated redirect → `http://<HOST_NAME>:8080/login.html`
  - Logout redirect → same MagicDNS host
- `npm run cypress:run:spec -- cypress/e2e/navigation.cy.ts` — if navigation spec covers auth redirect

## Outputs

- `package.json`
- `package-lock.json`
- `Dockerfile`
- `nginx.conf.template` — only if needed
- `index.html`
- `public/runtime-config.js.template` — or equivalent (match mentee_spa)
- `src/vite-env.d.ts` — if needed
- `README.md` — only if auth/container docs need a one-line runtime IdP note

The agent must not update files outside this list.

## Execution Notes

**Branch:** Continue on the existing F-W08 branch in this repo.

Notify Mike that **R147 manual approval** is ready after tests pass.

