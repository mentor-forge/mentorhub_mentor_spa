# F152 – Vite `base` `/mentor/`, router `BASE_URL`, and base-aware runtime config

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F151_adopt_page_frame`  
**Description**: Mount the app at Vite `base: '/mentor/'` with `createWebHistory(import.meta.env.BASE_URL)` so browser URLs are `/mentor/...` and never `/mentor/mentor/...`. Make the existing runtime-config injection base-aware, build a base-aware IdP return URL, and add a prefixed dev proxy. Route `path` strings stay unchanged. Do not change `nginx.conf.template`, the `Dockerfile`, or `src/api/client.ts` — that is F153.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — container runtime config: load the generated `runtime-config.js` from `index.html` **before** the app bundle via a Vite `transformIndexHtml` plugin
- `../mentorhub_spa_utils/README.md` — IdP login URL resolution order (`window.__MENTORHUB_RUNTIME__.IDP_LOGIN_URI` → `VITE_IDP_LOGIN_URI` → Developer Edition fallback); **Cross-SPA URLs** (welcome / ALB origin on `:8080`; direct SPA debug ports such as **8392** are for Cypress, OpenAPI, and debugging only)
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F149.retire_list_pages_and_forward_to_discovery.md` — locked route table with the resulting `/mentor/...` browser URLs
- `vite.config.ts` — today: **no `base`**; an `injectRuntimeConfig()` `transformIndexHtml` plugin (order `pre`) that hardcodes `<script src="/runtime-config.js">`; `server.port` 8392; `server.proxy` `/api` → `http://localhost:8391`
- `src/router/index.ts` — after F149/F150/F151: `createWebHistory()`, no default route, `/profiles/:id`, `/resources/new`, `/resources/:id`, `/paths/new`, `/paths/:id`, `/plans/new`, `/plans/:id`, `/encounters/:id`, `/admin`, and a `/:pathMatch(.*)*` catch-all rendering `DiscoveryRedirectPage.vue`; the unauthenticated guard calls `redirectToIdpLogin(window.location.origin + to.fullPath)` and returns without calling `next`; the role gate forwards to Discovery via `redirectToDiscoveryDashboard()`
- `src/composables/useDiscoveryRedirect.ts` — the shared outbound forward; it builds an absolute welcome / ALB URL and is therefore **unaffected** by the Vite base
- `index.html` — `<title>Mentor Hub Login</title>`, `<link rel="icon" type="image/svg+xml" href="/vite.svg" />`, `<script type="module" src="/src/main.ts">`
- `public/runtime-config.js` — committed dev-server placeholder that seeds `window.__MENTORHUB_RUNTIME__`
- `public/runtime-config.js.template` — `envsubst` source assigning `IDP_LOGIN_URI`
- `.env.development` — already sets `VITE_IDP_LOGIN_URI=http://127.0.0.1:8080/login.html`
- `vitest.config.ts` — already sets `VITE_IDP_LOGIN_URI` for unit tests

**Source issue**: F-RS15 (https://github.com/mentor-forge/mentorhub_mentor_spa/issues/33). Developer Edition welcome nginx (mentorhub L022) already ships `location /mentor/` forwarding the **full** URI to `http://mentor_spa:80` with `X-Forwarded-Prefix: /mentor` and **no prefix stripping**; the cloud ALB forwards the full URI too. Do **not** rely on a welcome `rewrite` hack, and do not change welcome nginx, the cloud ALB, CloudFormation, or the Mentor API. Direct port **8392** stays published.

**Already in place — do not rebuild it:** this repo already has the runtime-config plumbing (the Vite inject plugin, both `public/runtime-config.js*` files, `.env.development`, the nginx `location = /runtime-config.js`, and the Dockerfile `IDP_LOGIN_URI` default plus startup `envsubst`). This task only makes the **injection** base-aware; F153 adds the prefixed nginx locations.

**Prefix, not route paths:** with `base: '/mentor/'`, Vue route `path` strings stay `/profiles/:id`, `/resources/:id`, `/plans/new`, … and the browser shows `/mentor/profiles/{id}`, `/mentor/resources/{id}`, `/mentor/plans/new`. Duplicating the prefix inside route `path` strings would produce `/mentor/mentor/...` — do not do it. The `/:pathMatch(.*)*` catch-all keeps working under the base: `/mentor/` resolves to route path `/` and still forwards to the Discovery dashboard.

Vite `base` changes asset **URLs** only; the build output stays in the `dist` root. Nothing in this task creates a `dist/mentor/` folder.

`IDP_LOGIN_URI` remains `http://<HOST_NAME>:8080/login.html`.

## Goals

- `vite.config.ts` sets `base: '/mentor/'`. There is exactly one base and one build — no second root-only build or profile.
- `src/router/index.ts` uses `createWebHistory(import.meta.env.BASE_URL)` and keeps every route `path` exactly as F149/F150 left it, including the `/:pathMatch(.*)*` catch-all. Confirm that `/mentor/` and an unknown path such as `/mentor/nope` both still hit the catch-all and forward to Discovery under the base rather than 404ing inside the router.
- `injectRuntimeConfig()` no longer hardcodes `/runtime-config.js`. Read the resolved base from the plugin's config hook (or `transformIndexHtml`'s context) and emit `<script src="${base}runtime-config.js">`, still ordered `pre` and still before the module bundle. The seeded `window.__MENTORHUB_RUNTIME__` line stays.
- The unauthenticated guard builds a base-aware IdP return URL so a deep link returns to the prefixed page: origin + `import.meta.env.BASE_URL` + the route path without its leading slash (`/plans/abc` → `http://<host>:8392/mentor/plans/abc`). It must never produce `/mentor/mentor/...` and never drop the prefix. Call `next(false)` after the redirect so the pending navigation is cancelled, per the spa_utils auth contract.
- `index.html` `<title>` becomes `Mentor` instead of `Mentor Hub Login`. The `href="/vite.svg"` favicon link points at a file that does **not** exist in `public/` and already 404s — either delete the dead link or make it base-aware; do not leave a root-absolute `/vite.svg` reference behind. Record which you chose.
- `server.proxy` gains `'/mentor/api'` → `http://localhost:8391` with a rewrite that strips `/mentor` so the API still sees `/api/...`, and keeps the existing `/api` proxy for direct-port debugging.
- `README.md` documents that `npm run dev` serves the app at `http://localhost:8392/mentor/`, lists the in-app URLs from the F149 route table, and warns that `npm run dev` and `npm run service` both bind host port **8392** and cannot run at once.
- Do not change `nginx.conf.template`, `Dockerfile`, `package.json`, `cypress.config.ts`, or `src/api/client.ts` — the API client stays on `/api` until F153.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` — update any unit test that asserts an un-prefixed IdP return URL
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script). Then inspect `dist/index.html`: the module bundle, CSS, and `runtime-config.js` URLs all start with `/mentor/`, and there is no `/mentor/mentor` anywhere in the generated HTML. Confirm the build output is still the `dist` root (no `dist/mentor/` folder) and that `runtime-config.js` plus `runtime-config.js.template` were copied there from `public/`.
- `npm run api` then `npm run dev` — manual check:
  - `http://localhost:8392/mentor/` and `http://localhost:8392/mentor/nope` forward to `http://<host>:8080/discovery/`
  - `http://localhost:8392/mentor/profiles/{id}`, `/mentor/encounters/{id}`, `/mentor/paths/{id}`, `/mentor/resources/{id}`, `/mentor/plans/new`, and `/mentor/plans/{id}` render their pages
  - a deep link opened while logged out returns to the same prefixed URL after the IdP round trip
  - the browser network tab shows `runtime-config.js` requested from `/mentor/runtime-config.js`
  - API calls succeed through the dev proxy

**Packaging verification** is **F153**: container nginx still serves only `/`, so `npm run container` / `npm run service` cannot serve the prefix yet, and `npm run cypress:run` (baseUrl `http://localhost:8392`) is expected to fail until F153 ships nginx and F154 re-points the specs. Do **not** run Cypress as a gate in this task; state that explicitly in Execution Notes.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `vite.config.ts` — `base: '/mentor/'`, base-aware `injectRuntimeConfig`, `/mentor/api` dev proxy
- `src/router/index.ts` — `createWebHistory(import.meta.env.BASE_URL)`, base-aware IdP return URL, `next(false)` after the redirect
- `index.html` — page title and the dead favicon link
- `README.md` — prefixed dev URL, route list, port-8392 conflict note

Do not change `nginx.conf.template`, `Dockerfile`, `package.json`, `cypress.config.ts`, `vitest.config.ts`, `public/runtime-config.js`, `public/runtime-config.js.template`, `.env.development`, `src/App.vue`, or `src/api/client.ts` in this task.

## Execution Notes

### Summary
- Set `base: '/mentor/'` in `vite.config.ts`.
- Made `injectRuntimeConfig()` in `vite.config.ts` base-aware to inject `<script src="${base}runtime-config.js"></script>`.
- Added dev server proxy for `/mentor/api` -> `http://localhost:8391` with rewrite stripping `/mentor`, alongside direct `/api` proxy.
- Updated `src/router/index.ts` to use `createWebHistory(import.meta.env.BASE_URL)`, construct base-aware IdP return URLs (`window.location.origin + import.meta.env.BASE_URL + to.fullPath.replace(/^\//, '')`), and cancel pending navigation with `next(false)`.
- Updated `index.html`: set title to `Mentor` and deleted the dead `/vite.svg` favicon link.
- Updated `README.md` to document the `/mentor/` prefix for `npm run dev`, list in-app route table, and note the port-8392 conflict between dev and service.

### Packaging / Cypress Gate
- As noted in the task description, Cypress e2e is not run as a gate in this task because container nginx serves `/` until F153 and specs are re-pointed in F154.

### Test Results
- `npm run test`: 14 test files passed (85 tests).
- `npm run build`: `vue-tsc && vite build` built cleanly; confirmed `dist/index.html` references `/mentor/` asset and runtime-config URLs without `/mentor/mentor/` duplication.

### Follow-ups
- F153 will update container `nginx.conf.template` and API client base.
