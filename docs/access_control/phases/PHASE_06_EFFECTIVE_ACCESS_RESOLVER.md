<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_06_EFFECTIVE_ACCESS_RESOLVER.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 06 — unified Effective Access Resolver and /me contract
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 06 — Effective Access Resolver

**Status:** DONE (2026-10-27). AC-D04/D06 APPROVED A.

## 1. Məqsəd

Vahid Access Resolver: `requirePermission` + `/me` bootstrap eyni siyasətdən qidalanır;
user overrides + entitlement daxil; migration dual-read.

## 2. Başlanğıc şərtləri

- Phase 05 DONE ✓
- AC-D04, AC-D06 APPROVED ✓

## 3. Əvvəl oxunmalı

- ACCESS_CONTROL_ARCHITECTURE §5
- `access/effectiveAccess.ts`, `requireAuth.ts`, auth getMe path
- MIGRATION_PLAN dual-read section
- OpenAPI me response models

## 4. Araşdırılacaq

- All call sites of `claimHasPermission` / `permissionsForRoles` ✓
- Admin Query keys for me → Phase 07

## 5. Tapşırıq ardıcıllığı

1. Introduce resolver module (`apps/api/src/access/effectiveAccess.ts`) ✓
2. Layers: membership ∩ entitlement ∩ role/override ∩ scope summary ✓
3. `legacy|unified` mode ✓ (`ACCESS_RESOLVER_MODE`, default **unified**)
4. Extend `/me` per AC-D04 (`modules`, `scopeSummary`, `accessVersion`) ✓
5. OpenAPI **0.20** + Orval ✓
6. Tests: menu≠mutation; override; default deny ✓
7. STOP — UI consumes in Phase 07 ✓

## 6. Backend işləri

| Deliverable                   | Location                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| Central resolver              | `apps/api/src/access/effectiveAccess.ts`                         |
| Compat wrap (no second truth) | `apps/api/src/menu/effectiveAccess.ts` → re-exports              |
| `requirePermission`           | `auth/requireAuth.ts` → `effectiveCan`                           |
| `/me`                         | `auth/service.ts` `getMeFromAccessToken`                         |
| Mode flag                     | env `ACCESS_RESOLVER_MODE` + `createApp({ accessResolverMode })` |
| Tests                         | `test/phase06Resolver.test.ts`                                   |

**Out of scope:** Admin UI (07), `/me/access` endpoint, new package.

## 7. UI işləri

None — additive `/me` fields; clients may ignore until Phase 07.

## 8. DB/API təsirləri

- No migration.
- OpenAPI **0.20**: `AuthMeResponse` + `ModuleEntitlementSummary` + `ScopeSummary` (`org|own|subtree`).
- Orval regenerated under `packages/api/generated/azes/**`.

## 9. Asılılıqlar / bloklayıcı qərarlar

AC-D04, D06; Phase 04–05 helpers.

## 10. Test planı

- `phase06Resolver` — additive `/me`, menu≠mutation, legacy mode
- Regression: `menuRoleRbac`, `phase05RolesScope`, `erpAuthzRoadmap`, entitlement*
- Gate: **131** `@azes/api-server` tests + typecheck PASS; `pnpm api:generate` OK

## 11. Risklər / rollback

Wrong UNION widens privileges — not observed.  
**Rollback:** `ACCESS_RESOLVER_MODE=legacy` (same deny/allow core; packaging preserved).

## 12. Acceptance criteria

[ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) Phase 06 — checked.

## 13. Hesabat

Worker Agent Report + contract snippet + mode flag + tests.

## 14. STOP / GO

**STOP.** GO Phase 07 when OpenAPI published and user reviews contract.
