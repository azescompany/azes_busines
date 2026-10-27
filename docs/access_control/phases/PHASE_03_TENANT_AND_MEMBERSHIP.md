<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_03_TENANT_AND_MEMBERSHIP.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 03 — tenant, membership, active org, unit strategy
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 03 — Tenant & Membership

**Status:** DONE (2026-10-27; AC-D02 APPROVED A, AC-D07 noted).

## 1. Məqsəd

Multi-tenant membership və aktiv context-i möhkəmləndirmək; Organization Unit
strategiyasını APPROVED qərara görə tətbiq və ya açıq defer.

## 2. Başlanğıc şərtləri

- Phase 02 complete (or explicit waiver)
- AC-D02 APPROVED

## 3. Əvvəl oxunmalı

- `backend/WORKER.md`, BACKEND_PLAN §2
- `schema.ts` organizations/memberships
- `routes/tenant.ts`, `routes/org.ts`
- Tests: `tenantMembership.test.ts`, `rbacOrg.test.ts`

## 4. Araşdırılacaq

- `users.org_id` update paths on org switch — **DONE** (documented + tested)
- `org_multi` + `parentOrganizationId` create rules — unchanged (tenant tree)
- Invitation role enums vs ERP `member` — **AC-D07**: LMS invite roles stay LMS

## 5. Tapşırıq ardıcıllığı

1. Document active-pointer semantics in code comments/docs — **DONE**
2. Harden IDOR tests if gaps found — **DONE**
3. AC-D02 A: `organization_units` + `unit_memberships` migration + minimal API — **DONE**
4. Deferral N/A (units implemented)
5. STOP — **DONE**

## 6. Backend işləri

- Migration `0013_organization_units.sql`
- `apps/api/src/org/unit*.ts`, `routes/orgUnits.ts`
- Active-org switch: active membership only; JWT `sub` trusted; `users.org_id` pointer
- OpenAPI **0.18** + Orval regen

## 7. UI işləri

None — unit admin UI → Phase 07.

## 8. DB/API təsirləri

| Table                                  | Role                                       |
| -------------------------------------- | ------------------------------------------ |
| `organizations.parent_organization_id` | Tenant / holding tree (unchanged)          |
| `organization_units`                   | In-tenant branch/dept/team                 |
| `unit_memberships`                     | User↔unit (requires active org membership) |
| `users.org_id`                         | Active org **pointer** only                |

## 9. Asılılıqlar / bloklayıcı qərarlar

AC-D02 A, AC-D07 (invitation roles documented + tested).

## 10. Test planı

`tenantMembership.test.ts` + `orgUnits.test.ts` + `rbacOrg` regression — PASS.

## 11. Risklər / rollback

Confusing child-org with branch. Rollback: drop unused unit tables; keep parent-org.

## 12. Acceptance criteria

[ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) Phase 03 — checked.

## 13. Hesabat

Worker Agent Report + migration `0013` + scoped test/typecheck.

## 14. STOP / GO

**STOP.** GO Phase 04 after user review.
