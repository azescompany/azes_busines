<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/ops/M0-AUDIT-REPORT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-26
║ Updated: 2026-10-26
║ Purpose: M0 Foundation Freeze & Hardening — audit + security results
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# M0 Audit Report — Foundation Freeze & Hardening

**Agent:** İcraçı  
**Date:** 2026-10-26  
**Source of truth:** `TAGET.MD` §5 / §12  
**Status:** PARTIAL → see checklist (git + generate:check blocked without `.git`)

---

## 1. Faktiki vəziyyət (audit)

| Item | Fact |
| --- | --- |
| Apps | `account`, `admin`, `api`, `azes-ui` |
| Ports (LISTEN at audit) | 100, 200, 700, 8787 — all up |
| Backend | Hono + Wrangler Workers + D1 + R2 (`apps/api`) |
| API base | `VITE_API_BASE_URL` → `http://127.0.0.1:8787` |
| OpenAPI → Orval | `pnpm api:generate` works (azes + admin + placeholder) |
| Git | **`.git` yoxdur** — user əvvəl silib |
| Academy FE | silinib; LMS API route/migrations qalır |

### Migrations (`apps/api/drizzle/migrations`)

- `0000_auth_foundation.sql`
- `0001_auth_rate_limits.sql`
- `0002_lms_foundation.sql`
- `0003_org_rbac_track.sql`
- `0004_lms_quiz.sql`
- `0005_lms_dashboard.sql`

### Auth backend (müsbət)

- Login / refresh / logout: `apps/api/src/auth/service.ts`
- Refresh **rotation** + reuse → revoke-all
- Rate limit + CORS exact origins (100 + 200)
- JWT access + hashed refresh secrets

### Frontend SSO

- Account: `#azes_auth` handoff + `returnUrl` allowlist
- Admin: `consumeAuthHandoff` + cookie session + AuthGate
- Cookies: `accessToken`, `refreshToken`, `token`, `azes_device_id` — **not HttpOnly** (legacy JS-readable cross-port)

---

## 2. Təhlükəsizlik tapıntıları

| ID | Risk | Severity | Status |
| --- | --- | --- | --- |
| S1 | `#azes_auth` Base64 JSON — imza/TTL yox idi; history/reuse riski | High | **Mitigated (M0):** `issuedAt` + 120s max age (Account emit + Admin reject) |
| S2 | JWT cookies **not HttpOnly** — XSS → token oğurluğu | High (accepted for localhost SSO) | **Documented** — HttpOnly/BFF = later ADR; M0-da architecture dəyişmə |
| S3 | Cookie `SameSite=Strict`, `Secure` yalnız HTTPS | Medium | OK local; prod domain cookie ilə test lazımdır |
| S4 | Handoff hələ imzasız (TTL only) | Medium | Open — signed one-time ticket = M1+ optional |
| S5 | `returnUrl` allowlist mövcud; evil origin fallback admin | Low | OK (tests cover) |
| S6 | LMS API hələ auth-lu route-lar — tenant core-dan ayrı inventar | Info | See LMS inventory |

---

## 3. LMS inventory (M0.8)

**FE:** `apps/academy` — REMOVED.

**API routes (qalır):**

- `routes/lms.ts` — catalog, enroll, lessons, progress, files
- `routes/lmsManage.ts` — manage courses/modules/lessons/files
- `routes/lmsQuiz.ts` — quizzes/assignments/attempts
- `routes/lmsDashboard.ts` — me dashboard/certs/bookmarks + manage analytics
- `routes/org.ts` — orgs + tracks (RBAC/org from Academy era)

**Tables:** via migrations 0002–0005 (+ org/track in 0003).

**Risk for M1:** Org/Track LMS tables must not become silent dependency for Tenant Core — inventar only; M1 redesigns org/membership independently (adapt existing where fit).

---

## 4. Quality gates (bu session)

| Gate | Result |
| --- | --- |
| `pnpm api:generate` | PASS (regen ran) |
| `pnpm api:generate:check` | **FAIL** — drift script needs `git ls-files` (no `.git`) |
| Account/Admin handoff tests | run after hardening |
| Full `pnpm build` / lint | run in gates step |

---

## 5. M0 hardening edilənlər

1. Account handoff payload: `issuedAt: Date.now()`
2. Admin consume: reject missing/stale `issuedAt` (>120s) + clock-skew guard
3. Tests updated

## 6. Blokerlər / açıq

1. **Git yoxdur** — commit/deploy/generate:check drift BLOCKED until user approves `git init` (+ remote).
2. Non-HttpOnly cookies — product/ADR; not silently flipped in M0.
3. Signed handoff ticket — backlog after M0.

## 7. Növbəti addım (təklif — avtomatik M1 yox)

1. User: `git init` icazəsi?  
2. M0 checklist təsdiqi  
3. Sonra M1 Tenant Core
