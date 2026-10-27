<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_04_MODULES_AND_SUBSCRIPTIONS.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 04 — module entitlements and subscription lifecycle
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 04 — Modules & Subscriptions

**Status:** DONE (2026-10-27; AC-D08 APPROVED A).

## 1. Məqsəd

Platform module registry + org entitlement-i resolver və API-lərdə etibarlı etmək;
subscription lite davranışını AC-D08 üzrə genişləndirmək.

## 2. Başlanğıc şərtləri

- Phase 03 complete (or waiver)
- AC-D08 APPROVED

## 3. Əvvəl oxunmalı

- BACKEND_PLAN §3
- `platformModules.ts`, schema platform/org modules
- TAGET M2 / M5.0-lite notes
- `erpAuthzRoadmap.test.ts`

## 4. Araşdırılacaq

- Whether nav/perm already filters by `organization_modules` — **was PARTIAL; now dual-read**
- `subscriptionStatus` / `trialEndsAt` / `subscriptionReadOnly` enforcement

## 5. Tapşırıq ardıcıllığı

1. Define entitlement check helper — **DONE** (`access/entitlementPolicy` + repository)
2. Enforce on module-bound routes (CRM) — **DONE** (`requirePermission` dual-read)
3. Apply AC-D08 policy (block/trial/read-only) — **DONE**
4. Ensure disable ≠ delete — **DONE** (soft status on `organization_modules`)
5. Tests + STOP — **DONE**

## 6. Backend işləri

| Piece                | Location                                       |
| -------------------- | ---------------------------------------------- |
| Policy               | `apps/api/src/access/entitlementPolicy.ts`     |
| Repo                 | `apps/api/src/access/entitlementRepository.ts` |
| Middleware dual-read | `requirePermission` + `/me` nav/perm filter    |
| Soft assign          | `PUT /orgs/:orgId/modules`                     |
| Migration            | `0014_subscription_read_only.sql`              |

**Policy matrix (AC-D08 lite):**

| Condition                    | Mode      | Module API         |
| ---------------------------- | --------- | ------------------ |
| `subscriptionStatus=blocked` | blocked   | deny               |
| `subscriptionReadOnly=true`  | read_only | GET ok; writes 403 |
| `trialEndsAt` past           | read_only | same               |
| else + module active         | full      | allow if entitled  |

PUT modules: `org.manage_all` only (AC-D01 A). orgAdmin activate → 403.

## 7. UI işləri

None — SuperAdmin modules console → Phase 07.

## 8. DB/API təsirləri

- `organizations.subscription_read_only`
- OpenAPI **0.19** (`/modules`, org modules, `subscriptionReadOnly`)

## 9. Asılılıqlar / bloklayıcı qərarlar

AC-D08 A; AC-D01 A (assign remains manage_all).

## 10. Test planı

`erpAuthzRoadmap` + `entitlementPolicy` unit — PASS (120 api-server tests).

## 11. Risklər / rollback

Over-blocking LMS vs ERP — only CRM module-bound codes filtered. Full resolver → Phase 06.

## 12. Acceptance criteria

[ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) Phase 04 — checked.

## 13. Hesabat

Worker Agent Report + policy matrix + scoped gates.

## 14. STOP / GO

**STOP.** GO Phase 05 after user review.
