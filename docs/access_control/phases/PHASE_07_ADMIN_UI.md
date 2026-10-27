<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_07_ADMIN_UI.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 07 — Admin UI for access, nav, and management screens
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 07 — Admin UI

**Status:** DONE (2026-10-27). Phase 06 `/me` contract consumed (AC-D04 A).

## 1. Məqsəd

Admin UI-ni backend effective access müqaviləsinə uyğunlaşdırmaq; çatışmayan idarə
ekranlarını mövcud AZES UI ilə əlavə etmək (yeni design system yox).

## 2. Başlanğıc şərtləri

- Phase 06 DONE ✓
- ui/WORKER.md + UI_PLAN read ✓
- AC-D04 APPROVED ✓

## 3. Əvvəl oxunmalı

- `ui/UI_PLAN.md`, `ui/WORKER.md`
- `docs/api/CURRENT-STATE.md` + `@azes/api` me/ops
- Features: organizations, roleMenus, platformRoles, userAccess, OrgSwitcher

## 4. Araşdırılacaq

- AdminShell nav mapping ✓ (`me.nav` only)
- me query staleTime / invalidate sites ✓
- Module-assignment + units on org detail ✓

## 5. Tapşırıq ardıcıllığı

1. Consume extended `/me` fields ✓
2. Invalidation on org switch + access mutations ✓
3. Align UserAccess UX with permission codes (AC-D03) ✓
4. Module / subscriptionReadOnly / units UI ✓
5. i18n en+az+ru ✓
6. Scoped admin tests/typecheck ✓
7. STOP ✓

## 6. Backend işləri

None.

## 7. UI işləri

| Area        | Change                                                                             |
| ----------- | ---------------------------------------------------------------------------------- |
| Shell       | `me.nav`; error/retry; `accessVersion` sibling invalidate; module/read-only hint   |
| OrgSwitcher | `invalidateAfterOrgSwitch` + snackbar                                              |
| UserAccess  | CRUD → `{resource}.{action}` labels; disable orphan mutate flags; invalidate `/me` |
| Orgs list   | `subscriptionReadOnly` chip                                                        |
| Org detail  | modules soft-assign (`@azes/api/azes/modules`); units list/create/assign           |
| Role menus  | invalidate access helper                                                           |

## 8. DB/API təsirləri

Consume only — OpenAPI units + modules already shipped.

## 9. Asılılıqlar / bloklayıcı qərarlar

AC-D04 contract; Phase 03 units + Phase 04 modules APIs.

## 10. Test planı

`pnpm --filter @azes/admin typecheck` + `test` — PASS (9 tests).

## 11. Risklər / rollback

Hardcoded nav regression — not introduced. Rollback: previous shell without accessVersion effect.

## 12. Acceptance criteria

[ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) Phase 07 — checked.

## 13. Hesabat

Worker Agent Report + locale paths + scoped gates.

## 14. STOP / GO

**STOP.** GO Phase 08 after user UI review.
