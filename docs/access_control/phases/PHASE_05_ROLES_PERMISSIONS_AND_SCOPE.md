<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_05_ROLES_PERMISSIONS_AND_SCOPE.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 05 — roles, overrides, scope, delegation ceiling
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 05 — Roles, Permissions & Scope

**Status:** DONE (2026-10-27). AC-D01/D03/D07 APPROVED A; AC-D02 units reused for subtree.

## 1. Məqsəd

Role/menu/permission assignment, user overrides, scope və delegation ceiling-i
təsdiqlənmiş modellə birləşdirmək (resolver tam inteqrasiya Phase 06-da bitə bilər).

## 2. Başlanğıc şərtləri

- Phase 04 complete ✓
- AC-D01, AC-D03, AC-D07 APPROVED ✓

## 3. Əvvəl oxunmalı

- BACKEND_PLAN §4–5
- `permissions.ts`, `effectiveAccess.ts`, `userAccess.ts`, `dataScope.ts`
- `menuRoleRbac.test.ts`

## 4. Araşdırılacaq

- CRUD → code mapper design ✓ (`access/permissionMapper.ts`)
- Grantable subset for orgAdmin ✓ (`access/delegation.ts` + `resolveGrantableMenuIds`)
- `subtree` vs units (AC-D02) ✓ unit-aware `isOwnerVisibleInUnitSubtree`

## 5. Tapşırıq ardıcıllığı

1. Permission code canon + mapper from profiles ✓
2. Delegation ceiling on access/role APIs ✓
3. Scope behavior update per units decision ✓
4. LMS vs ERP grant channel rules ✓
5. Tests for deny/escalation ✓
6. STOP (wire into single resolver → Phase 06) ✓

## 6. Backend işləri

| Deliverable                             | Location                                                         |
| --------------------------------------- | ---------------------------------------------------------------- |
| CRUD → `{resource}.{action}` mapper     | `apps/api/src/access/permissionMapper.ts`                        |
| Delegation ceiling + SuperAdmin protect | `apps/api/src/access/delegation.ts`                              |
| User overrides in effective path        | `menu/effectiveAccess.ts` + `menu/repository.ts`                 |
| Ceiling on user-access PUT              | `routes/userAccess.ts`                                           |
| SuperAdmin not ordinary-assignable      | `routes/menu.ts`, `org/platformRoles.ts`, `org/tenantService.ts` |
| Unit-aware subtree                      | `auth/dataScope.ts` + CRM list filter                            |
| LMS ≠ ERP admin                         | `tenantService` invite/member + `LMS_GRANT_ROLES`                |
| Audit sensitive grants                  | `userAccess` / `menu` role-menus `writeAuditLog`                 |

**Out of scope (Phase 06):** single Access Resolver merge; dual-read kept.

## 7. UI işləri

None — Admin UX → Phase 07.

## 8. DB/API təsirləri

No new migration. OpenAPI unchanged (**0.19**). Behavior-only + helpers.

## 9. Asılılıqlar / bloklayıcı qərarlar

AC-D01, D03, D07; D02 units (Phase 03) for real subtree.

## 10. Test planı

- `test/phase05RolesScope.test.ts` — overrides, ceiling, SuperAdmin guards
- `src/access/permissionMapper.test.ts`
- `src/auth/dataScope.test.ts` — subtree ≠ org-wide
- Existing `menuRoleRbac`, `erpAuthzRoadmap`, tenant AC-D07 — still PASS
- Gate: **128** `@azes/api-server` tests + typecheck PASS

## 11. Risklər / rollback

Breaking existing role-menu seeds — avoided (additive). Rollback: dual permission write paths retained; Phase 06 can flip unified resolver flag.

## 12. Acceptance criteria

[ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) Phase 05 — checked.

## 13. Hesabat

Worker Agent Report + scoped gates (this chat).

## 14. STOP / GO

**STOP.** GO Phase 06 after user review (Effective Access Resolver).
