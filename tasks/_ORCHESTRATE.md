# SPA Task Automation Framework - Orchestration

This folder contains coding tasks that an orchestration agent can execute, based on the context and instructions in each task file. All of these tasks will only make changes in this SPA repo (`mentorhub_mentor_spa`). Paths are relative to the repository root that contains `package.json`. The agent will first help to plan tasks (see `_PLANNING.md`), and then orchestrate execution of all Pending Tasks to implement a Feature.

## Orchestration model: Feature Workflow

Before starting the workflow, check to make sure you are not on the main branch, and that you can push on the branch you are on. If you fail this test, pause and ask the developer how you should proceed, and then select or create a branch as instructed before starting the first task.

Now orchestrate all Pending Tasks as outlined below. Use an **orchestration agent** that spawns a **fresh agent per task**:

1. **Orchestrator** discovers all tasks, respects dependencies, and determines execution order.
   - **Task Selection**: Select only `PENDING.*` tasks.
   - **Execution order**: Review all PENDING tasks and order dependencies first.
   - Schedule **concurrent** agents if no dependencies exist.
2. **For each task**, the orchestrator launches a new agent with:
   - The task file path
   - Any outputs from prior tasks (e.g. "R130 complete; encounter notes section added in PlanView.vue")
3. **Sub-agent** executes only that task: read context, implement, test, update task notes.
4. **Orchestrator Confirmation**: The orchestrator should re-run the task's **Testing Expectations** as outlined in the task (typically `npm run test` / `npm run build`, and packaging/E2E when specified: `npm run container`, `npm run service`, `npm run cypress:run`).
5. **Commit Changes**: The orchestrator is responsible for a commit, with a meaningful message, and a push.
6. **Mark Shipped** by updating the task status, and renaming the task file like `SHIPPED.R130.add_encounter_notes_section.md`.
7. **Orchestrator** after the commit, moves to the next task.

**Task Failure Case**: In the event a task fails, execution should halt and the developer should receive a summary of the current state and error condition that caused the failure.

**All Tasks Complete**: Once all tasks have successfully completed, the orchestration agent should create a Pull Request in **this SPA repository** with a meaningful summary of all the commits made during the workflow. Notify the developer that the workflow was completed and provide a link to the PR.

## Implementation Details
- **Recommended filename pattern**:
  - `STATUS.RNNN.short_task_name.md` where R is the SPA task series prefix and NNN is a serial task number (see `_PLANNING.md`). Use `D` for defects (e.g. `PENDING.D001.example_defect.md`). Use `F` for features (e.g. `PENDING.F001.example_feature.md`).
  - Examples:
    - `PENDING.F130.add_encounter_notes_section.md`
    - `PENDING.F131.sync_plan_client_types.md`
    - `PENDING.F132.plan_edit_checklist_e2e.md`
    - `SHIPPED.F130.add_encounter_notes_section.md`

- **External prerequisites**
  - Task execution in this SPA may use only these sibling repos for input context: `../mentorhub` (e.g. `DeveloperEdition/standards/spa_standards.md`), `../mentorhub_spa_utils`, and `../mentorhub_mentor_api` OpenAPI when a task must sync types or clients.
  - Work in other repositories (MongoDB dictionary, other domain APIs/SPAs, CloudFormation) is **not** orchestrated from this folder and must not be linked from task **Context** or **Goals**.
  - Record external preconditions under **Context** as prose, or set **Status** to `Blocked` until a human confirms they are satisfied.
  - **Depends On** references only tasks in **this repo's** `tasks/` folder.

## Task execution workflow

The steps below apply to the agent that executes a task.

1. **Review the current tasks**
   - Each task is a markdown file in this repo's `tasks/` folder (e.g. `PENDING.F130.add_encounter_notes_section.md`).
   - For each task, read the entire file before starting work.
   - Task shape follows `_PLANNING.md`: Status, Type, Depends On, Description, Context, Goals, Testing Expectations, Outputs, Execution Notes.
   - Context should always include `../mentorhub/DeveloperEdition/standards/spa_standards.md` and `README.md`.

2. **Change control for each task**
   For every task, the agent should:
   - **Review Context and Goals**: Read all referenced input/context files.
   - **Plan changes**: Summarize the planned approach in the **Execution Notes** section of the task file.
   - **Implement changes**: Update Vue/TS sources, tests, docs, etc., as required — only files listed under **Outputs**.
   - **OpenAPI / types** (when the task depends on the mentor API contract): start the API if needed (`npm run api`), then use the live OpenAPI (`curl -X GET "http://localhost:8391/docs/openapi.yaml"`) or `../mentorhub_mentor_api/docs/openapi.yaml`. If the contract is unavailable, set **Status** to `Blocked` and stop.
   - **Dependencies**: If `package.json` or `package-lock.json` changes, run `mh` if needed for CodeArtifact, then `npm install --include=dev`.
   - **Testing**: Follow the instructions in the task file's **Testing Expectations** section (SPA unit/build and packaging/E2E as specified — not API drop/config testing).

3. **Completion and documentation**
   - After successful testing, update **Execution Notes** with summary and test results.
   - Rename the task file to `SHIPPED.RNNN....md` and update in-file **Status** to `Shipped` after the orchestrator commits.
