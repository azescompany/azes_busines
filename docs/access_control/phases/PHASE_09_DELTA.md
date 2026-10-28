<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_09_DELTA.md
║ Author: AZES_COMPANY
║ Created: 2026-10-28
║ Updated: 2026-10-28
║ Purpose: Phase 09 — access-control delta (soft LMS de-authz, GA, seed, audit UI)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 09 — Access Control Delta

**Status:** DONE (2026-10-28)  
**Scope rule:** Do **not** re-implement Phases 00–08. Delta only.

## 1. Locked choices (user)

| ID           | Choice                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| LMS          | **1A soft de-authz** — keep enum values; strip platform/ERP grants via ROLE_PERMISSIONS / invite / grant (AC-D07 A preserved) |
| Wave         | **2A Phase 09 only**                                                                                                          |
| GeneralAdmin | Capability set only (AC-D01 A) — **no** new membership/JWT enum                                                               |
| Seed         | Multi-org, idempotent, no plaintext in repo, refuse production                                                                |
| UI           | Audit browser + `/me` invalidation gaps                                                                                       |

## 2. Gap matrix (closing)

| Item                       | Was      | Now                                              |
| -------------------------- | -------- | ------------------------------------------------ |
| Unified resolver           | EXISTS   | Unchanged                                        |
| LMS roles as authz for ERP | CONFLICT | Soft de-authz + menu bind guard                  |
| GeneralAdmin capability    | MISSING  | `generalAdmin` profile + seed                    |
| Multi-org demo seed        | MISSING  | `seed:demo-env` + DEMO_SEED.md                   |
| Audit OpenAPI + Admin UI   | MISSING  | OpenAPI 0.21 + `features/auditLogs`              |
| `/me` invalidation gaps    | PARTIAL  | PlatformRoles / Orgs block / Users / unit assign |

## 3. Deliverables checklist

- [x] Soft de-authz + tests
- [x] GeneralAdmin capability + SA protection tests
- [x] Demo seed (2 orgs, units, users) + prod refuse
- [x] OpenAPI audit + Orval
- [x] Admin `auditLogs` feature + i18n
- [x] Invalidation gaps
- [x] Docs refresh

## 4. Validation (2026-10-28)

```text
pnpm --filter @azes/api-server test          # PASS (144)
pnpm --filter @azes/api-server typecheck     # PASS
pnpm --filter @azes/admin test               # PASS (9)
pnpm --filter @azes/admin typecheck          # PASS
pnpm api:generate                            # run; commit generated/ via Coordinator
```

`api:generate:check` fails until Coordinator commits new `generated/azes/audit/**` (expected dirty tree).

## 5. Out of scope (unchanged)

Hard LMS enum drop; billing plans; HttpOnly cookie redesign; second resolver package.
