# R161 – Mentee page: three DataCards (Name, Encounters, Admin Breadcrumbs)

**Status**: Shipped  
**Type**: Feature  
**Depends On**: none  
**Description**: Rewrite `ProfileEditPage` to the F-RS12 mentee three-card layout ([mentorhub_mentor_spa#22](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)):
1. Mentee Name title with mailto link, minimal profile data (goals, interests), and editable mentee summary and notes;
2. Encounters title with simple list of `{Date}: {TLDR}` filtered to `status = complete` and ordered by appointment date (most recent first), with date linking to encounter detail;
3. Breadcrumbs title visible only when role contains admin (`hasRole('admin')`), displaying status and Created/Saved audit trails.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md` — Profile Edit / mentee page
- `../mentorhub_spa_utils/README.md` — `DataCard`, `MhCard`, typed editors (`SentenceEditor`, `MarkdownEditor`, `EnumEditor`), `BreadcrumbDisplay`, `useRoles`
- `src/pages/ProfileEditPage.vue` — current Profile + Notes + Encounters layout
- `src/composables/useRoles.ts`
- `src/api/types.ts` — `ProfileDetail`, `Profile.goals` / `interests` / `display_name` / `email`, `Mentee.summary` / `notes`, `Encounter.appointment` / `status` / `tldr`
- `cypress/e2e/profile.cy.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22) — Mentee Page Updates.

## Goals

- Remove obsolete profile identity fields (employer, job title, phone, location, start date) and obsolete mentee fields (`focus`, `homework`, legacy `description`).
- **Card 1 — Mentee Name**
  - `DataCard` with title matching the mentee's display name (`profile.display_name`).
  - Title bar or action mailto link: `data-automation-id="profile-edit-mentee-mailto-link"`, pointing to `mailto:${profile.email}` when `profile.email` is present. If email is absent, omit the mailto control.
  - Body contains **minimal** read-only profile data: Goals (`profile.goals`) and Interests (`profile.interests`) rendered as read-only chips or tag displays (`data-automation-id="profile-edit-goals-display"` and `data-automation-id="profile-edit-interests-display"`).
  - Mentee collection editable fields from `mentee`:
    - **Summary**: `SentenceEditor` with `field="summary"`, label="Summary", `data-automation-id="profile-edit-mentee-summary-input"`, auto-saving on blur via `api.updateMentee`.
    - **Notes**: `MarkdownEditor` with `field="notes"`, label="Notes", `data-automation-id="profile-edit-mentee-notes-input"`, auto-saving on blur via `api.updateMentee`.
  - Placeholder slot/location prepared for the Start Encounter button (to be wired in R164).
  - Automation ID on card root: `data-automation-id="profile-edit-profile-section"`.
- **Card 2 — Encounters**
  - Card titled "Encounters", `data-automation-id="profile-edit-encounters-section"`.
  - **Filter**: Render only encounters where `encounter.status === 'complete'`. Scheduled, active, or archived encounters are excluded from this completed list.
  - **Order**: Sort by appointment date descending (most recent first), using `encounter.appointment?.from || encounter.date || encounter.created?.at_time`.
  - **Row format**: Simple list of lines displaying `{formatted Date}: {tldr}` (fallback to `Encounter` if `tldr` is blank).
  - **Link**: The formatted date (or row) is a link navigating to `/encounter/${encounter._id}` (`data-automation-id="profile-edit-encounter-date-link"`).
  - **Empty state**: Display alert or empty state message when no complete encounters exist (`data-automation-id="profile-edit-encounters-empty"`).
  - **Card actions**: Retain New Encounter or schedule button action placeholder (`profile-edit-new-encounter-button` / `PlanSelectDialog`) so create-encounter Cypress flows remain functional until R163.
- **Card 3 — Breadcrumbs (Admin only)**
  - Rendered only when `hasRole('admin')` is true. Non-admin users (e.g. mentor role only) must not see this card.
  - Card title: "Breadcrumbs", `data-automation-id="profile-edit-breadcrumbs-section"`.
  - Status display: read-only `EnumEditor` with `field="status"`, `enums="status"`, `data-automation-id="profile-edit-status-display"`.
  - Audit trail: `BreadcrumbDisplay` showing Created and Saved breadcrumbs for the mentee/profile (`data-automation-id="profile-edit-created-breadcrumb"` and `data-automation-id="profile-edit-saved-breadcrumb"`).
- Preserve the "Back to Dashboard" button linking to Discovery (`buildJourneyUrl('discovery')`).

### Craftsmanship Expectations

- Reuse `DataCard`, `MhCard`, `SentenceEditor`, `MarkdownEditor`, `EnumEditor`, `BreadcrumbDisplay`, `formatDate`, and `useRoles` from `spa_utils`.
- Do not introduce ad-hoc Vuetify inputs or custom audit components.
- Derive admin visibility strictly from `hasRole('admin')`.
- Keep Cypress tests updated to assert all 3 cards with least-privileged and privileged roles.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Open a mentee: Name card displays mailto link, goals/interests, and editable summary and notes; Encounters list displays only complete encounters ordered by date; Breadcrumbs section is visible to admin and hidden for non-admin mentor.
- **E2E tests**
  - `npm run cypress:run:spec -- cypress/e2e/profile.cy.ts`
  - Add assertion verifying Breadcrumbs section is visible for admin session and absent for mentor session (`cy.login(['mentor'])`).
  - Add assertion verifying mailto link has correct `mailto:` href.
  - Add assertion verifying Encounters list shows completed encounter format `{Date}: {TLDR}` and links to `/encounter/:id`.
- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/ProfileEditPage.vue` — three-card mentee layout (Name, Encounters, Admin Breadcrumbs)
- `cypress/e2e/profile.cy.ts` — updated Cypress tests for the three cards and role gating
- `README.md` — updated Profile Edit section documentation

The agent must not update files outside this list.

## Execution Notes

- Rewrote `ProfileEditPage.vue` into three DataCards:
  - Card 1 (Mentee Name): mailto link with email (`profile-edit-mentee-mailto-link`), read-only goals/interests, editable mentee `summary` (`SentenceEditor`) and `notes` (`MarkdownEditor`).
  - Card 2 (Encounters): displays only completed encounters (`status = complete`) formatted as `{Date}: {TLDR}`, sorted by appointment date descending, with date linking to `/encounter/:id` (`profile-edit-encounter-date-link`). Retained New Encounter plan button until R163.
  - Card 3 (Breadcrumbs): gated by `hasRole('admin')`, displaying mentee status (`EnumEditor`, read-only) and Created/Saved audit breadcrumbs (`BreadcrumbDisplay`).
- Updated `cypress/e2e/profile.cy.ts` covering the 3-card layout, mailto link, summary and notes auto-save, and Breadcrumbs card visibility for admin vs mentor-without-admin roles.
- Updated `README.md` Profile Edit documentation.
- Verified unit tests (108/108 passing) and production build.

