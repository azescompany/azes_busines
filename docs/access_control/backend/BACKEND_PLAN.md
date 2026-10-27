<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/backend/BACKEND_PLAN.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Backend technical plan for access-control evolution
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Backend Plan — Access Control

**Adapt, do not rewrite.** Primary code: `apps/api`.  
Decisions: [../DECISIONS.md](../DECISIONS.md). Audit: [../CURRENT_STATE_AUDIT.md](../CURRENT_STATE_AUDIT.md).

---

## 1. Authentication / session

| Topic      | Plan                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| Endpoints  | Keep `POST /auth/login                                                                        | refresh | logout`, `GET /me` (`routes/auth.ts`) |
| Claims     | `sub`, `sid`, `orgId`, `roles` trusted; `permissions[]` compat-only (AC-D05 A, Phase 02 DONE) |
| TTL        | Keep 900s (unchanged in Phase 02)                                                             |
| Refresh    | Keep rotation + reuse→revoke-all (Phase 2E)                                                   |
| Middleware | `requireAuth` + `getTrustedRequestContext`; no re-fetch of `sub` for identity                 |
| Revocation | Session revoke on logout; live `effectiveCan` for authz freshness                             |

Reference: `apps/api/docs/PHASE-2B-AUTH-CONTRACT.md`, `auth/tokens.ts`, `auth/service.ts`.

---

## 2. Tenant & membership

| Topic       | Plan                                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Memberships | Keep `organization_memberships`; active org via `POST /me/active-organization` + `users.org_id` pointer                                |
| Isolation   | Continue assert-same-org patterns; every org-owned table filtered by orgId from context                                                |
| Units       | **DONE Phase 03:** `organization_units` + `unit_memberships`; routes `orgUnits.ts` — **do not** reuse `parentOrganizationId` as branch |
| Parent org  | Remains holding/child tenant tree (M2.5)                                                                                               |

Routes: `routes/tenant.ts`, `routes/org.ts`, `routes/orgUnits.ts`.

---

## 3. Modules & subscriptions

| Topic        | Plan                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Registry     | Keep `platform_modules`, `module_menus`, `organization_modules`                                                  |
| Enforcement  | **Phase 04 DONE** dual-read (`access/entitlement*` + `requirePermission` / `/me` filter); full resolver Phase 06 |
| Subscription | **AC-D08 lite DONE:** blocked + trial→read_only + `subscriptionReadOnly`; full plans deferred                    |
| APIs         | `routes/platformModules.ts`; org module PUT remains `org.manage_all` (AC-D01 A)                                  |

---

## 4. Role / permission registry

| Topic          | Plan                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Codes          | Canonical string permissions (AC-D03); grow TypeScript union carefully or move to registry table later |
| Menus          | Keep `menus`, `menu_permissions`, `role_menus`                                                         |
| Profiles       | Keep `permission_profiles`; map CRUD → codes on assign                                                 |
| Overrides      | Phase 05: wired into `effectiveAccess` dual-read; unified resolver → Phase 06                          |
| Platform roles | Keep elastic catalog `platform-roles`                                                                  |
| LMS            | Separate grant channel (AC-D07); do not expand `ROLE_PERMISSIONS` ERP surface via LMS roles            |

---

## 5. Scope & delegation

| Topic                      | Plan                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Current                    | `data_scope` org/own/subtree + CRM owner filter                                                                       |
| Fix (Phase 05 DONE)        | `subtree` = viewer units + descendants (`isOwnerVisibleInUnitSubtree`); sync `isOwnerVisible` fails closed (own-like) |
| Delegation (Phase 05 DONE) | Ceiling on user-access PUT; SuperAdmin protected; LMS grant channel separate (AC-D07)                                 |

---

## 6. Effective Access Resolver

| Topic     | Plan                                                                  |
| --------- | --------------------------------------------------------------------- |
| Location  | `apps/api/src/access/effectiveAccess.ts` — AC-D06 A DONE              |
| Consumers | `requirePermission`, `getMe` (same `resolveEffectiveAccess`)          |
| Layers    | membership, entitlement, role menus, user overrides, scope summary    |
| Caching   | `accessVersion` fingerprint on `/me`; never sole revocation mechanism |
| Flag      | `ACCESS_RESOLVER_MODE=legacy                                          | unified` (default unified) |

---

## 7. API & OpenAPI

- Additive OpenAPI changes only unless phase explicitly breaking.
- Regen via Orval; update `docs/api/CURRENT-STATE.md` when runtime facts change (Worker rule).
- Do not invent routes already present (`/me/organizations`, modules, role menus, user access).

Known access-related routes (EXISTS — extend, don't duplicate):

- Auth: `/api/v1/auth/*`, `/api/v1/me`
- Tenant: `/api/v1/me/organizations`, `/api/v1/me/active-organization`, org members/invites
- Menus/roles: `/api/v1/menus`, `/api/v1/roles`, `/api/v1/roles/:role/menus`
- Modules: `/api/v1/modules`, `/api/v1/orgs/:orgId/modules`
- User access: `/api/v1/permission-profiles`, user access PUT (see `userAccess.ts`)
- Platform roles/users, audit-logs, CRM customers

---

## 8. DB / migrations

- Drizzle schema: `apps/api/src/db/schema.ts`
- Migrations: `apps/api/drizzle/migrations/`
- Phase 00–01: **no** schema changes
- Later phases: one concern per migration; seed without silent privilege expansion

---

## 9. Audit & security

- Extend `audit_logs` writers for role/access/module/subscription privileged actions
- Never log secrets/tokens
- SuperAdmin bootstrap remains out-of-band documented procedure (no secrets in git)

---

## 10. Tests & phase dependencies

```text
01 decisions
 → 02 auth claim hygiene
 → 03 tenant/units
 → 04 entitlement
 → 05 roles/overrides/scope
 → 06 resolver + me contract
 → 08 security (07 is UI-led but needs 06 contract)
```

Backend may ship Phase 06 before UI Phase 07; UI must not invent contracts.

**Test command (verify package name at run time):** workspace filter for api-server / apps/api Vitest.
