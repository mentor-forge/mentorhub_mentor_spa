# R146 – Wire runtime `IDP_LOGIN_URI` in mentor SPA container

Status: Shipped
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
- `../mentorhub_mentee_spa/tasks/SHIPPED.L122.runtime_idp_login_container_wiring.md` — reference implementation
- `../mentorhub_mentee_spa/tasks/SHIPPED.L125.adopt_spa_utils_0_5_7_codeartifact.md`

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

The agent must not update files outside this list unless a minimal Cypress fix is required.

## Execution Notes

**Plan**
- Bump spa_utils to CodeArtifact `^0.5.7`; add runtime config injection matching mentee_spa L122/L125 (`vite.config.ts` plugin, `public/runtime-config.js*`, Dockerfile/nginx envsubst).

**Summary of changes**
- `package.json` / `package-lock.json`: `@mentor-forge/mentorhub_spa_utils` → `^0.5.7`.
- `vite.config.ts`: `injectRuntimeConfig` plugin loads `/runtime-config.js` before app module.
- `public/runtime-config.js.template` + `public/runtime-config.js`: container envsubst + dev stub.
- `nginx.conf.template`: `Cache-Control: no-store` for `/runtime-config.js`.
- `Dockerfile`: `IDP_LOGIN_URI` env + startup envsubst for `runtime-config.js`.
- `src/vite-env.d.ts`: typed `window.__MENTORHUB_RUNTIME__.IDP_LOGIN_URI`.

**Verification results**
- `mh && npm install` → OK (`0.5.7` from CodeArtifact)
- `npm run test` → **93/93 passed**
- `npx vite build` → OK (`vue-tsc` via full `npm run build` also OK in Docker)
- `npm run container` → image built; `envsubst` yields MagicDNS `IDP_LOGIN_URI`
- Cypress navigation spec — not re-run (auth redirect unchanged; R145 covered navigation logout to `127.0.0.1:8080`)

**Branch:** `F-W08-bump-spa-utils-0.5.6`

**Follow-up:** R147 — Mike manual re-test over MagicDNS + merge PR.
