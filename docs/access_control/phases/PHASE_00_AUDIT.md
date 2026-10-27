<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_00_AUDIT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 00 — access-control repository audit (docs)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 00 — Audit

**Status:** DONE (2026-10-27) — documentation delivery only.

## 1. Məqsəd

Mövcud authz/tenant/menu/module vəziyyətini faktlarla təsdiqləmək; hədəf arxitektura ilə
boşluqları sənədləşdirmək. Kod dəyişikliyi yox.

## 2. Başlanğıc şərtləri

- Repository oxuna bilər
- Plan təsdiqlənib

## 3. Əvvəl oxunmalı

- `AccessControlArixtektura.md`
- `TAGET.MD`
- `docs/ops/WORKER.md` (global; bu phase docs-only)
- `apps/api/docs/PHASE-2B-AUTH-CONTRACT.md`

## 4. Araşdırılacaq mövcud fayllar

- `apps/api/src/db/schema.ts`
- `apps/api/src/auth/*`, `menu/*`, `routes/*`
- `packages/auth`, `packages/api`
- `apps/admin/src/features/{organizations,roleMenus,platformRoles,userAccess,customers}`
- `apps/api/test/*authz*`, `menuRoleRbac`, `tenant*`, `auth.test.ts`

## 5. Tapşırıq ardıcıllığı

1. Inventory tables/routes/UI
2. Status matrix EXISTS/PARTIAL/MISSING/CONFLICT
3. Write `CURRENT_STATE_AUDIT.md` + planning tree
4. Cross-link; no edits outside `docs/access_control/`

## 6. Backend işləri

Yox (yalnız oxu).

## 7. UI işləri

Yox (yalnız oxu).

## 8. DB/API təsirləri

Yox.

## 9. Asılılıqlar / bloklayıcı qərarlar

Yox — qərarlar Phase 01.

## 10. Test planı

Readonly; optional existing tests not required to re-run for docs DONE.

## 11. Risklər / rollback

Risk: incomplete OpenAPI field audit → Medium coverage noted. Rollback: delete docs folder.

## 12. Acceptance criteria

See [../ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) Phase 00 — checked.

## 13. Hesabat

Planning package created under `docs/access_control/`. Application code untouched.

## 14. STOP / GO

**STOP.** Növbəti: Phase 01 — istifadəçi `DECISIONS.md` qərarlarını təsdiqləsin.
