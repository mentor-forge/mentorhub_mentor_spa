# R160 – Sync Encounter and Mentee workflow types and mutations from live OpenAPI

**Status**: Pending  
**Type**: Feature  
**Depends On**: none  
**Description**: Align Mentor SPA types and API client with the live mentor API contract (`http://localhost:8391/docs/openapi.yaml`) for the Encounter Workflow ([mentorhub_mentor_spa#22](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)): schedule recurring encounters (`POST /api/encounter/schedule`), start encounter (`POST /api/encounter/{EncounterId}/start`), and finish encounter (`POST /api/encounter/{EncounterId}/finish`), plus updated `Encounter` (status enum including `scheduled` and `complete`, `appointment`), and `Mentee` (`summary`, dropped legacy fields).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `src/api/types.ts` — `Encounter`, `EncounterInput`, `EncounterUpdate`, `Mentee`, `MenteeUpdate`
- `src/api/client.ts`
- `src/api/Encounter.client.test.ts`
- `src/api/types.test.ts`

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)

### Live OpenAPI contract reference

Fetch the live spec from the running API:

```bash
curl -X GET "http://localhost:8391/docs/openapi.yaml"
```

The live mentor API contract exposes:
- `POST /api/encounter/schedule` with `ScheduleEncounterInput` returning `Encounter[]`
- `POST /api/encounter/{EncounterId}/start` returning `Encounter` (status transitions to `active`)
- `POST /api/encounter/{EncounterId}/finish` returning `Encounter` (status transitions to `complete`)
- `Encounter.status` enum: `['active', 'archived', 'complete', 'scheduled']`
- `Encounter.appointment`: `{ from?: string; to?: string }`
- `Mentee.summary`: sentence (max 255), replacing legacy `description`; `notes` (max 4096); legacy fields `focus`, `homework`, `schedule`, `next_appointment` removed.

## Goals

- `src/api/types.ts` updated to match live OpenAPI:
  - `EncounterAppointment` interface with `from?: string` and `to?: string` (ISO date-time strings).
  - `Encounter` interface status updated to `'active' | 'archived' | 'complete' | 'scheduled'`, optional `appointment?: EncounterAppointment`, optional `mentee_name?: string`, `mentor_name?: string`.
  - `ScheduleEncounterInput` interface matching OpenAPI schema:
    ```typescript
    export interface ScheduleEncounterInput {
      mentor_id: string
      mentee_id: string
      plan_id: string
      start_date: string // YYYY-MM-DD
      day_of_week: number // 0-6 (0=Sunday, 6=Saturday)
      time_of_day: string // HH:MM (24-hour)
      recurrence_days?: number // default 7
      count: number // 1-52
    }
    ```
  - `Mentee` and `MenteeUpdate` interfaces aligned with simplified schema: add `summary?: string` (short sentence summary of mentoring relationship), preserve `notes?: string` and `status?: 'active' | 'archived'`.
- `src/api/client.ts` exposes typed methods for all new operations:
  - `scheduleEncounters(data: ScheduleEncounterInput): Promise<Encounter[]>` -> `POST /encounter/schedule`
  - `startEncounter(encounterId: string): Promise<Encounter>` -> `POST /encounter/${encounterId}/start`
  - `finishEncounter(encounterId: string): Promise<Encounter>` -> `POST /encounter/${encounterId}/finish`
- Unit tests in `src/api/Encounter.client.test.ts`:
  - Assert correct HTTP method (`POST`), URL path, headers, and request body for each method.
  - Assert successful deserialization of responses.
  - Assert error handling (400, 401, 403, 404, 500) throwing `ApiError`.
- No UI pages are changed in this task.

### Craftsmanship Expectations

- Treat the live OpenAPI as the single source of truth for paths, methods, and schemas.
- Reuse the existing `/mentor/api/` `request` helper in `src/api/client.ts`; do not introduce parallel HTTP clients or libraries.
- Do not bump `spa_utils`. Do not import `mentorhub_api_utils`.
- Preserve backward-compatible GET/PATCH `/encounter` methods.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Packaging verification**
  - `npm run container`

Ensure unit tests assert the exact request endpoint URLs and HTTP methods to prove the client does not fall back to generic PATCH operations.

## Outputs

- `src/api/types.ts` — Encounter workflow types (`ScheduleEncounterInput`, `EncounterAppointment`, status enum, `Mentee.summary`)
- `src/api/client.ts` — `scheduleEncounters`, `startEncounter`, `finishEncounter`
- `src/api/Encounter.client.test.ts` — unit coverage for new methods
- `src/api/types.test.ts` — type fixture tests if required

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
