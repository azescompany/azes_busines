<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/admin/README.md
║ Author: AZES_COMPANY
║ Created: 2026-10-26
║ Updated: 2026-10-26
║ Purpose: Admin SPA overview — port 200 + Account SSO handoff
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/admin`

AZES **Admin** Vite SPA shell. Dev port: **200**.

## Auth flow

1. User opens Admin without a session → redirect to Account (`:100`) with `returnUrl`.
2. Account login succeeds → `#azes_auth` hash handoff to `VITE_ADMIN_APP_URL` (default `:200`).
3. Admin `consumeHandoff` seeds device fingerprint + establishes session cookies.

```bash
pnpm --filter @azes/admin dev
```
