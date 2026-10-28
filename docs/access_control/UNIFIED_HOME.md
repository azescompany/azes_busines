<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/UNIFIED_HOME.md
║ Author: AZES_COMPANY
║ Created: 2026-10-28
║ Updated: 2026-10-28
║ Purpose: Unified /{locale} AppShell — demo|tenant audience (≠ DEMO_SEED)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Unified home (`/{locale}`)

## What

`AdminShell` + `AzesDashboardLayout` is the single chrome for:

| Audience | Session           | Primary toolbar           | Modules                                  | Data                                        |
| -------- | ----------------- | ------------------------- | ---------------------------------------- | ------------------------------------------- |
| `demo`   | not authenticated | hidden (`hidePrimaryNav`) | full `MODULE_REGISTRY`                   | `demoSession` + placeholder (no API writes) |
| `tenant` | authenticated     | `/me.nav`                 | platform → all; else strict entitlements | `/me` + real APIs                           |

Home path is `/` for both. Legacy `/apps` and `/demo/m/:id` redirect.

Privileged routes (`organizations`, `users`, …) nest under `AuthGate`.

## Not this

- **Not** a DB `endUser` role / OpenAPI membership change.
- **Not** [`DEMO_SEED.md`](DEMO_SEED.md) / D1 tenant seed.
- Public explore surface contract (ephemeral, no write): see [`DEMO_CLIENT_CONTRACT.md`](DEMO_CLIENT_CONTRACT.md).

## Entitlement policy (launcher)

- `demo` → full registry.
- `tenant` + `superAdmin` | `generalAdmin` (`/me.roles`) → full registry.
- `tenant` + other → enabled non-blocked entitlement codes only; **empty entitlements → no modules** (no silent full-registry fallback).
