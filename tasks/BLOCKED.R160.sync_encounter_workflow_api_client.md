# R160 – Sync Encounter workflow mutations from live OpenAPI

**Status**: Blocked  
**Type**: Feature  
**Depends On**: none  
**Description**: Align Mentor SPA Encounter types and API client with the live mentor API contract for the Encounter Workflow ([mentorhub_mentor_spa#22](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)): schedule (create) encounters, start encounter, end/finish encounter, and summarize. Do not invent paths or payloads.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `README.md`
- `../mentorhub_spa_utils/README.md`
- `src/api/types.ts` — `Encounter`, `EncounterInput`, `EncounterUpdate` currently only `active` | `archived`; client has `getEncounter` / `createEncounter` / `updateEncounter` only
- `src/api/client.ts`
- `src/api/Encounter.client.test.ts`
- `src/api/types.test.ts` — only if Encounter fixtures need the new shapes

**Source issue**: [F-RS12: Encounter Workflow](https://github.com/mentor-forge/mentorhub_mentor_spa/issues/22)

### External prerequisite

Mentor API [F-RA14: EncounterMutations](https://github.com/mentor-forge/mentorhub_mentor_api/issues/28) must ship the mutations this SPA will call:

- Schedule Encounters (date, time, recurrence, count)
- Start Encounter
- Finish / End Encounter
- Summarize Encounter

Start the backing API (`npm run api`) if needed and fetch the live spec:

```bash
curl -X GET "http://localhost:8391/docs/openapi.yaml"
```

If those operations are still absent, leave this task **Blocked**, keep the `BLOCKED.` filename prefix, record what the live spec actually contains in **Execution Notes**, and stop. Do not guess URLs, status enums, or request bodies. Do not read other domain API repositories for schemas.

When a human confirms the mentor API contract is live, rename this file to `PENDING.R160.sync_encounter_workflow_api_client.md` and set **Status** to `Pending` before orchestration.

## Goals

- `src/api/types.ts` Encounter-related types match the live OpenAPI (status enumerators, schedule/create request and response, start/end/summarize request and response). Optionality and field names match the spec exactly.
- `src/api/client.ts` exposes typed methods for every new Encounter operation in the spec (names follow existing `createEncounter` / `updateEncounter` style). Existing GET/PATCH/POST `/encounter` behavior is unchanged unless the live spec changed it.
- Unit tests cover success path, 4xx `ApiError`, and request method/URL/body for each new client method. Negative auth (401) remains covered.
- No UI pages are changed in this task.

### Craftsmanship Expectations

- Treat the live OpenAPI as the only API contract. Do not copy types from comments in this task if they disagree with the spec.
- Keep the existing `/mentor/api/` request helper; do not add a parallel HTTP client.
- Do not bump `spa_utils`. Do not add `mentorhub_api_utils`.
- Prefer the smallest type/client change; do not refactor unrelated Profile or Plan clients.

## Testing Expectations

Run all commands from **this SPA repository root**.

- **Contract**
  - `npm run api` (if the stack is not already up)
  - `curl -X GET "http://localhost:8391/docs/openapi.yaml"` — confirm schedule/start/end/summarize operations exist; if not, remain Blocked
- **Unit tests**
  - `npm run test`
- **Build**
  - `npm run build`
- **Packaging verification**
  - `npm run container`

Prove the client wrong where possible: a method must not silently PATCH `/encounter/{id}` when the spec defines a dedicated mutation path; tests must assert the actual URL and HTTP method.

## Outputs

- `src/api/types.ts` — Encounter workflow types from live OpenAPI
- `src/api/client.ts` — new Encounter mutation methods
- `src/api/Encounter.client.test.ts` — unit coverage for new methods
- `src/api/types.test.ts` — only if Encounter type fixtures must change

The agent must not update files outside this list.

## Execution Notes

_Reserved for the task execution agent._
