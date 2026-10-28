<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/README.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-28
║ Purpose: Access-control planning docs index and reading order
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AZES Access Control — Planning Docs

Bu qovluq AZES monorepo üçün **rol, icazə, tenant və naviqasiya** arxitekturasının
planlaşdırma paketidir. Məqsəd mövcud M1–M5.0-lite implementasiyasını sıfırdan yazmaq deyil;
onu vahid, təhlükəsiz və mərhələli sistemə çatdırmaqdır.

**Phase 00–08:** planning + implementation complete (engineering).  
**Phase 09:** delta implementation (LMS soft de-authz, GeneralAdmin capability, demo seed,
audit UI) — see [phases/PHASE_09_DELTA.md](./phases/PHASE_09_DELTA.md).

## Oxu ardıcıllığı

1. [CURRENT_STATE_AUDIT.md](./CURRENT_STATE_AUDIT.md) — faktlar (EXISTS / PARTIAL / MISSING / CONFLICT)
2. [ACCESS_CONTROL_ARCHITECTURE.md](./ACCESS_CONTROL_ARCHITECTURE.md) — hədəf model
3. [DECISIONS.md](./DECISIONS.md) — kilidlənmiş qərarlar (Phase 01: AC-D01…D08 **APPROVED A**)
4. [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) — mərhələli keçid
5. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) — ölçülə bilən meyarlar
6. [SECURITY_MATRIX.md](./SECURITY_MATRIX.md) + [RESIDUAL_LIMITATIONS.md](./RESIDUAL_LIMITATIONS.md) — Phase 08
7. [backend/BACKEND_PLAN.md](./backend/BACKEND_PLAN.md) + [backend/WORKER.md](./backend/WORKER.md)
8. [ui/UI_PLAN.md](./ui/UI_PLAN.md) + [ui/WORKER.md](./ui/WORKER.md)
9. [phases/](./phases/) — Phase 00–09 icra kartları
10. [DEMO_SEED.md](./DEMO_SEED.md) — local multi-org demo seed / login
11. [DEMO_CLIENT_CONTRACT.md](./DEMO_CLIENT_CONTRACT.md) — public ephemeral demo (≠ D1 seed)

## Qısa vəziyyət (2026-10-27)

| Sahə                                   | Status                                                  |
| -------------------------------------- | ------------------------------------------------------- |
| Auth JWT + refresh                     | EXISTS                                                  |
| Live `requirePermission` / menu UNION  | EXISTS                                                  |
| Multi-org membership + active org      | EXISTS                                                  |
| Module registry + org modules          | EXISTS                                                  |
| User menu overrides → effective access | EXISTS (Phase 05–06)                                    |
| Organization Unit (branch/dept)        | EXISTS (API + Admin Phase 07)                           |
| GeneralAdmin (ayrı sistem rolu)        | Capability set (AC-D01 A) — Phase 09                    |
| LMS soft de-authz (no ERP via LMS)     | Phase 09 (enum kept; AC-D07 A)                          |
| Multi-org demo seed                    | Phase 09                                                |
| Audit Admin UI + OpenAPI               | Phase 09                                                |
| Subscription plans / grace / read-only | PARTIAL (lite read-only DONE; plans deferred)           |
| Vahid Access Resolver                  | EXISTS (Phase 06; legacy alias deprecated → 2026-12-31) |
| Security acceptance matrix             | EXISTS (Phase 08; prod GO pending User)                 |

## Əlaqəli mövcud sənədlər (toxunulmur)

- Root hədəf spec: [`AccessControlArixtektura.md`](../../AccessControlArixtektura.md)
- TAGET roadmap: [`TAGET.MD`](../../TAGET.MD)
- Global ops: [`docs/ops/WORKER.md`](../ops/WORKER.md)
- Auth overview: [`docs/architecture/authentication.md`](../architecture/authentication.md)
- Auth HTTP contract: [`apps/api/docs/PHASE-2B-AUTH-CONTRACT.md`](../../apps/api/docs/PHASE-2B-AUTH-CONTRACT.md)

`docs/access_control/backend/WORKER.md` və `ui/WORKER.md` **scoped** müqavilələrdir;
monorepo `docs/ops/WORKER.md`-i əvəz etmir.

## Mərhələlər

| Phase          | Fayl                                                                                        | Bu delivery                        |
| -------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| 00 Audit       | [PHASE_00_AUDIT.md](./phases/PHASE_00_AUDIT.md)                                             | DONE (docs)                        |
| 01 Decisions   | [PHASE_01_ARCHITECTURE_DECISIONS.md](./phases/PHASE_01_ARCHITECTURE_DECISIONS.md)           | DONE (2026-10-27)                  |
| 02 Auth        | [PHASE_02_AUTH_AND_SESSION.md](./phases/PHASE_02_AUTH_AND_SESSION.md)                       | DONE (2026-10-27)                  |
| 03 Tenant      | [PHASE_03_TENANT_AND_MEMBERSHIP.md](./phases/PHASE_03_TENANT_AND_MEMBERSHIP.md)             | DONE (2026-10-27)                  |
| 04 Modules     | [PHASE_04_MODULES_AND_SUBSCRIPTIONS.md](./phases/PHASE_04_MODULES_AND_SUBSCRIPTIONS.md)     | DONE (2026-10-27)                  |
| 05 Roles/Scope | [PHASE_05_ROLES_PERMISSIONS_AND_SCOPE.md](./phases/PHASE_05_ROLES_PERMISSIONS_AND_SCOPE.md) | DONE (2026-10-27)                  |
| 06 Resolver    | [PHASE_06_EFFECTIVE_ACCESS_RESOLVER.md](./phases/PHASE_06_EFFECTIVE_ACCESS_RESOLVER.md)     | DONE (2026-10-27)                  |
| 07 Admin UI    | [PHASE_07_ADMIN_UI.md](./phases/PHASE_07_ADMIN_UI.md)                                       | DONE (2026-10-27)                  |
| 08 Security    | [PHASE_08_SECURITY_AND_ACCEPTANCE.md](./phases/PHASE_08_SECURITY_AND_ACCEPTANCE.md)         | DONE (2026-10-27; prod GO pending) |
| 09 Delta       | [PHASE_09_DELTA.md](./phases/PHASE_09_DELTA.md)                                             | DONE (2026-10-28)                  |

## Dəmir qaydalar

1. Backend authorization = tək təhlükəsizlik mənbəyi.
2. Menu görünməsi permission enforcement deyil.
3. Organization ≠ Organization Unit.
4. Yeni qərarlar istifadəçi təsdiqi olmadan `APPROVED` olmur (AC-D01…D08 artıq kilidlidir).
5. Yeni `@azes/role_system` paketi default həll deyil — adaptasiya prioritetdir.
6. Növbəti phase yalnız əvvəlki qəbul + istifadəçi GO-dan sonra.
