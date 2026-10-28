<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/DEMO_SEED.md
║ Author: AZES_COMPANY
║ Created: 2026-10-28
║ Updated: 2026-10-28
║ Purpose: Local/dev demo seed credentials (not production)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Demo seed (Phase 09) — local only

**Xəbərdarlıq:** Aşağıdakı parollar yalnız **lokal / development** üçündür. Production-da
işlətməyin; `seed:demo-env` production-da `REFUSED` verir.

## Generate

From `apps/api`:

```bash
AZES_ALLOW_DEMO_SEED=1 pnpm seed:demo-env
pnpm exec wrangler d1 execute azes-api --local --file=./.local/seed-demo-env.sql
```

Refuses without `AZES_ALLOW_DEMO_SEED=1` and refuses `NODE_ENV=production`.

Optional override: `AZES_DEMO_PASSWORD=...` (default below).

## Credentials (local/dev)

Shared local password for **all** demo accounts:

`LocalDevPass123!`

Mirror file (gitignored): `apps/api/.local/demo-credentials.json`

| Label | Username | Password |
| --- | --- | --- |
| SuperAdmin | `superadmin@azes.local` | `LocalDevPass123!` |
| GeneralAdmin | `generaladmin@azes.local` | `LocalDevPass123!` |
| AZES Company orgAdmin | `azes.admin@azes.local` | `LocalDevPass123!` |
| AZES Dev manager | `azes.devmgr@azes.local` | `LocalDevPass123!` |
| AZES Sales | `azes.sales@azes.local` | `LocalDevPass123!` |
| AZES Finance | `azes.finance@azes.local` | `LocalDevPass123!` |
| AZES Member | `azes.member@azes.local` | `LocalDevPass123!` |
| Demo Customer admin | `customer.admin@demo.local` | `LocalDevPass123!` |
| Demo Customer manager | `customer.mgr@demo.local` | `LocalDevPass123!` |
| Demo Customer user A | `customer.user.a@demo.local` | `LocalDevPass123!` |
| Demo Customer user B | `customer.user.b@demo.local` | `LocalDevPass123!` |

## Not this

- Client public demo surface (no D1): [`DEMO_CLIENT_CONTRACT.md`](./DEMO_CLIENT_CONTRACT.md)
- Unified AppShell home: [`UNIFIED_HOME.md`](./UNIFIED_HOME.md)
