<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/ops/CURRENT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-26
║ Updated: 2026-10-26
║ Purpose: Canlı əməliyyat hesabatı — M5.0-lite Tenant Console
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# CURRENT — canlı hesabat

**Mərhələ:** TAGET **M5.0-lite** SuperAdmin Tenant Console  
**M1.5:** ACCEPTED  
**M1.6–M4:** implementasiya tamam — qəbul gözlənilir  
**Status:** M5.0-lite implementasiya tamam — qəbul / Coordinator batch gözlənilir  
**Tarix:** 2026-10-26

## Tamamlanan

| Mərhələ                     | Nəticə                                                         |
| --------------------------- | -------------------------------------------------------------- |
| M1.6 Bootstrap & Live Authz | `useSessionMe` + `requirePermission`→`effectiveCan`; test PASS |
| M2 Module Registry          | `0008_platform_modules`; `GET/PUT …/modules`                   |
| M2.5 Hierarchy & orgMulti   | `0009`; root yalnız SuperAdmin; `parentOrganizationId`         |
| M3 User Access Profiles     | `0010`; profiles + user access API                             |
| M3.5 Data Scope             | membership `data_scope`; CRM list filter                       |
| M4 Audit & CRM              | `0011`; audit-logs + customers CRUD + Admin UI                 |
| M5.0-lite Tenant Console    | `0012`; org color/subscription; users+roles API; Admin UI      |

## Validation

| Gate                                   | Nəticə |
| -------------------------------------- | ------ |
| vitest api-server (93)                 | PASS   |
| api-server + admin typecheck           | PASS   |
| OpenAPI 0.17 + Orval + package exports | PASS   |

## Açıq risklər

- Cookie hələ JS-readable (HttpOnly epic ayrı).
- Fatura / aylıq xərc / grace UI — screenshot scope, M5.0-lite-dan kənar.
- `org_multi` JWT claim-i tam deyil; child create SuperAdmin yolu əsasdır.
- Full monorepo build / push — Coordinator batch.
