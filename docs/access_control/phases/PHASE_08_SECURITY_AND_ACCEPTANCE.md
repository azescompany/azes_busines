<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_08_SECURITY_AND_ACCEPTANCE.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 08 — security verification, regression, release acceptance
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 08 — Security & Acceptance

**Status:** DONE (2026-10-27) — engineering acceptance. **Production GO:** pending User.

## 1. Məqsəd

Təhlükəsizlik, tenant isolation, privilege escalation, revocation, migration cleanup və
release acceptance. İmplementasiya fix-ləri yalnız aşkar regressiya üçün — yeni feature yox.

## 2. Başlanğıc şərtləri

- Phases 02–07 complete for in-scope slice ✓
- ACCEPTANCE_CRITERIA cross-cutting list ready ✓

## 3. Əvvəl oxunmalı

- ACCEPTANCE_CRITERIA.md (all phases + § cross-cutting)
- MIGRATION_PLAN exit criteria
- DECISIONS final statuses (AC-D01…D08 APPROVED A)
- [SECURITY_MATRIX.md](../SECURITY_MATRIX.md)
- [RESIDUAL_LIMITATIONS.md](../RESIDUAL_LIMITATIONS.md)

## 4. Araşdırıldı

| Sual                           | Nəticə                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Dual-read flags still on?      | `ACCESS_RESOLVER_MODE` default `unified`; `legacy` = identical core (rollback alias) |
| JWT permissions authoritative? | No — ignored in `claimHasPermission` / live resolver                                 |
| Audit coverage gaps            | Filled `org.modules.update`; role/access already audited                             |
| OpenAPI drift                  | No OpenAPI change in Phase 08                                                        |

## 5. Tapşırıq ardıcıllığı — icra

1. ✓ Map 20 cross-cutting → [SECURITY_MATRIX.md](../SECURITY_MATRIX.md)
2. Scoped `@azes/api-server` test + typecheck (Coordinator full gates on request)
3. ✓ Dated deprecation: legacy mode + JWT `permissions[]` → **2026-12-31**
4. ✓ Residual limitations written
5. User GO for production — **pending**
6. STOP

## 6. Backend işləri

- `platformModules` PUT → `writeAuditLog` (`org.modules.update`)
- Deprecation comments: `effectiveAccess.ts`, `permissions.ts`, `env.ts`
- Docs: SECURITY_MATRIX, RESIDUAL_LIMITATIONS; ACCEPTANCE Phase 08 checkboxes

## 7. UI işləri

Acceptance fail fix only — none required this phase.

## 8. DB/API təsirləri

No schema/OpenAPI break. Deprecation window only.

## 9. Asılılıqlar / bloklayıcı qərarlar

AC-D01…D08 all APPROVED A ✓

## 10. Test planı

- SECURITY_MATRIX AUTO rows → existing + phase suites
- MANUAL staging checklist in SECURITY_MATRIX
- `pnpm --filter @azes/api-server test` + `typecheck`

## 11. Risklər / rollback

- Skip MANUAL → false GO risk. Rollback: keep `ACCESS_RESOLVER_MODE=legacy` until 2026-12-31.

## 12. Acceptance criteria

See ACCEPTANCE Phase 08 + MIGRATION §8 (documented in RESIDUAL_LIMITATIONS).

## 13. Hesabat

Agent Worker Report (this phase). Coordinator Report when user asks full gates / deploy.

## 14. STOP / GO

**STOP** after Worker report. Production apply = User **GO** on MANUAL + Coord gates.
Further product work = new approved initiative (not silent Phase 09).
