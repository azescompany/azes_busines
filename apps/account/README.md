<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/account/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-19
║ Purpose: Runbook for @azes/account (AZES auth Phase 2C)
║ Layer: app
╚══════════════════════════════════════════════════════════════╝
-->

# @azes/account

AZES **Account** Vite SPA — login + `#azes_auth` handoff. Dev port: **100**.

```bash
pnpm --filter @azes/account dev
```

## Local auth (Phase 2C)

1. Run `@azes/api-server` (migrate + seed + `wrangler dev`) — see `apps/api/README.md`.
2. Copy `.env.example` → `.env` with `VITE_API_BASE_URL=http://127.0.0.1:8787`.
3. Login with seed user `local.dev` / `LocalDevPass123!`.

Login uses `@azes/api/azes` (`POST /api/v1/auth/login`). Caspian `/accounts/login` is not used.
