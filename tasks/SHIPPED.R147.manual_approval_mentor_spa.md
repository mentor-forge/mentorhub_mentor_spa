# R147 – Manual approval: mentor SPA IdP redirect

Status: Shipped
Type: Feature
Depends On: R146
Description: Human checkpoint — Mike repeats dev-server and container IdP redirect tests for mentor_spa, then merges the mentor_spa PR.

## Context

- `tasks/SHIPPED.R146.runtime_idp_login_container_wiring.md`
- `../mentorhub_mentee_spa/tasks/SHIPPED.L126.manual_approval_codeartifact_build.md`

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

**Approval**

- **Tester:** Mike Storey
- **Date:** 2026-07-31
- **HOST_NAME:** `m5max.tailb0d293.ts.net`

**Manual test results (mentor SPA, port 8392)**

1. **`npm run dev`** — unauthenticated redirect to `http://127.0.0.1:8080/login.html`; logout redirect same host. **Pass**
2. **Container + `mh up mentor`** — unauthenticated redirect to `http://m5max.tailb0d293.ts.net:8080/login.html` (not `127.0.0.1`); sign-in and logout use same MagicDNS IdP host. **Pass**

**Outcome:** **Approved.** PR https://github.com/mentor-forge/mentorhub_mentor_spa/pull/32 ready to merge. **S46** documentation may proceed.

**Branch:** `F-W08-bump-spa-utils-0.5.6`
