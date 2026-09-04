# R161 – Mentee page: three cards (name, encounters, admin breadcrumbs)

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Rewrite `ProfileEditPage` to the F-RS12 mentee layout: three spa_utils cards — mentee name (mailto, minimal goals/interests, editable mentee notes), Encounters list (`Date: {TLDR}`, Next then recently updated, date links to detail), and admin-only Breadcrumbs (status, created, saved). Keep the existing **New Encounter** plan dialog until R163 replaces it with Schedule Encounters.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md` — Profile Edit / mentee page
- `../mentorhub_spa_utils/README.md` — `DataCard`, `MhCard`, typed editors, `BreadcrumbDisplay`, `EmailEditor` view-mode behavior
- `src/pages/ProfileEditPage.vue` — current Profile + Notes + Encounters sections
- `src/pages/PlanEditPage.vue` — `useRoles` / `hasRole('admin')` pattern for admin-only audit
- `src/composables/useRoles.ts`
- `src/api/types.ts` — `ProfileDetail`, `Profile.goals` / `interests`, `Mentee.notes`, `Encounter.date` / `tldr` / `status` / `saved`
- `cypress/e2e/profile.cy.ts` — asserts Profile, Notes, and Encounters section ids and New Encounter
- `cypress/e2e/encounter.cy.ts` — opens detail from `profile-edit-encounter-item` and New Encounter

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Mentee Page Updates.

`spa_utils` `MhCard` / `DataCard` render `title` as plain text (not an `<a>`). Do not patch spa_utils. Implement mailto as a title-bar control in the card `#actions` slot (and/or a linked name next to the title) so the mentee name remains the card title. Record a spa_utils harvest note in Execution Notes if a linked `title` would be the better long-term API.

## Goals

- Remove the separate full-width Profile identity grid (employer, job title, phone, location, start date, etc.) and the standalone Notes card that edits description/focus/homework. Those fields are out of scope for this page layout.
- **Card 1 — mentee name**
  - `DataCard` title is the mentee display name (`profile.full_name || profile.name`).
  - A `mailto:` control uses `profile.email` when present (`data-automation-id="profile-edit-mentee-mailto-link"`). If email is missing, the mailto control is omitted (name still shows).
  - Body is **minimal**: read-only goals and interests from `ProfileDetail.profile` (chips or read-only array display; not editable).
  - Editable **Notes** from the mentee collection (`mentee.notes`) via `MarkdownEditor` and existing `updateMentee` / `PATCH` notes path. `data-automation-id="profile-edit-notes-input"` stays stable if that element remains the notes field.
  - Automation: `profile-edit-profile-section` remains on this card (or document a single breaking id change in README and Cypress in this task).
- **Card 2 — Encounters**
  - Title **Encounters**. Prefer `MhCard` (non-form list) with the same chrome as other cards.
  - Each row: `{formatted date}: {tldr}` (fallback em dash or “Encounter” when tldr is empty).
  - **Date** is the navigation link to `/encounter/{id}` (`data-automation-id="profile-edit-encounter-date-link"`). Do not make the entire row the only click target if that prevents a later Start button on the Next row (R164).
  - Sort: the **Next** encounter first (soonest upcoming `encounter.date`, or the encounter matching `mentee.next_appointment` when that id/date is available), then remaining encounters by most recently updated (`saved.at_time`, then `date`).
  - Mark the Next row for later Start wiring (`data-automation-id="profile-edit-encounter-next-item"`). Do **not** call start/schedule mutations in this task.
  - Keep **New Encounter** (`profile-edit-new-encounter-button` + `PlanSelectDialog`) working unchanged so Cypress create-encounter flows stay green until R163.
  - Empty state when there are no encounters.
- **Card 3 — Breadcrumbs** (only when `hasRole('admin')` is true)
  - Title **Breadcrumbs**. `data-automation-id="profile-edit-breadcrumbs-section"`.
  - Show mentee/profile **status** (read-only `EnumEditor` with runtime `enums` from `/api/config`) and **Created** / **Saved** via `BreadcrumbDisplay` on the mentee (or profile, if mentee breadcrumbs are missing) documents.
  - Non-admin users must not see this card (assert in Cypress with a mentor-only login, not only admin).
- Drop the duplicate page `h1` if the first card title already shows the mentee name; keep `profile-edit-heading` only if Cypress or accessibility still needs a page heading — if removed, update Cypress in this task.
- Preserve Back to Dashboard (`buildJourneyUrl('discovery')`).

### Craftsmanship Expectations

- Reuse `DataCard` / `MhCard` / typed editors / `BreadcrumbDisplay` / `formatDate` / `useRoles` from spa_utils (via this SPA’s `useRoles` wrapper). Do not add local audit field textboxes like the older Plan edit metadata.
- Do not introduce a local card chrome component.
- Keep journey-specific sorting and mailto in this page; do not add mentee-page layout to spa_utils.
- DRY: derive admin visibility from `hasRole('admin')`, not a copied role string table.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open a mentee: name card shows goals/interests/notes; mailto works when email exists; encounters list shows `Date: TLDR` with date linking to detail; admin sees Breadcrumbs; a mentor-without-admin session does not.
- **E2E**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - `npm run cypress:run:spec -- cypress/e2e/encounter.cy.ts`
- **Packaging verification**
  - `npm run container`

Update Cypress in this task so existing specs match the new cards. Add at least one least-privileged (mentor, not admin) assertion that Breadcrumbs are absent, and an admin assertion that they are present.

## Outputs

- `src/pages/ProfileEditPage.vue` — three-card mentee layout
- `cypress/e2e/profile.cy.ts` — section, mailto, list format, admin vs non-admin breadcrumbs; keep New Encounter until R163
- `cypress/e2e/encounter.cy.ts` — only if encounter-list selectors change
- `README.md` — mentee page card outline (still mention New Encounter until R163)

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
