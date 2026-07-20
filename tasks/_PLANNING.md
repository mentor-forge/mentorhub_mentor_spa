# SPA Task Automation Framework - Planning

This folder contains coding tasks that an orchestration agent can execute, based on the context and instructions in each task file. This file is a guide for an agent that is helping to plan changes by creating task files to achieve a goal. Create tasks following the [naming conventions](#naming-conventions) and guides below. When planning, only create tasks, do not execute any tasks, and do not change any files outside of the tasks folder. 

- **Path anchoring**
  - All paths in task files are relative to **this SPA repository root** (the directory that contains `package.json`).
  - Sibling repos must all be sibling folders under a common parent.
  - Standards: `../mentorhub/DeveloperEdition/standards/spa_standards.md`
  - In-repo: `README.md`, `src/...`, `cypress/...`, `tasks/...`

- **Context** Before creating any task files you should review the following files for context:
- ../mentorhub/DeveloperEdition/standards/spa_standards.md
- ../mentorhub_spa_utils/README.md
- ./README.md
- ./tasks/_ORCHESTRATE.md
- ./tasks/_PLANNING.md (this file)

## Task File Layout

Each task file must contain the following sections under H1 and H2 headings.

- Under the top H1 task header:
  - Each task file should declare `Status:` **inside the file**, and also encode the status in the **filename prefix** so tasks are visually grouped in the IDE.
  - **Lifecycle statuses (in‑file)**:
    - `Pending`: Not yet started.
    - `Running`: Work is currently being done in the active session.
    - `Blocked`: Waiting on some external dependency or decision.
    - `Shipped`: Implemented, tested, and committed as per the change control process.
    - `Run as needed`: Not part of the main long‑running sequence; to be run manually or opportunistically.
  - **Filename status prefixes (for grouping)**:
    - `AS_NEEDED.` – Tasks that should **not** be part of the main long‑running sequence.
    - `BLOCKED.` – Tasks currently blocked.
    - `PENDING.` – Tasks that are ready to be picked up when their turn comes.
    - `RUNNING.` – (Optional) Tasks currently being executed in this session.
    - `SHIPPED.` – Tasks that are fully implemented and completed.
  - **Type**: `Feature` | `Defect` to describe why we are running this task
  - **Depends On**: `R129_sync_encounter_types` the required predecessor task **in this repo**, or `none` for parallel tasks
  - **Description**: A brief human description of the task.

- Under a **Context** H2 header:
  - A list of context files. This list should always include:
    - `../mentorhub/DeveloperEdition/standards/spa_standards.md`
    - `README.md`
  - Any other input files for the execution of the task.
  - `AS_NEEDED` tasks may include a **Parameters (edit before running)** subsection here for values to customize before promoting to `Pending`.

- Under a **Goals** H2 header:
  - A list of desired outcomes for the task.
  - Each item should describe the outcome (e.g. "Profile edit page shows Full Name with `data-automation-id=\"profile-view-full-name-display\"`").

- Under a **Testing Expectations** H2 header:
  - Can include the creation of new tests for new features.
  - Can include changing existing tests because of modified features.
  - Should always include a description of the tests that should be used to verify completion.
  - In this repo, that typically means some combination of:
    - `npm install` / `npm ci --include=dev` — refresh dependencies after `package.json` / lockfile changes (CodeArtifact auth; run `mh` first if needed)
    - `npm run test` — unit tests (Vitest)
    - `npm run build` — type-check and production build (`vue-tsc` + Vite)
    - `npm run api` — start db + backing API containers
    - `npm run dev` — run Vite dev server locally (for manual or E2E verification)
    - `npm run cypress:run` — end-to-end tests against a running SPA (long running)
  - Should always include the **Packaging verification** step:
    - `npm run container` — build the SPA container image
    - `npm run service` — run db + API + SPA containers
    - `npm run cypress:run` — E2E tests against the containerized SPA (or `npm run cypress:run:spec` for a single spec when appropriate)
  - All test files should be identified in **Outputs** (below).

- Under an **Outputs** H2 header:
  - A list of the files that will be created/updated/moved/renamed/etc.
  - `file_name.vue` / `file_name.ts` will be updated to support `<Goal>`
  - List all files including new files to be created.
  - The agent will not update files not listed.

- Under an **Execution Notes** H2 header:
  - Reserved for the task execution agent to record plan, commands run, test results, and follow-ups.

## Naming Conventions
- **Recommended filename pattern**:
  - `STATUS.RNNN.short_task_name.md` where R is the SPA task series prefix and NNN is a serial task number. When planning, create only PENDING status tasks. 
  - Examples:
    - `PENDING.R130.add_encounter_notes_section.md`
    - `PENDING.R131.sync_plan_client_types.md`
    - `PENDING.R132.plan_edit_checklist_e2e.md`
    - `PENDING.D001.example_defect.md`

## External repository boundaries

Task planning and execution in **this SPA repo** (`mentorhub_mentor_spa`) must not read or depend on other sibling repositories for input context, except:

- **`../mentorhub`** — platform standards and shared documentation (e.g. `DeveloperEdition/standards/spa_standards.md`).
- **`../mentorhub_spa_utils`** — shared Vue components, composables, and auth helpers (e.g. `AutoSaveField`, `useAuth`, `README.md`).
- **`../mentorhub_mentor_api`** — backing mentor API OpenAPI only when a task must sync types or clients (`docs/openapi.yaml`, or live `curl localhost:8391/docs/openapi.yaml` after `npm run api`).

Do **not** reference paths under `mentorhub_mongodb_api`, other domain API or SPA repos, or CloudFormation repos in task **Context** or **Goals**. If work in another repository is a prerequisite, describe it as an **external prerequisite** in prose (e.g. “Mentor API OpenAPI must include field X”) and set **Status** to `Blocked` until a human confirms it — do not link to or read files in that repo.

## Backing API OpenAPI schemas

**Definitive** API contract information for this SPA must come from the **mentor API OpenAPI** — prefer the live spec after starting the API stack, or the sibling OpenAPI file when documenting inputs.

Start the backing API if needed (`npm run api`), then fetch the latest OpenAPI with `curl`:

```bash
curl -X GET "http://localhost:8391/docs/openapi.yaml"
```

Use this response (or `../mentorhub_mentor_api/docs/openapi.yaml`) as the source of truth when updating `src/api/types.ts`, API client methods, or page bindings. Do **not** use deprecated paths under `../mentorhub/Specifications/schemas/` or MongoDB dictionary YAML in other repos.

If the mentor API is unavailable and the task depends on the live contract, set the task **Status** to `Blocked` and stop — do not invent schemas from unrelated repositories.

## Dependency management

This SPA resolves `@mentor-forge/mentorhub_spa_utils` and other packages from **AWS CodeArtifact**. When a task bumps or adds dependencies in `package.json` / `package-lock.json`, the execution agent must install them with:

```bash
npm install --include=dev
```

Run `mh` once per shell session before `npm install` if CodeArtifact credentials are not already available (see `README.md` and `../mentorhub/DeveloperEdition/standards/spa_standards.md`).

Task **Testing Expectations** and **Goals** should call out `npm install` whenever `package.json` or `package-lock.json` changes.

## Sample task file

For a complete example of a well‑formed `Run as needed` task, see:

- `AS_NEEDED.T999.example_add_fields.md`
