<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/api/docs/PHASE-2B-AUTH-CONTRACT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-19
║ Updated: 2026-10-27
║ Purpose: Phase 2B/2E authentication HTTP contract (server implemented)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Phase 2B — authentication contract

**Status:** implemented on `@azes/api-server` (HTTP handlers + local seed).
**Phase 2C client cutover:** OpenAPI at `packages/api/openapi/azes/`; Account/Academy use
`@azes/api/azes` + `VITE_API_BASE_URL` → Worker.
**Phase 2E hardening:** atomic refresh rotate; revoked-token reuse revokes all user
sessions; CORS via `CORS_ALLOWED_ORIGINS`; D1 rate limits → `RATE_LIMITED` (429).
**Phase 2F:** `GET /api/v1/me` — Bearer access JWT → `{ userId, username, roles, status }`.
**Access-control Phase 02 (AC-D05 A):** trusted request context + claim hygiene —
JWT `permissions[]` is **compat-only** (not authoritative); live `effectiveCan` when
`menuRepo` is present.

## Goals

- Replace Caspian login/refresh with AZES-owned endpoints on `@azes/api-server`.
- Store only password hashes and refresh-token hashes (tables from Phase 2A).
- Keep `#azes_auth` handoff between Account → Academy (and future apps) at the app layer.

## Endpoints

| Method | Path                   | Auth                   | Purpose                                |
| ------ | ---------------------- | ---------------------- | -------------------------------------- |
| `POST` | `/api/v1/auth/login`   | public                 | Username + password → access + refresh |
| `POST` | `/api/v1/auth/refresh` | public (refresh token) | Rotate refresh; issue new access       |
| `POST` | `/api/v1/auth/logout`  | refresh or access      | Revoke current refresh session         |
| `GET`  | `/api/v1/me`           | Bearer access JWT      | Current user identity                  |

Do **not** reuse Caspian paths (`/api/v1/accounts/login`, `/api/v1/accounts/refresh-token`) unless a temporary compatibility shim is explicitly approved.

## Request / response

### Login

```json
// POST /api/v1/auth/login
{
  "username": "string",
  "password": "string",
  "deviceId": "string",
  "userAgent": "string",
  "platform": "string",
  "language": "string"
}
```

```json
// 200
{
  "accessToken": "jwt",
  "refreshToken": "opaque",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

### Refresh

```json
// POST /api/v1/auth/refresh
{
  "refreshToken": "string",
  "deviceId": "string"
}
```

Same `200` shape as login. On rotation: set `refresh_sessions.revoked_at` + `replaced_by_id`
only when the old row is still active (`revoked_at IS NULL`). Parallel refresh of the same
token: at most one success; loser gets `TOKEN_REVOKED`. Presenting an already-revoked refresh
token revokes **all** active sessions for that user, then returns `TOKEN_REVOKED`.

### Logout

```json
// POST /api/v1/auth/logout
// Body (optional): { "refreshToken": "string" }
// OR header: Authorization: Bearer <accessToken>
```

```json
// 200
{ "ok": true }
```

Logout is idempotent when the token is already gone.

### Me (Phase 2F)

```http
GET /api/v1/me
Authorization: Bearer <accessToken>
```

```json
// 200
{
  "userId": "uuid",
  "username": "local.dev",
  "roles": ["member"],
  "status": "active"
}
```

Validates access JWT, active refresh session (`sid`), and active user. Missing/invalid
token → `401` `TOKEN_REVOKED`; expired refresh session → `401` `TOKEN_EXPIRED`;
disabled account → `403` `ACCOUNT_DISABLED`.

### Errors

Reuse Phase 2A envelope:

```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "…" } }
```

Codes: `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `TOKEN_REVOKED`, `TOKEN_EXPIRED`,
`VALIDATION_ERROR`, `RATE_LIMITED` (429 + `Retry-After`).

## Security notes (2B / 2E / AC-D05)

- Password: **PBKDF2-SHA-256** via Web Crypto (`pbkdf2$iterations$salt$hash`).
- Refresh token: high-entropy secret; persist **SHA-256** in `token_hash` only.
- Access JWT: HS256 (`jose`), TTL 900s.
- **Trusted claims (request context):** `sub`, `sid`, `orgId`, `roles` — taken only from
  the verified Bearer JWT. Handlers must not trust client body/query for identity
  (`userId` / `sessionId` / active `orgId`). Helper: `trustedRequestContext` /
  `getTrustedRequestContext`.
- **`permissions[]` claim (compat / deprecate window):** still emitted on login/refresh
  for clients that may read the snapshot. **Not authoritative** for server authz.
  Prefer live `requirePermission` → `effectiveCan` (menuRepo). Static fallback
  `claimHasPermission` uses **roles only** and ignores the claim. Removing emission
  is a breaking client change — keep until a later cleanup phase.
- Secrets only in `.dev.vars` / Worker secrets — never in repo or `[vars]`. Require
  `JWT_ACCESS_SECRET` (min 32 chars). Production: `wrangler secret put JWT_ACCESS_SECRET`.
- CORS: exact origins from `CORS_ALLOWED_ORIGINS` (comma-separated). No wildcards.
  `API_ENV=production` disables localhost fallback when the allowlist is empty/unset.
- Rate limits (login IP+username, refresh IP): D1-backed; response `429` / `RATE_LIMITED`.

### XSS / token storage trade-off (documented; redesign out of scope)

Web SSO (`@azes/auth` `webTokenCookies`) stores the access JWT in a **JS-readable**
cookie named `accessToken` (not HttpOnly) so Account → Admin `#azes_auth` / Bearer
handoff works across localhost ports. Any XSS in a sharing origin can read the
Bearer token until TTL expiry (900s). **Mitigation deferred:** HttpOnly-only + BFF
(or equivalent) is a separate storage security ADR — **not** Phase 02. Until then:
short TTL, refresh rotation + reuse→revoke-all, logout session revoke, and live
server authz remain the primary controls. CSRF is mitigated for SPA Bearer usage
(custom `Authorization` header, not cookie-auto-auth on API); cookie still aids
XSS token theft.

## Client migration (Phase 2C, after 2B works)

1. Publish OpenAPI for these paths under `packages/api/openapi/azes/`.
2. Regenerate Orval clients; update `@azes/auth` login/refresh URLs.
3. Point Account/Academy `VITE_API_BASE_URL` at the Worker origin.
4. Retire Caspian swagger usage for auth.
