<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/ui/WORKER.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Mandatory UI agent contract for access-control work
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# UI WORKER — Access Control

Scoped contract for Admin (and related) UI agents on access-control phases.  
Does **not** replace [`docs/ops/WORKER.md`](../../ops/WORKER.md).

**Roles:** Agent Dizayner (tokens/chrome only if phase says) or Agent Worker (feature pages).  
Confirm role per `agent-role-gate.mdc`.

---

## 1. Before any code

1. This file
2. Active `phases/PHASE_XX_*.md` (usually 07)
3. [`../DECISIONS.md`](../DECISIONS.md) — especially AC-D04
4. [`./UI_PLAN.md`](./UI_PLAN.md)
5. `docs/styles/CURRENT-STATE.md` (if touching chrome)
6. `docs/api/CURRENT-STATE.md` + real `@azes/api` ops/models
7. Sibling feature e.g. `apps/admin/src/features/users` or `roleMenus`

**STOP** if backend contract for new fields/endpoints is missing.

---

## 2. Allowed

- `apps/admin/src/features/**`, `pages/**`, router `PATHS`, locales en/az/ru
- Compose `@azes/ui-web`
- Query invalidation for me/org/access
- Scoped `pnpm --filter @azes/admin test|typecheck` (verify package name)

---

## 3. Forbidden

- New design system / parallel layout chrome
- Treating hidden buttons as security
- Inventing API paths, DTO fields, or permission codes
- Hand-edit `packages/api/generated/**`
- Putting server ACL into Redux as source of truth
- Full monorepo build / git / deploy (Coordinator)
- Backend schema/auth middleware changes (Backend Worker)
- Approving architecture decisions

---

## 4. Preserve

- Nav from backend `me.nav`
- OrgSwitcher behavior
- Existing i18n keys unless intentionally migrated
- Auth cookie/handoff flows unless Phase 02 explicitly includes UI

---

## 5. Agent Report

```markdown
## Agent Report

- Agent: Dizayner | Worker
- Task: Access-control Phase XX (UI)
- Status: DONE | BLOCKED | NEEDS_COORDINATOR
- Touched: …
- i18n: en/az/ru — paths…
- Docs updated: …
- Scoped gates run: …
- Still needs Coordinator: full build | git | deploy | none
- Conflict risk: …
- Git/deploy: COORDINATOR ONLY — not run
```

---

## 6. STOP

- Backend fields not in packages → STOP + report
- Phase done → checklist + report + STOP (no Phase 08 silently)
- Need token/theme invention → ask Dizayner / user; do not invent hex
