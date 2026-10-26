<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/api/README.md
║ Author: AZES_COMPANY
║ Created: 2026-10-19
║ Updated: 2026-10-20
║ Purpose: Local runbook for @azes/api-server (+ M8 release hardening link)
║ Layer: app
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/api-server` (`apps/api`)

AZES HTTP API: **Hono** on **Cloudflare Workers**, **D1** + **Drizzle**, **Zod**, **jose**.

**Phase 2B (current):** health + auth schema + `POST /api/v1/auth/login|refresh|logout`.  
No Account / Academy client wiring yet (Phase 2C). **Do not deploy** to production Cloudflare.

## Prerequisites

- Node from repo `.nvmrc` (major **24**)
- `pnpm` at monorepo root
- No paid Cloudflare plan required for local `wrangler dev` + local D1

## Install

From monorepo root:

```bash
pnpm install
```

## Scripts (package)

| Script                | Command                                         | Purpose                                        |
| --------------------- | ----------------------------------------------- | ---------------------------------------------- |
| `dev`                 | `wrangler dev`                                  | Local Worker (default `http://127.0.0.1:8787`) |
| `test`                | `vitest run`                                    | Unit tests (Hono `app.request`)                |
| `typecheck` / `build` | `tsc --noEmit`                                  | Typecheck                                      |
| `db:generate`         | `drizzle-kit generate`                          | Generate SQL from `src/db/schema.ts`           |
| `db:migrate:local`    | `wrangler d1 migrations apply azes-api --local` | Apply migrations to local D1                   |
| `seed:local-user`     | `node scripts/seed-local-user.mjs`              | Print SQL for local active user                |

Filter from root:

```bash
pnpm --filter @azes/api-server test
pnpm --filter @azes/api-server typecheck
pnpm --filter @azes/api-server dev
```

## Secrets (Phase 2B / 2E)

1. Copy `.dev.vars.example` → `.dev.vars`
2. Set `JWT_ACCESS_SECRET` to a random string **≥ 32 characters**
3. `.dev.vars` and `.wrangler/` are gitignored — never commit them
4. **Never** put `JWT_ACCESS_SECRET` in `wrangler.toml` `[vars]`, client `VITE_*`, or logs
5. Production (when approved): `wrangler secret put JWT_ACCESS_SECRET` (min 32 chars)

## CORS (Phase 2E)

- Worker var `CORS_ALLOWED_ORIGINS`: comma-separated **exact** origins (no `*`, no wildcards)
- Worker var `API_ENV`: `development` | `test` | `production` (alias `prod`)
- **Local / development / test:** if `CORS_ALLOWED_ORIGINS` is unset or empty, fallback allowlist is
  Account/Academy on `localhost` / `127.0.0.1` ports `100` and `200` (also set explicitly in
  `wrangler.toml` for local Wrangler)
- **Production (`API_ENV=production`):** localhost fallback is **disabled**. Empty/unset
  `CORS_ALLOWED_ORIGINS` → **deny all** browser origins (fail-safe). You must set exact SPA hosts:

```toml
# Production Worker vars (example — replace with real hosts)
API_ENV = "production"
CORS_ALLOWED_ORIGINS = "https://account.example.com,https://academy.example.com"
```

Never put `JWT_ACCESS_SECRET` in `[vars]`; use `wrangler secret put JWT_ACCESS_SECRET`.

## Rate limits (Phase 2E)

- Login: per IP + per username; refresh: per IP (D1-backed)
- Response: `429` + `error.code: RATE_LIMITED` + `Retry-After`
- Disable only when needed: `AUTH_RATE_LIMIT_ENABLED=false`

## D1 + migrations + local seed

```bash
pnpm --filter @azes/api-server db:migrate:local
pnpm --filter @azes/api-server seed:local-user > seed.sql
pnpm --filter @azes/api-server exec wrangler d1 execute azes-api --local --file=./seed.sql
```

Local-only credentials (printed by the seed script; **not for production**):

| Field    | Value              |
| -------- | ------------------ |
| username | `local.dev`        |
| password | `LocalDevPass123!` |

Per-role demo users (recommended for Academy RBAC smoke):

```bash
pnpm --filter @azes/api-server seed:role-users > seed-role-users.sql
pnpm --filter @azes/api-server exec wrangler d1 execute azes-api --local --file=./seed-role-users.sql
```

| Role       | Username          | Password           | orgId    |
| ---------- | ----------------- | ------------------ | -------- |
| superAdmin | `sa.demo`         | `LocalDevPass123!` | `null`   |
| orgAdmin   | `oa.demo`         | `LocalDevPass123!` | demo org |
| instructor | `instructor.demo` | `LocalDevPass123!` | demo org |
| student    | `student.demo`    | `LocalDevPass123!` | demo org |
| guest      | _(login yox)_     | —                  | —        |

Delete `seed.sql` / `seed-role-users.sql` after applying (they contain password hashes).

## Health smoke

```bash
pnpm --filter @azes/api-server dev
# other terminal:
curl -s http://127.0.0.1:8787/health
curl -s http://127.0.0.1:8787/api/v1/health
```

## Auth smoke (after migrate + seed + `.dev.vars`)

```bash
curl -s http://127.0.0.1:8787/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"username":"local.dev","password":"LocalDevPass123!","deviceId":"dev-1","userAgent":"curl","platform":"web","language":"en"}'
```

Refresh / logout:

```bash
# refresh — replace REFRESH with login response refreshToken
curl -s http://127.0.0.1:8787/api/v1/auth/refresh \
  -H 'content-type: application/json' \
  -d '{"refreshToken":"REFRESH","deviceId":"dev-1"}'

# logout via refresh
curl -s http://127.0.0.1:8787/api/v1/auth/logout \
  -H 'content-type: application/json' \
  -d '{"refreshToken":"REFRESH"}'
```

Contract details: [`docs/PHASE-2B-AUTH-CONTRACT.md`](docs/PHASE-2B-AUTH-CONTRACT.md).

Caspian paths (`/api/v1/accounts/*`) are **not** implemented here.

## API contract ownership (vs `@azes/api`)

| Piece                   | Owner                                     | Notes                               |
| ----------------------- | ----------------------------------------- | ----------------------------------- |
| Runtime HTTP API        | `apps/api` (`@azes/api-server`)           | Source of truth for behaviour       |
| OpenAPI + Orval clients | `packages/api`                            | Frontend consumes generated clients |
| Legacy Caspian swagger  | `packages/api/openapi/admin/swagger.json` | Still used by Account until 2C      |

**Phase 2C migration (recorded, not executed here):**

1. Publish AZES OpenAPI under `packages/api/openapi/azes/`.
2. Point Orval at the new spec; regenerate clients.
3. Update Account / Academy `configureApi({ baseUrl })` to the Worker origin.
4. Align `@azes/auth` + mutator refresh/login paths with this auth contract.
5. Keep existing generated Caspian clients untouched until that cutover.

## Academy release hardening (M8)

See [`docs/academy/RELEASE-HARDENING.md`](../../docs/academy/RELEASE-HARDENING.md) for rate limits,
API E2E, staging smoke, a11y/perf checklist, and migration/rollback notes.

## Deploy

**Do not deploy.** Do not create production Cloudflare resources from this app yet.
