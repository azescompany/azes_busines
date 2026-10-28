<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/RESIDUAL_LIMITATIONS.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-28
║ Purpose: Phase 08–09 — residual limitations + dated deprecations
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Residual Limitations & Deprecations (Phase 08–09)

**Date:** 2026-10-28. Phases 02–08 engineering accepted; Phase 09 closes soft-de-authz /
GeneralAdmin capability / demo seed / audit UI gaps. This file remains the honest residual
list for release GO / NO-GO.

---

## 1. Dated deprecations (keep until remove date)

| Item                                   | Status                                      | Keep until         | Owner      | Notes                                                                                                                                |
| -------------------------------------- | ------------------------------------------- | ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ACCESS_RESOLVER_MODE=legacy`          | Deprecated alias                            | **2026-12-31**     | BE + Coord | Same deny/allow core as `unified` (no dual-truth). Emergency rollback only. After window: remove env + mode branch.                  |
| JWT `permissions[]` emission           | Non-authoritative; still emitted for compat | **2026-12-31**     | BE + Coord | `claimHasPermission` / `requirePermission` ignore claim (AC-D05). Clients must use `/me`. After window: stop emitting in access JWT. |
| Static `ROLE_PERMISSIONS` LMS baseline | Keep (LMS channel only)                     | N/A (not removing) | BE         | Phase 09 soft de-authz: LMS roles must not yield platform/ERP codes; Academy LMS perms stay (AC-D07 A).                              |

**Answer — is legacy path still required?**  
Yes, as a **named rollback switch** through 2026-12-31, **not** as a separate dual-read
algorithm. Dual-read (menu ∪ overrides ∩ entitlement) is already the single core in both modes
(Phase 05–06). Removing the env flag early is optional only if Coord accepts no flag-based
rollback.

---

## 2. Residual product / security limitations

| Limitation                           | Impact                                                                       | Mitigation / next initiative                               |
| ------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| GeneralAdmin as distinct system role | Capability profile `generalAdmin` + const (AC-D01 A); **no** membership enum | Phase 09 seed + tests                                      |
| Subscription plans / grace billing   | Lite statuses only (active / blocked / read-only)                            | AC-D08 A deferred depth                                    |
| Audit without D1 (`env.DB` absent)   | `writeAuditLog` no-ops in memory tests / no-DB                               | Production Workers always have DB                          |
| Admin UI audit browser               | Phase 09 — OpenAPI + Admin feature                                           | Was residual; closing in Phase 09                          |
| Unit subtree on every CRM list path  | Helpers + unit API exist; not every list filter may pass unitRepo yet        | Expand as CRM/features adopt `isOwnerVisibleInUnitSubtree` |
| OpenAPI clients caching `/me`        | `accessVersion` present; stale UI until refetch                              | OrgSwitcher invalidate (Phase 07); MANUAL smoke            |
| Elastic platform roles               | Exists; not full ABAC                                                        | Out of scope                                               |

---

## 3. Migration exit criteria (status)

From [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) §8:

| Criterion                                                   | Phase 08                                            |
| ----------------------------------------------------------- | --------------------------------------------------- |
| Single resolver path documented and tested                  | MET (`effectiveAccess` + phase06)                   |
| User overrides enforced                                     | MET (phase05)                                       |
| Entitlement enforced for module APIs and nav                | MET (phase04/06)                                    |
| JWT not sole authz proof                                    | MET (AC-D05 + tests)                                |
| Acceptance tests green                                      | MET — api-server suite; Coord full gates on request |
| Dead parallel paths removed or deprecated with owner + date | MET — see §1 (dated, not hard-deleted)              |

---

## 4. Explicitly out of scope (do not treat as Phase 08 bugs)

- New ERP modules / design-system work
- Full monorepo build / git / deploy (Coordinator)
- Silent Phase 09 product features
