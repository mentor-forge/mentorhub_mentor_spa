# F153 – SPA nginx `/mentor/` prefix and prefixed API client

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F152_vite_base_and_router_prefix`  
**Description**: Teach container nginx to serve the `/mentor/` prefix (assets, Vue history fallback, prefixed API proxy, prefixed `runtime-config.js`) and switch the API client to the prefixed `/mentor/api` base so calls from the welcome origin reach `mentor_api` through this SPA's nginx. Keep direct-port `/api/` and `/runtime-config.js` for debugging.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — container NGINX template substitution; runtime config generated at startup
- `../mentorhub_spa_utils/README.md` — **Cross-SPA URLs**: welcome / ALB origin on `:8080`; direct SPA debug ports (including **8392**) are for Cypress, OpenAPI, and debugging only
- `README.md` — Configuration section (`API_HOST` / `API_PORT`; container listens on port 80)
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `nginx.conf.template` — today: `location /api/` proxying to `http://${API_HOST}:${API_PORT}/api/`, `location /health`, `location = /runtime-config.js` with `Cache-Control: no-store`, `location /` history fallback, and a root static-asset cache regex; **no prefix awareness**
- `Dockerfile` — `ENV API_HOST=mentorhub_mentor_api`, `ENV API_PORT=8391`, `ENV IDP_LOGIN_URI=http://127.0.0.1:8080/login.html`; `CMD` already `envsubst`s `${API_HOST} ${API_PORT}` into the nginx config **and** `${IDP_LOGIN_URI}` from `runtime-config.js.template` into `/usr/share/nginx/html/runtime-config.js`
- `vite.config.ts` — F152 `base: '/mentor/'` (asset **URLs** are prefixed; the build **output folder is still the dist root**)
- `src/api/client.ts` — `const API_BASE = '/api'`
- `src/api/client.test.ts`, `src/api/Profile.client.test.ts`, `src/api/Encounter.client.test.ts`, `src/api/Plan.client.test.ts`, `src/api/Path.client.test.ts`, `src/api/Resource.client.test.ts` — assert fetch URLs such as `/api/config`, `/api/profile`, `/api/encounter/...`, `/api/plan/...`
- `vitest.config.ts` — no `base`; `import.meta.env.BASE_URL` therefore defaults to `/` under Vitest
- `package.json` — `open` currently opens `http://localhost:8392`

**External prerequisites** (do not change other repos):

- Developer Edition welcome nginx (mentorhub L022) already proxies `:8080/mentor/*` to this container **without stripping the prefix** (`proxy_pass $upstream;` with no URI part), so this nginx must accept `/mentor/...` on port 80.
- Compose passes `API_HOST`, `API_PORT` (**8391**), and `IDP_LOGIN_URI` to the `mentor_spa` service.
- `IDP_LOGIN_URI` stays `http://<HOST_NAME>:8080/login.html`.

**Already in place — expect no Dockerfile change.** The startup `envsubst` that generates `runtime-config.js` and the `IDP_LOGIN_URI` default already ship in this repo. Confirm the generated file still lands at `/usr/share/nginx/html/runtime-config.js` (the Vite `public/` copy puts `runtime-config.js.template` in the dist root regardless of `base`) and touch the `Dockerfile` only if that assumption fails.

Vite `base` does **not** move files into `dist/mentor/`. Nginx must map `/mentor/` onto `/usr/share/nginx/html/`; an internal `rewrite` is the expected mechanism. Keep a **single** image and build — no root-only nginx profile.

### Keep unit tests honest about the base

`import.meta.env.BASE_URL` is `/` under Vitest unless the test config declares a base, so a base-derived API prefix would silently fall back to `/api` in unit tests. Set `base: '/mentor/'` in `vitest.config.ts` so unit tests exercise the same value the browser sees, then update the URL assertions to `/mentor/api/...`. If that turns out to fight the Vitest setup, the fallback is to leave `vitest.config.ts` alone and keep the assertions un-prefixed with a comment explaining why — but say which path you took in **Execution Notes**, and never make the production default depend on the test environment.

## Goals

- `nginx.conf.template`:
  - `location /mentor/api/` proxies to `http://${API_HOST}:${API_PORT}/api/` with the same proxy headers as the existing `/api/` block (port **8391** via `${API_PORT}`).
  - `location /api/` is kept unchanged for **direct-port** debugging.
  - `location /mentor/` maps the prefix onto the dist root (internal `rewrite`) and falls back to `/index.html` for Vue history mode; the HTML response is **not** cached (`no-store`), because a stale shell with the wrong asset URLs breaks behind welcome on `:8080`.
  - A prefixed static-asset location serves and caches `/mentor/*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot}` from the dist root as `public, immutable`; the existing root-path asset cache regex stays for direct-port debugging. Watch ordering — nginx regex locations beat prefix locations, so verify the prefixed asset rule actually wins and does not swallow `/mentor/api/`.
  - `location = /` returns a redirect to `/mentor/` so `http://<host>:8392/` still reaches the app. The app then forwards that visitor on to the Discovery dashboard (F149's catch-all) — nginx's job stops at serving the shell.
  - `location = /mentor/runtime-config.js` **and** the existing `location = /runtime-config.js` both serve the generated file with `Cache-Control: no-store` (never the immutable asset cache). Neither may 404.
  - `location /health` is kept unchanged for container health.
  - No other journey SPA, and no other domain's `/api`, is proxied from this container.
- `src/api/client.ts` derives the API base from the Vite base rather than hardcoding `/api`, yielding `/mentor/api` in the browser (for example `` `${import.meta.env.BASE_URL}api` `` normalized to a single slash). All requests keep sending `Authorization: Bearer <token>` and `Content-Type: application/json`, keep the `offset` / `size` header helpers for `getPlans`, and keep the existing `401` logout-and-redirect handling and `204` / empty-body handling.
- The six `src/api/*.test.ts` suites assert the prefixed URLs (`/mentor/api/...`) instead of `/api/...`, and still cover the `401` path and error mapping. The `src/api/**` coverage thresholds in `vitest.config.ts` must still pass.
- `package.json` `open` script opens `http://localhost:8392/mentor/`.
- `README.md` documents: welcome origin `http://<host>:8080/mentor/` is the supported browser entry; `http://localhost:8392/mentor/` is direct-port debugging only; API calls reach `mentor_api` via this SPA's nginx at `/mentor/api/`.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` and `npm run test:coverage`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)

**Packaging verification:**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers, then verify with `curl -i`:
  - `http://localhost:8392/` redirects (30x) to `/mentor/`
  - `http://localhost:8392/mentor/` returns `200 text/html` with the app shell and `/mentor/` asset URLs (not a 404, not welcome's `index.html`)
  - `http://localhost:8392/mentor/profiles/anything` and `http://localhost:8392/mentor/plans/anything` return `200 text/html` through the history fallback (the SPA decides what renders; nginx must not 404)
  - `http://localhost:8392/mentor/runtime-config.js` returns `200`, `Cache-Control: no-store`, and contains the compose `IDP_LOGIN_URI` value
  - `http://localhost:8392/runtime-config.js` also returns `200` `no-store`
  - `http://localhost:8392/mentor/api/config` and `http://localhost:8392/api/config` both reach `mentor_api` (an unauthenticated `401` JSON body is acceptable; HTML from a missing location is a failure)
  - a prefixed JS asset returns `200` with `Cache-Control: public, immutable`
  - `http://localhost:8392/health` returns `healthy`
- If Developer Edition welcome is up on `:8080`, also confirm `http://localhost:8080/mentor/` returns this SPA rather than welcome's `index.html`. If welcome is not part of the running stack, record it as an external check — do not change other repos.
- `npm run cypress:run` is **not** a gate in this task: the specs still visit un-prefixed paths and are re-pointed in F154. Note that in Execution Notes.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `nginx.conf.template` — `/mentor/`, `/mentor/api/`, prefixed asset cache, `/` redirect, dual `runtime-config.js`
- `src/api/client.ts` — base-derived `/mentor/api`
- `src/api/client.test.ts`, `src/api/Profile.client.test.ts`, `src/api/Encounter.client.test.ts`, `src/api/Plan.client.test.ts`, `src/api/Path.client.test.ts`, `src/api/Resource.client.test.ts` — prefixed URL assertions
- `vitest.config.ts` — `base: '/mentor/'` so unit tests see the production base
- `package.json` — `open` URL `/mentor/`
- `README.md` — prefixed URLs and proxy boundaries
- `Dockerfile` — only if the generated `runtime-config.js` does not land in the served root

Do not change `vite.config.ts`, `src/router/index.ts`, `src/App.vue`, `cypress.config.ts`, or any page or component in this task.

## Execution Notes

_Reserved for the task execution agent: plan, commands run, test results, follow-ups._
