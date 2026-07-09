# R126 – Encounter Detail Encounter, Summary, and Transcript fields

**Status**: Pending  
**Type**: Feature  
**Depends On**: R123  
**Description**: Implement the Encounter content area on the Detail page: always-visible TLDR, and collapsible Summary and Transcript fields with large autosave editors.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `tasks/README.md`
- `../mentorhub_spa_utils/README.md` — `AutoSaveField` (textarea mode)
- `src/pages/EncounterEditPage.vue` — shell from R123
- `src/pages/ProfileEditPage.vue` — large textarea autosave reference
- `../mentorhub_mentor_api/docs/openapi.yaml` — `Encounter` / `EncounterUpdate` (`tldr`, `summary`, `transcript`)

## Goals

### Encounter (always visible, not collapsible)

- Section heading **Encounter** (not collapsible)
- **TLDR** — one-sentence summary via `AutoSaveField` with validation (`validationRules.required`, `validationRules.descriptionPattern` for 255-char pattern)
- `data-automation-id="encounter-detail-tldr-input"`
- PATCH via `api.updateEncounter` on blur; invalidate `['encounter', encounterId]` and `['profile', menteeId]` when `mentee_id` present

### Summary (collapsible)

- Collapsible section with heading **Summary**
- Large markdown-capable editor implemented as `AutoSaveField` **textarea** with `rows="12"` (or similar) for `encounter.summary`
- Hint text indicates Markdown is accepted; rendering/preview is **out of scope** (plain textarea editor for this task)
- `data-automation-id="encounter-detail-summary-input"`

### Transcript (collapsible)

- Collapsible section with heading **Transcript**
- Large `AutoSaveField` textarea (`rows="12"`) for `encounter.transcript`
- `data-automation-id="encounter-detail-transcript-input"`

### Shared behavior

- Use existing mutation pattern from prior EncounterEditPage (`updateField` + Vue Query invalidation)
- Remove any leftover fields from the old edit page (status select, audit read-only fields) if not already removed in R123

## Testing Expectations

Run all commands from this SPA repository root.

- **Unit tests**
  - `npm run test`

- **Dev verification**
  - `npm run api`
  - `npm run dev`
  - Edit TLDR, Summary, Transcript on encounter detail — values persist after reload

- **Packaging verification**
  - `npm run container`

## Outputs

- `src/pages/EncounterEditPage.vue` — Encounter, Summary, Transcript sections

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
