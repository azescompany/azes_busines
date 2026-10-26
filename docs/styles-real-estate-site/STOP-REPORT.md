<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/STOP-REPORT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Implementation STOP blockers for backend / map lib
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# STOP Report — Caspian marketplace template

UI/repositories shipped with mocks and adapters. Do **not** invent endpoints.

| #   | Gap                                                                    | Current UI                                         | Needed                                 |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| 1   | Public/anon listings API                                               | Non-prod mock fallback; prod throws → error UI     | Public browse without Bearer           |
| 2   | Agent domain C API                                                     | `mockAgentRepository` only                         | Public agent list/detail + admin CRUD  |
| 3   | Lead submit                                                            | Dev mock; prod `canSubmit=false`                   | Lead/inquiry endpoint                  |
| 4   | Map library                                                            | `MapAdapter` placeholder                           | Ask-first Leaflet/Mapbox (or approved) |
| 5   | Advanced AZ filters (metro, docType, repair, sellerType, availability) | Optional / ignored                                 | filterMeta + DTO fields                |
| 6   | Agencies / complexes public API                                        | Mock when `enableDirectoryMocks`; else coming soon | Public orgs/complexes                  |

Details: [data-contract.md](./data-contract.md).
