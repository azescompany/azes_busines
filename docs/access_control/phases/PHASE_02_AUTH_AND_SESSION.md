<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/phases/PHASE_02_AUTH_AND_SESSION.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 02 — auth, JWT, refresh, session, revocation plan
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# PHASE 02 — Auth & Session

**Status:** DONE (2026-10-27; AC-D05 APPROVED A).

## 1. Məqsəd

Mövcud AZES auth-u təkrarlamadan request-context və claim/revocation siyasətini
təsdiqlənmiş qərarlara uyğunlaşdırmaq.

## 2. Başlanğıc şərtləri

- Phase 01: AC-D05 APPROVED (AC-D04 if touching `/me` shape early)
- Backend WORKER read

## 3. Əvvəl oxunmalı

- `backend/WORKER.md`, `BACKEND_PLAN.md` §1
- `apps/api/docs/PHASE-2B-AUTH-CONTRACT.md`
- `apps/api/src/auth/tokens.ts`, `requireAuth.ts`, `service.ts`
- `packages/auth` web adapter

## 4. Araşdırılacaq

- Cookie flags / SSO handoff (`apps/account`, `apps/admin` auth)
- Refresh reuse tests
- Whether JWT `permissions` still emitted

## 5. Tapşırıq ardıcıllığı

1. Document trusted request context fields — **DONE**
2. Implement only APPROVED claim hygiene (compat window) — **DONE**
3. Confirm logout/refresh/revocation tests — **DONE**
4. Document XSS trade-off if access cookie remains JS-readable — **DONE**
5. Report + STOP — **DONE**

## 6. Backend işləri

- Token claim adjustments per AC-D05 — **DONE**
  - `trustedRequestContext` / `getTrustedRequestContext`
  - `claimHasPermission` ignores JWT `permissions[]` (roles-only fallback)
  - Login/refresh still emit `permissions[]` (compat / deprecate window)
  - Live `requirePermission` → `effectiveCan` preserved
- Tests: `auth.test.ts`, `permissions.test.ts`, `tokens.test.ts` — **DONE**

## 7. UI işləri

None — SSO cookie / HttpOnly redesign **out of scope**.

## 8. DB/API təsirləri

None. No new auth endpoints. OpenAPI/Orval unchanged.

## 9. Asılılıqlar / bloklayıcı qərarlar

AC-D05 APPROVED A. Storage redesign deferred (XSS note in PHASE-2B).

## 10. Test planı

Unauth/invalid token/refresh rotation/reuse/logout; claim hygiene; live deny
with stale JWT permissions irrelevant — regression `auth.test.ts` + unit tests.

## 11. Risklər / rollback

Breaking Account↔Admin SSO. Rollback: restore claim emission preference in
`claimHasPermission` if a client depended on server trusting JWT permissions
(should not). Cookie storage unchanged.

## 12. Acceptance criteria

[ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md) Phase 02 — checked.

## 13. Hesabat

Worker Agent Report + claim diff + scoped test/typecheck — see chat.

## 14. STOP / GO

**STOP** after Phase 02. **GO Phase 03** only after user reviews auth regression green.

## Claim / context summary (delivery)

| Field               | Source            | Authoritative?                          |
| ------------------- | ----------------- | --------------------------------------- |
| `sub` / `userId`    | verified JWT      | yes (identity)                          |
| `sid` / `sessionId` | verified JWT      | yes (session)                           |
| `orgId`             | verified JWT      | yes for request active-org pointer      |
| `roles`             | verified JWT      | bootstrap / static fallback only        |
| `permissions[]`     | JWT (compat emit) | **no** — live `effectiveCan` / role map |

XSS: JS-readable `accessToken` cookie documented in
`apps/api/docs/PHASE-2B-AUTH-CONTRACT.md` (no storage ADR in this phase).
