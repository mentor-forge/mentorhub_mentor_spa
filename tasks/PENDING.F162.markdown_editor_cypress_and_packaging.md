# F162 – MarkdownEditor Cypress activation and packaging

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F161_harvest_datacardgrid_markdown_editor`  
**Description**: Align Cypress with spa_utils **1.0.6** `MarkdownEditor` resting view: specs that typed into a markdown textarea without opening edit mode must activate the display first, then type into `${automationId}-input`. Update selectors that targeted deleted local components. Run the packaged SPA as the acceptance gate for this Mentor 1.0.6 pin/harvest issue.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — E2E covers pages; automation ids are a stable UI API
- `../mentorhub_spa_utils/README.md` — `MarkdownEditor` automation ids: root `automationId`, input `${automationId}-input`, display `${automationId}-display`, value `markdown-field-display`; editable fields enter textarea on click or Enter
- `README.md` — Testing / Automation Support after F160–F161
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `cypress.config.ts` — `baseUrl` stays `http://localhost:8392`
- `cypress/support/e2e.ts` / `cypress/support/commands.ts` — auth helpers
- `cypress/e2e/encounter.cy.ts` — active encounter asserts Summary has a `textarea` immediately under `encounter-detail-summary-input` without activating display; complete-encounter cases already look for `markdown-field-display`
- `cypress/e2e/mentee.cy.ts` — notes flow clicks the root then types into `textarea:visible`; should target `${automationId}-input` after activate
- `cypress/e2e/navigation.cy.ts`, `cypress/e2e/deployment.cy.ts`, `cypress/e2e/path.cy.ts`, `cypress/e2e/resource.cy.ts`, `cypress/e2e/plan.cy.ts` — touch only if a 1.0.6 selector or deleted local component breaks them

**External prerequisite**: F160–F161 shipped — pin **1.0.6**, package `DataCardGrid` / `MarkdownEditor` in use, SPA-local copies deleted, no direct SPA `marked` / `dompurify`.

`npm run dev` and `npm run service` both bind host port **8392**. Cypress packaging runs against `npm run service`.

**Never visit `/mentor/` with `cy.visit`.** Prefer `cy.visitPrefixed` / `cy.loginAsMentor` for in-app routes.

## Goals

- Any Cypress step that edits markdown via package `MarkdownEditor`:
  1. Activates the resting display (click or Enter on the display / editable root as appropriate).
  2. Types into `[data-automation-id="${automationId}-input"]` (not a bare nested `textarea` guess that assumes edit mode is already open).
- `encounter.cy.ts` active-encounter Summary (and any similar) assertions no longer require a visible textarea before activation. Prefer asserting the display exists when resting, then activate before typing if a write path is added.
- `mentee.cy.ts` notes update uses activate-then-`${automationId}-input` (current click + `textarea:visible` should be tightened to the package input id).
- Selectors that targeted deleted local component internals are updated or removed. Do not reintroduce local `DataCardGrid` / `MarkdownEditor` test doubles.
- Existing navigation, deployment, path, resource, plan, mentee, and encounter coverage still passes against the packaged SPA.
- No list-card dashboard reintroduction. No new SPA `marked` / `dompurify` dependencies.
- `README.md` Testing notes mention markdown edit-mode activation (`${automationId}-input`) when documenting markdown E2E, if those docs currently imply a always-visible textarea.

### Craftsmanship Expectations

- Use spa_utils automation ids; do not invent Mentor-only markdown chrome ids to paper over the resting view.
- Assert edit behavior at the layer that owns it (display activate → `${automationId}-input`). A test that only finds a hidden textarea would miss a resting-view regression.
- Do not restore SPA-local editors to make an old selector pass.
- Keep journey-specific detail specs intact; this task is markdown interaction + packaging, not a CRUD rewrite.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test`
- `npm run test:coverage` — **waived** (developer decision). Record the result. Do not change coverage thresholds. **F163** restores the `src/components/**` function gate.
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)

**Packaging verification** (required — last task of this Mentor spa_utils 1.0.6 pin/harvest set):

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); **all** specs must pass against `http://localhost:8392/mentor/...`

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8392**.

Record results in **Execution Notes**. The gate that would look correct while bypassing the intended boundary is: typing into a markdown field without activating display (false pass if a hidden textarea remains), or reintroducing local `MarkdownEditor` / `marked` to satisfy selectors.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `cypress/e2e/encounter.cy.ts` — markdown resting view / activate-then-`${automationId}-input` for Summary (and any other markdown write/assert paths that assume an always-open textarea)
- `cypress/e2e/mentee.cy.ts` — notes activate then `[data-automation-id="profile-edit-mentee-notes-input-input"]` (or the package’s `${automationId}-input` for the notes `automationId`)
- `cypress/e2e/navigation.cy.ts`, `cypress/e2e/deployment.cy.ts`, `cypress/e2e/path.cy.ts`, `cypress/e2e/resource.cy.ts`, `cypress/e2e/plan.cy.ts` — only if a 1.0.6 or deleted-local-component selector breaks
- `README.md` — Testing / Automation Support note for markdown edit-mode activation when applicable

Do not change the spa_utils pin. Do not restore local `DataCardGrid` / `MarkdownEditor`. Do not add list dashboards. Do not add `marked` / `dompurify` as SPA dependencies. Do not pass disallowed `PageFrame` props.

## Execution Notes

_Reserved for the task execution agent._
