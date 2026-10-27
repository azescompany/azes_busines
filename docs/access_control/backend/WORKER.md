<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/backend/WORKER.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Mandatory backend agent contract for access-control work
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Backend WORKER — Access Control

Scoped contract for agents implementing access-control **backend** phases.  
Does **not** replace [`docs/ops/WORKER.md`](../../ops/WORKER.md).

**Role:** Agent Worker (API). Confirm role per `agent-role-gate.mdc`.

---

## 1. Before any code

Read in order:

1. This file
2. Active `docs/access_control/phases/PHASE_XX_*.md`
3. [`../DECISIONS.md`](../DECISIONS.md) — blocked IDs must be `APPROVED`
4. [`../CURRENT_STATE_AUDIT.md`](../CURRENT_STATE_AUDIT.md)
5. [`../ACCESS_CONTROL_ARCHITECTURE.md`](../ACCESS_CONTROL_ARCHITECTURE.md)
6. [`./BACKEND_PLAN.md`](./BACKEND_PLAN.md)
7. `docs/api/CURRENT-STATE.md`
8. Touched routes/schema/tests under `apps/api`
9. OpenAPI + `@azes/api` facades for THIS task only

**STOP** if required decision is still `PROPOSED`.

---

## 2. Allowed changes

- `apps/api/src/**` for auth, tenant, menu, modules, access resolver, audit
- `apps/api/drizzle/migrations/**` when phase requires
- `apps/api/test/**`
- `packages/api/openapi/azes/**` + Orval regen (not hand-edit generated)
- `docs/api/CURRENT-STATE.md` delta
- `docs/access_control/**` status notes if phase asks

---

## 3. Forbidden

- UI/theme/token redesign (`apps/admin` chrome, `ui-web`, design-tokens)
- New package `@azes/role_system` or second auth stack
- Hand-edit `packages/api/generated/**`
- Full monorepo `pnpm build` / unfiltered turbo (Coordinator)
- Git commit / push / deploy (Coordinator)
- Editing `TAGET.MD`, root `AccessControlArixtektura.md` unless user asks
- Approving decisions yourself
- Skipping tests for the phase
- Inventing endpoints/fields not in OpenAPI / phase doc
- Weakening security for convenience

---

## 4. Preserve

- Working login/refresh/logout
- Live `requirePermission` denial after role-menu unassign
- Multi-org membership + active org
- Existing Vitest green unless intentionally replaced with stronger tests

---

## 5. Validation

Minimum for backend phases:

```text
# Confirm package name from workspace, then:
pnpm --filter <api-server-package> test
pnpm --filter <api-server-package> typecheck   # if available
```

If OpenAPI changed: `pnpm api:generate:check` (or repo-equivalent).

---

## 6. Agent Report (required)

```markdown
## Agent Report

- Agent: Worker
- Task: Access-control Phase XX (backend)
- Status: DONE | BLOCKED | NEEDS_COORDINATOR
- Decisions used: AC-D0X=APPROVED …
- Touched: …
- Docs updated: …
- Scoped gates run: …
- Still needs Coordinator: full build | git | deploy | none
- Conflict risk: …
- Git/deploy: COORDINATOR ONLY — not run
```

---

## 7. STOP conditions

- Missing APPROVED decision
- Audit fact contradicts phase assumption → document + ask
- UI needed to finish → hand off; do not invent UI
- Security ambiguity → deny by default; escalate
- Phase complete → update phase doc checklist, report, **STOP** (no silent next phase)
