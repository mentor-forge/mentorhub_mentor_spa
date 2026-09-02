# F157 – 1.0.1 catalog, `/mentor/config` Cypress and packaging

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F156_host_admin_page_at_config`  
**Description**: Point Cypress at the spa_utils **1.0.1** hamburger catalog, prove Settings opens this SPA’s `/mentor/config`, cover Token claims, admin-gate `/config`, and verify logout `return_to=/discovery/`. Run the packaged SPA as the acceptance gate for F-RS17.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — E2E covers pages; automation ids are a stable UI API
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame (1.0.1)**: catalog table; removed ids `nav-products-link`, `nav-customer-link`, `nav-customer-members-link`; new `nav-events-link`; kept `nav-settings-link` whose href is `hostingConfigHref()` (hosting origin, **no** `:8080` rewrite); Notifications + Settings **admin-only**; empty/missing roles → Home + Events; logout `return_to` = `buildJourneyUrl('discovery')` → `/discovery/`; Token tab ids `admin-token-profile-id-display`, `admin-token-customer-id-display`, `admin-token-mentor-id-display`
- `README.md` — Testing / Automation Support still describe 1.0.0 admin rows (`nav-products-link`) and may still treat Notifications as a mentor row
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `cypress.config.ts` — `baseUrl` stays `http://localhost:8392`
- `cypress/support/e2e.ts` — `registerAuthCommands({ visitPath: '/mentor/paths/new' })`
- `cypress/support/commands.ts` — `visitPrefixed`, `loginAsMentor` (roles `['mentor','admin']`), `loginAndVisit`
- `cypress/e2e/navigation.cy.ts` — still encodes the **1.0.0** catalog: mentor rows include Notifications and omit Events; admin rows include Products and Settings → `/admin/settings` via `assertAlbHref`; logout only asserts `return_to` is present and comments that PageFrame returns to the **root** origin
- `cypress/e2e/deployment.cy.ts` — nginx prefix / API proxy; keep (no catalog rewrite unless a selector breaks)
- `src/router/index.ts` — `/config` (F156), existing create/edit routes, catch-all Discovery forward; role-gate uses `redirectToDiscoveryDashboard()` (cross-origin `:8080/discovery/`)

Cypress runs against **8392**. Collection hamburger `href`s from `buildJourneyUrl` still include **`:8080`**. **Settings is the exception:** `hostingConfigHref()` stays on the current origin (`http://localhost:8392/mentor/config`), not welcome `:8080`, and not `/admin/settings`.

This SPA does **not** host Events. `nav-events-link` is a Discovery ALB href (`http://localhost:8080/discovery/events`). Assert the `href`; do not follow it and do not add `/events` here.

**Never visit `/mentor/` with `cy.visit`.** The catch-all forwards the browser to Discovery on `:8080`. Auth seeding and chrome checks stay on `/mentor/paths/new` (or another stable in-app page). Prefer `cy.visitPrefixed` for in-app routes.

`npm run dev` and `npm run service` both bind host port **8392**. Cypress runs against `npm run service`.

`cy.login()` with no argument seeds an **admin** token. `cy.login(['mentor'])` is mentor-only (no Settings). `cy.loginAsMentor()` is `['mentor','admin']` (union catalog). Pick roles deliberately.

## Goals

- **Catalog (mentor-only login):** ordered rows are Home, Events, Resources, Paths, Plans. `nav-notifications-link` and `nav-settings-link` are **absent**. Home / Events / Resources / Paths / Plans `href`s are welcome `:8080` (`/discovery/`, `/discovery/events`, `/discovery/resources`, `/discovery/paths`, `/discovery/plans`). Profile avatar still targets `/customer/profile/` on `:8080`.
- **Catalog (admin-only login):** Home, Events, Notifications, Settings. Mentor browse rows (`nav-resources-link`, `nav-paths-link`, `nav-plans-link`) are absent. Notifications `href` is `:8080/discovery/notifications`. **Settings** `href` is `http://localhost:8392/mentor/config` (hosting origin). Assert **before** click: includes `:8392`, does **not** include `:8080`, does **not** include `/admin/settings`, does **not** include `/mentor/mentor`. Clicking it stays on this SPA at pathname `/mentor/config`.
- **Removed hamburger rows:** `nav-products-link`, `nav-customer-link`, and `nav-customer-members-link` are **absent** for every role checked (admin, mentor, and at least one least-privileged login such as mentee or customer). Do not restore them locally.
- **Notifications and Settings only for `admin`.** A mentor-only or empty-role / mentee login must **not** show those rows. Events is visible for authenticated users including mentor.
- **Token tab:** after admin Settings navigation, stub `GET /mentor/api/config` (or `**/mentor/api/config`) with a `token` object carrying `profile_id`, `customer_id`, and `mentor_id`. Open the Token tab (`admin-tab-token`) and assert `admin-token-profile-id-display`, `admin-token-customer-id-display`, `admin-token-mentor-id-display` (read-only input values, matching spa_utils `TokenClaimsCard`).
- **Config gate:** a login **without** `admin` visiting `/mentor/config` must **not** remain on that path showing AdminPage. The existing guard calls `redirectToDiscoveryDashboard()` (cross-origin `:8080/discovery/`). Cypress cannot follow that the way Discovery follows same-origin Home — prove the negative at the boundary: pathname is no longer `/mentor/config` and Token/config chrome is not shown. If the browser unloads toward `:8080/discovery/`, that is success. Do **not** add a local Home fallback to make the test easier. An admin visit stays on `/mentor/config`.
- **Logout:** after `nav-logout-link`, IdP stub still loads and `return_to` is welcome origin `http://localhost:8080/discovery/` — not a hardcoded `127.0.0.1` SPA URL, not bare `/` as the only path, not `/mentor/` as the return. Update or delete the F151/F154 comment that treated missing `/discovery/` as a spa_utils limitation.
- Existing prefix / API / drawer-close / unauthenticated-deep-link / runtime-config coverage in `navigation.cy.ts` still passes. Detail specs (`profile`, `encounter`, `path`, `resource`, `plan`) and `deployment.cy.ts` still pass; touch them only if a 1.0.1 catalog id or `/admin` vs `/config` assertion breaks.
- `/admin` may still resolve if F156 kept an alias; prefer asserting `/mentor/config` as the Settings host.
- No `/mentor/mentor` in `cy.url()` or `href`.
- `README.md` Testing / Automation Support lists 1.0.1 ids: Events for authenticated users; Notifications + Settings **admin-only**; Settings → hosting `/mentor/config`; Products / Customer / Customer Members absent.

### Craftsmanship Expectations

- Use spa_utils PageFrame automation ids; do not invent a local drawer.
- Assert Settings at the layer that owns it (`hostingConfigHref` on the current origin) and Events/Home/collections at the layer that owns them (`buildJourneyUrl` on welcome `:8080`). A test that only checks the final page without the href origin would miss a `:8080` rewrite bug on Settings.
- Do not restore Products / Customer / Members rows to make an old assertion pass.
- Keep journey-specific detail specs intact; this task is catalog + config + logout, not a CRUD rewrite.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test`
- `npm run test:coverage`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script; record the missing `npm run lint` from issue acceptance criteria as a follow-up rather than adding tooling)

**Packaging verification** (required — last task of the F-RS17 / 1.0.1 set):

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); **all** specs must pass against `http://localhost:8392/mentor/...`

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8392**.

Record results in **Execution Notes**. The gate that would look correct while bypassing the intended boundary is: Settings `href` rewritten to `:8080` or `/admin/settings`; a non-admin remaining on `/mentor/config`; or logout `return_to` pointing at SPA root `/` instead of `/discovery/`. Include those negative assertions.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `cypress/e2e/navigation.cy.ts` — 1.0.1 catalog (mentor vs admin vs least-privileged), Settings `http://localhost:8392/mentor/config`, Events `:8080/discovery/events`, removed Products/Customer/Members ids, admin-only Notifications/Settings, Token tab claims, `/mentor/config` role gate, logout `return_to=/discovery/`
- `cypress/e2e/deployment.cy.ts` — only if a prefix or `/admin` assertion must mention `/config`
- `cypress/e2e/profile.cy.ts`, `cypress/e2e/encounter.cy.ts`, `cypress/e2e/path.cy.ts`, `cypress/e2e/resource.cy.ts`, `cypress/e2e/plan.cy.ts` — only if a 1.0.1 catalog or `/admin` vs `/config` selector breaks
- `cypress/support/commands.ts` / `cypress/support/e2e.ts` — only if visit helpers need a config-page path
- `cypress/fixtures/**` — only if Token/config intercepts need a fixture
- `README.md` — Testing / Automation Support 1.0.1 hamburger ids and Settings host

Do not restore a local drawer. Do not change the spa_utils pin. Do not add an Events route or list dashboards. Do not pass disallowed `PageFrame` props.

## Execution Notes

_Reserved for the task execution agent._
