<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/roadmap/phase-13-proposal.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Planning-only proposal for a future Phase 13 (not approved)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Phase 13 proposal — Account Auth Vertical Slice (planning only)

> **STATUS: PROPOSAL ONLY — NOT APPROVED — NOT STARTED**
>
> Phases 0–12 remain `COMPLETED`. This document does **not** authorize implementation.
> Do not mark Phase 13 `IN_PROGRESS` / `COMPLETED` until the user explicitly approves a
> phase definition into `WORKER.md`.

## Recommended title

**Phase 13 — Account Auth Vertical Slice (Web)**

## Objective

Deliver the first **end-to-end, user-facing vertical slice** in `@azes/account`:

session bootstrap → login/logout → protected Home → token refresh via existing `@azes/auth` +
`@azes/api` bridges — without turning shared packages into business-feature containers.

## Why now

Phases 0–12 delivered foundations, shells, quality gates, and architecture verification.
The next valuable step is **one thin product path** that proves package integration in a real
app (`auth`, `api`, `state`, `validation`, `i18n`, `permissions`, `ui-web`) before spreading
features across admin/agent/realestate/mobile.

## Scope (proposed)

1. **Web routing** for `@azes/account` only (public login route + protected app shell).
2. **Wire existing** `@azes/auth` web adapter + API token/refresh bridge into account providers.
3. **Login / logout / session restore** UX using `@azes/ui-web` + `@azes/validation` + `@azes/i18n`.
4. **Contract-driven auth API** via OpenAPI → Orval (`@azes/api`); placeholder/mock or real
   backend OpenAPI paths for auth endpoints.
5. **Client session flags** in `@azes/state` only where justified (not API entity cache).
6. **Minimal permission gate** using `@azes/permissions` for “can open account home”.
7. **Tests:** unit (validation/auth helpers), component (login form), account integration, one
   Playwright auth smoke (happy path + unauthenticated redirect).

## Out of scope (explicit)

- Admin / agent-platform / agent-site / realestate product features
- Mobile auth UI (`mobile-*`) beyond keeping packages compatible
- Dashboards, property search, agent workflows, menus from legacy systems
- New domain packages (`packages/account-domain`, etc.)
- Analytics / logger / feature-flags packages (still deferred)
- Full RBAC redesign or backend authorization productization
- Redesigning monorepo boundaries or UI architecture

## Apps affected

| App                   | Role in Phase 13                   |
| --------------------- | ---------------------------------- |
| `@azes/account`       | **Primary** — first vertical slice |
| Other web/mobile apps | Unchanged shells (regression only) |

## Packages affected

| Package             | Involvement                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `@azes/auth`        | Web adapter wiring, session contracts                               |
| `@azes/api`         | OpenAPI auth paths + generated hooks (no hand-edit of `generated/`) |
| `@azes/state`       | Session/UI client state only                                        |
| `@azes/validation`  | Login form schemas                                                  |
| `@azes/i18n`        | Auth copy                                                           |
| `@azes/permissions` | Coarse gate                                                         |
| `@azes/ui-web`      | Form/layout primitives (extend only if missing)                     |

## New packages

**None** unless a second product later forces shared account-domain extraction.

## API / backend dependencies

- **Required contract:** OpenAPI operations for login, refresh, logout (and optionally
  “me”/session). Exact paths TBD with backend.
- **Acceptable for Phase 13:** contract-first mock / MSW / stub backend matching Orval output.
- **Not acceptable:** inventing a second HTTP client outside `@azes/api`.

Reference behavior (not a port mandate): `apps/account/ARCHITECTURE.md` (legacy Caspian Key notes).

## Architecture fit

- Keep business UI in `apps/account/src/features/…`
- Shared packages stay capability layers
- Server state → TanStack Query; client session → RTK
- No `apps → apps`; no deep imports; UI must not import `api`/`state`/`auth`

## User-facing result

A developer (or tester) can open Account, log in against the auth contract, land on a protected
Home, refresh the session, and log out — with regression-safe other shells.

## Testing

- Unit: validation schemas, auth client helpers
- Component: login form
- Integration: providers + protected route
- E2E: Playwright account auth smoke (extend Phase 11 suite)

## Acceptance criteria

1. Unauthenticated user cannot reach protected Account Home.
2. Successful login establishes session and reaches Home.
3. Logout clears session and returns to login.
4. Refresh path uses `@azes/auth` + `@azes/api` bridge (no ad-hoc fetch).
5. OpenAPI drift check still green; no hand-edited `generated/`.
6. Boundary lint / `architecture:verify` still pass.
7. Other seven apps still build/test; root `pnpm dev` still orchestrates all apps.

## Risks

- Auth OpenAPI not ready → must agree mock contract early.
- Over-porting legacy cookie/menu complexity from `ARCHITECTURE.md`.
- Putting server entities into Redux.
- Expanding scope to other apps mid-phase.

## Recommended implementation sequence

1. Freeze auth OpenAPI (real or mock) + regenerate `@azes/api`.
2. Account routing skeleton (public/protected) — still no business features beyond auth.
3. Wire providers (auth adapter + token bridge).
4. Login/logout UI + validation/i18n.
5. Session restore + refresh path.
6. Coarse permission gate.
7. Tests + Playwright smoke.
8. WORKER checklist + validation gates.

## Related DX (already true after Phase 0–12)

Canonical local run from root:

```bash
pnpm install
pnpm dev
```

See [../development/getting-started.md](../development/getting-started.md).
