# R147 – Manual approval: mentor SPA IdP redirect

Status: Blocked
Type: Feature
Depends On: R146
Description: Human checkpoint — Mike repeats dev-server and container IdP redirect tests for mentor_spa, then merges the mentor_spa PR.

## Context

- `tasks/PENDING.R146.runtime_idp_login_container_wiring.md`
- `../mentorhub_mentee_spa/tasks/BLOCKED.L126.manual_approval_codeartifact_build.md`

## Goals

- Mike manually confirms mentor SPA (port **8392**):
  - **`npm run dev`** — redirect to `127.0.0.1:8080/login.html`.
  - **Container + `mh up`** — redirect to `http://<HOST_NAME>:8080/login.html`.
  - Logout redirect correct in both modes.
- Mike merges the mentor_spa PR.
- Record approval in **Execution Notes**; unblock mentorhub **S46** documentation task.

## Testing Expectations

- Manual verification only.

## Outputs

- This task file — **Execution Notes** only.

## Execution Notes

Reserved for Mike's sign-off.

