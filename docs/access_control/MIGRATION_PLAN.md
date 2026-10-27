<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/MIGRATION_PLAN.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phased migration from current RBAC to target access control (Phase 08 exit)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Migration Plan — Current → Target Access Control

**Principle:** Preserve working M1–M5.0-lite behavior; migrate by expanding the resolver and
contracts, not by big-bang rewrite.

**Depends on:** [CURRENT_STATE_AUDIT.md](./CURRENT_STATE_AUDIT.md), [DECISIONS.md](./DECISIONS.md).

---

## 1. Migration waves

| Wave | Phase | Goal                                                   | Data risk                |
| ---- | ----- | ------------------------------------------------------ | ------------------------ |
| 0    | 00    | Docs audit (this package)                              | None                     |
| 1    | 01    | Lock AC-D01…D08                                        | None                     |
| 2    | 02    | Token/session docs + safe claim hygiene                | Low (compat claims)      |
| 3    | 03    | Membership clarity; unit tables if AC-D02 A            | Medium if units added    |
| 4    | 04    | Entitlement intersection + subscription lite extension | Medium                   |
| 5    | 05    | Role/override/scope/delegation                         | Medium                   |
| 6    | 06    | Single resolver + `/me` extension                      | Medium (API contract)    |
| 7    | 07    | Admin UI alignment                                     | Low–medium               |
| 8    | 08    | Security acceptance; remove dead paths                 | Low if dual-read removed |

---

## 2. Parallel sources → single source

Current parallel permission sources (CONFLICT):

1. Static `ROLE_PERMISSIONS` (`permissions.ts`)
2. `role_menus` → `menu_permissions`
3. JWT `permissions[]` snapshot
4. `user_menu_permissions` CRUD flags (not in resolver)

**Migration path:**

```text
Phase 05–06:
  dual-read: resolver = UNION(menu codes, mapped user overrides) ∩ entitlement
  keep static map only for non-menu LMS baseline (documented allowlist)
Phase 08 (DONE 2026-10-27):
  JWT permissions[] non-authoritative (already); emission deprecate → 2026-12-31
  ACCESS_RESOLVER_MODE=legacy kept as rollback alias (same core) → remove after 2026-12-31
  residual list: RESIDUAL_LIMITATIONS.md; matrix: SECURITY_MATRIX.md
```

**Rollback:** Env `ACCESS_RESOLVER_MODE=legacy|unified` (default **unified**; legacy = identical
deny/allow through **2026-12-31** — see RESIDUAL_LIMITATIONS).

---

## 3. Data preservation rules

| Data                    | Rule                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| Users / password hashes | Never rebuild; migrate in place                                       |
| Memberships             | Preserve; map roles carefully (AC-D07)                                |
| `role_menus`            | Keep; org-scoped roles add tables later without dropping global seeds |
| `user_menus`            | Keep rows; wire into resolver before changing UI semantics            |
| `organization_modules`  | Keep; start intersecting in resolver                                  |
| `parentOrganizationId`  | Keep for tenant tree; units are additive (AC-D02 A)                   |
| Audit logs              | Append-only; no purge for migration                                   |

**Disable ≠ delete** for modules and subscriptions.

---

## 4. API / OpenAPI compatibility

1. Do not remove `GET /api/v1/me` fields without deprecation window.
2. Additive fields preferred (`accessVersion`, `modules`, `scopes`).
3. Orval regen only after OpenAPI bump in the approved phase.
4. Never hand-edit `packages/api/generated/**`.

---

## 5. Schema migration discipline

- One Drizzle migration per coherent change; reversible where SQLite allows.
- Seed updates must not silently grant new sensitive permissions to all roles.
- Local D1/dev apply before claiming phase DONE.
- Production apply only after Phase 08 checklist + Coordinator gates (when asked).

---

## 6. Frontend migration

1. Continue consuming `@azes/api` facades only.
2. After `/me` extension: update AdminShell invalidate keys; no hardcoded nav resurrect.
3. `checkPermission` remains UX; never the security boundary.
4. i18n en+az+ru for any new admin strings in the same task (page-architecture).

---

## 7. Rollback strategy (per phase)

| Phase type                | Rollback                                        |
| ------------------------- | ----------------------------------------------- |
| Docs-only                 | Revert docs commit                              |
| Additive API fields       | Clients ignore unknown fields                   |
| Resolver dual-read        | Flip to `legacy` mode                           |
| New unit tables           | Stop writing units; scopes fall back to org/own |
| Destructive claim removal | Keep emitting deprecated claims one TTL window  |

Never force-push or `--no-verify` for migration recovery.

---

## 8. Exit criteria for “migration complete”

- [x] Single resolver path documented and tested
- [x] User overrides enforced
- [x] Entitlement enforced for module APIs and nav
- [x] JWT not sole authz proof
- [x] Acceptance tests in [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) green (api-server scoped; Coord full gates on request)
- [x] Dead parallel paths removed or explicitly deprecated with owner + date ([RESIDUAL_LIMITATIONS.md](./RESIDUAL_LIMITATIONS.md))

**Engineering migration complete (Phase 08).** Production apply still requires User GO +
Coordinator release gates.
