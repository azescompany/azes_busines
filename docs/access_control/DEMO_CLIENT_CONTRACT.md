<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/DEMO_CLIENT_CONTRACT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-28
║ Updated: 2026-10-28
║ Purpose: Client-only public demo rules (distinct from D1 DEMO_SEED)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Demo client contract (public / ephemeral)

**Scope:** Browser-only demo audience for `apps/admin` unified AppShell.  
**Not this doc:** [`DEMO_SEED.md`](./DEMO_SEED.md) (local D1 seed credentials / SQL).  
**Shell routing:** [`UNIFIED_HOME.md`](./UNIFIED_HOME.md).

## Paths

| Surface                       | Logical path                           | Auth                               |
| ----------------------------- | -------------------------------------- | ---------------------------------- |
| Unified home (demo \| tenant) | `/` → `/{locale}`                      | Soft AppShell (no AuthGate)        |
| Module workspace              | `/m/:moduleId/*`                       | Soft AppShell; demo vs tenant data |
| Legacy apps bookmark          | `/apps` → `/`                          | Redirect                           |
| Legacy demo bookmark          | `/demo/m/:moduleId/*` → `/m/:moduleId` | Redirect                           |
| Privileged AC pages           | `/organizations`, `/users`, …          | Nested AuthGate                    |

## Rules

1. **No HTTP writes** to `apps/api` from demo audience UI.
2. **Ephemeral state** lives in memory (`features/demoSession`) — **no** `localStorage` /
   `sessionStorage` / IndexedDB for demo session (banner prefs may use separate keys).
3. Module catalog for demo = static `MODULE_REGISTRY` — **not** `GET /me` entitlements.
4. Future JSON demo packs load via `loadDemoPack` stub only (later phase).
5. Do not mix D1 `seed:demo-env` accounts with this client contract.
6. `demo` is an **audience** name — not a DB `endUser` role.

## Reset

`resetDemoSession()` clears in-memory state and bumps `generation` so views can remount.
