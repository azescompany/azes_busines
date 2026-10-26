<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/ops/CURRENT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-26
║ Updated: 2026-10-26
║ Purpose: Canlı əməliyyat hesabatı — ERP Authz TAGET M1.6–M4
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# CURRENT — canlı hesabat

**Mərhələ:** TAGET **M1.6–M4** ERP Authz batch  
**M1.5:** ACCEPTED  
**Status:** implementasiya tamam — qəbul gözlənilir  
**Tarix:** 2026-10-26

## Tamamlanan

| Mərhələ | Nəticə |
| --- | --- |
| M1.6 Bootstrap & Live Authz | `useSessionMe` + `requirePermission`→`effectiveCan`; test PASS |
| M2 Module Registry | `0008_platform_modules`; `GET/PUT …/modules` |
| M2.5 Hierarchy & orgMulti | `0009`; root yalnız SuperAdmin; `parentOrganizationId` |
| M3 User Access Profiles | `0010`; profiles + user access API |
| M3.5 Data Scope | membership `data_scope`; CRM list filter |
| M4 Audit & CRM | `0011`; audit-logs + customers CRUD + Admin UI |

## Validation

| Gate | Nəticə |
| --- | --- |
| migrate 0008–0011 | PASS |
| vitest menu/rbac/tenant/erp (27) | PASS |
| api-server + admin typecheck | PASS |

## Açıq risklər

- Cookie hələ JS-readable (HttpOnly epic ayrı).
- OpenAPI 0.16 path inventory Orval regen — CRM Admin hazırda `azesMutator` ilə.
- `org_multi` JWT claim-i tam deyil; child create SuperAdmin yolu əsasdır.
