<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/CURRENT_STATE_AUDIT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Fact-based audit of current authz vs target architecture
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# CURRENT STATE AUDIT — Access Control

**Audit date:** 2026-10-27  
**Scope:** Read-only repository inspection for planning. No code changes.  
**Primary inputs:** `TAGET.MD`, `AccessControlArixtektura.md`, `apps/api`, `@azes/auth`,
`@azes/api`, `apps/admin` features.

Status legend:

| Status   | Meaning                                   |
| -------- | ----------------------------------------- |
| EXISTS   | Implemented and confirmed in code/tests   |
| PARTIAL  | Present but incomplete vs target          |
| MISSING  | Not found                                 |
| UNKNOWN  | Not fully verified in this audit pass     |
| CONFLICT | Parallel or contradictory implementations |

---

## 1. Authentication & session

| Item                                                    | Status             | Evidence                                                                                                                  |
| ------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Login / refresh / logout                                | EXISTS             | `apps/api/src/routes/auth.ts`; contract `apps/api/docs/PHASE-2B-AUTH-CONTRACT.md`                                         |
| Access JWT HS256                                        | EXISTS             | `apps/api/src/auth/tokens.ts` — claims: `sub`, `sid`, `roles`, `orgId`, optional `permissions`                            |
| Access TTL 900s                                         | EXISTS             | `apps/api/src/auth/types.ts` — `ACCESS_TOKEN_TTL_SEC = 900`                                                               |
| Refresh sessions (hash only)                            | EXISTS             | `refreshSessions` in `apps/api/src/db/schema.ts`; rotation + reuse → revoke-all in Phase 2E contract                      |
| Rate limits                                             | EXISTS             | `authRateLimits`; `apps/api/test/rateLimit.test.ts`                                                                       |
| `requireAuth` Bearer gate                               | EXISTS             | `apps/api/src/auth/requireAuth.ts`                                                                                        |
| `@azes/auth` web adapter                                | EXISTS             | `packages/auth/src/adapters/web/createWebAuthAdapter.ts` — cookies `accessToken` (Bearer) + refresh cookies               |
| HttpOnly-only access cookie                             | CONFLICT / PARTIAL | Access cookie is JS-readable to build Bearer header (documented adapter intent); target prefers memory + HttpOnly refresh |
| MFA / passkeys / SuperAdmin elevation                   | MISSING            | Not found in API auth routes                                                                                              |
| `accessVersion` claim / field                           | MISSING            | Not in token claims or `/me` response (audit of auth service)                                                             |
| Separate identity lookup every request solely for `sub` | PARTIAL            | JWT carries `sub`/`sid`/`orgId`; authz still hits DB for live permissions when `menuRepo` present                         |

**Tests:** `apps/api/test/auth.test.ts`, `rateLimit.test.ts`.

---

## 2. Authorization middleware & helpers

| Item                                                                  | Status            | Evidence                                                                                                               |
| --------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `requirePermission(permission)`                                       | EXISTS            | `requireAuth.ts` → `effectiveCan` when `menuRepo` set, else `claimHasPermission`                                       |
| `effectiveCan` / `resolveEffectiveAccess`                             | EXISTS (Phase 06) | `apps/api/src/access/effectiveAccess.ts` (menu wrap only)                                                              |
| Static `ROLE_PERMISSIONS` map                                         | EXISTS            | `apps/api/src/auth/permissions.ts`                                                                                     |
| Live menu UNION vs static map                                         | CONFLICT          | Menu-gated codes from DB UNION; non-gated LMS perms stay on static map; `superAdmin` short-circuits to full static set |
| JWT `permissions` snapshot path                                       | CONFLICT          | `claimHasPermission` prefers JWT `permissions` when `menuRepo` absent; live path ignores snapshot for enforcement      |
| Central Access Resolver (entitlement ∩ override ∩ scope ∩ delegation) | EXISTS (Phase 06) | `resolveEffectiveAccess`; ceiling remains on grant APIs (Phase 05)                                                     |
| Tenant assert helpers                                                 | EXISTS            | e.g. `apps/api/src/auth/scope.js` usage in `routes/org.ts`; CRM ownership via `dataScope.ts`                           |
| Delegation ceiling enforcement                                        | EXISTS (Phase 05) | `access/delegation.ts` — grant ⊆ actor grantable on user-access; SuperAdmin protected; full resolver merge → Phase 06  |

**Tests:** `menuRoleRbac.test.ts` (unassign → same JWT → 403), `rbacOrg.test.ts`, `erpAuthzRoadmap.test.ts`.

---

## 3. Users, orgs, membership

| Item                                         | Status            | Evidence                                                                                                                                                                        |
| -------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global `users` table                         | EXISTS            | `schema.ts` — password hash, status, optional `orgId`                                                                                                                           |
| `users.org_id` as active org pointer         | EXISTS / CONFLICT | Schema comment: multi-org via memberships; `org_id` = active pointer. Target §3.1 warns against mandatory single org on user — current design uses pointer, not sole membership |
| `organization_memberships`                   | EXISTS            | roles enum: `orgAdmin`, `instructor`, `student`, `guest`, `member`; `data_scope`; `org_multi`                                                                                   |
| Multi-org list + switch                      | EXISTS            | `GET /api/v1/me/organizations`, `POST /api/v1/me/active-organization` in `routes/tenant.ts`                                                                                     |
| Org invitations                              | EXISTS            | `organization_invitations`; accept route                                                                                                                                        |
| `parentOrganizationId` org tree              | EXISTS            | `organizations.parentOrganizationId`; M2.5 child create rules                                                                                                                   |
| Organization Unit (branch/dept/team)         | EXISTS            | Phase 03: `organization_units` + `unit_memberships`; API under `/orgs/:orgId/units` (UI Phase 07)                                                                               |
| Holding vs unit semantics documented in code | EXISTS            | Parent org = tenant tree; units = in-tenant hierarchy (AC-D02 A)                                                                                                                |

**Tests:** `tenantMembership.test.ts`, `tenantConsole.test.ts`, `rbacOrg.test.ts`.

---

## 4. Roles (platform / LMS / ERP)

| Item                                         | Status                           | Evidence                                                                       |
| -------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| `superAdmin`                                 | EXISTS                           | JWT roles; platform exception in `effectiveAccess.ts`; seed scripts            |
| `orgAdmin`                                   | EXISTS                           | Membership + `ROLE_PERMISSIONS` + menus                                        |
| LMS roles `instructor` / `student` / `guest` | EXISTS                           | Same enum as membership; mixed with ERP `member`                               |
| Elastic `platform-roles` catalog             | EXISTS                           | `routes/platformRoles.ts`; Admin `features/platformRoles`                      |
| `roles` + `user_roles` tables                | EXISTS                           | Platform role assignment storage                                               |
| `role_menus` by `role_name`                  | EXISTS                           | Global string role name, not org-scoped role id                                |
| GeneralAdmin as distinct authority           | MISSING                          | No symbol/role name `GeneralAdmin` in API permissions or membership enums      |
| Org-defined custom roles (tenant-scoped)     | PARTIAL / MISSING                | Platform roles elastic; org-local role entities with ceiling not fully modeled |
| SubAdmin hardcoded global role               | MISSING (intentional per target) | Target says use delegated org roles — not implemented as unit managers yet     |

---

## 5. Menus & permissions

| Item                                               | Status            | Evidence                                                                                                               |
| -------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `menus` catalog (flat)                             | EXISTS            | `schema.ts`; app=`admin`; seed in migrations `0007_menu_rbac`                                                          |
| Menu hierarchy (parent/children)                   | MISSING           | No parent_menu_id                                                                                                      |
| `menu_permissions`                                 | EXISTS            | menu_id ↔ permission_code                                                                                              |
| `role_menus`                                       | EXISTS            | role_name ↔ menu_id                                                                                                    |
| Permission TypeScript union                        | EXISTS            | `Permission` in `permissions.ts` (LMS + CRM + org + modules.manage + audit)                                            |
| First-class `permissions` registry table           | MISSING           | Codes live in TS + menu_permissions strings                                                                            |
| Business actions beyond CRUD (approve/post/refund) | PARTIAL           | CRM has CRUD codes; approve/post/refund not in current Permission union                                                |
| `permission_profiles` + items (CRUD flags)         | EXISTS            | Schema + `routes/userAccess.ts`                                                                                        |
| `user_menus` / `user_menu_permissions`             | EXISTS            | Schema + PUT user access API                                                                                           |
| User overrides in `getMe` / `effectiveCan`         | EXISTS (Phase 05) | `effectiveAccess` dual-read merges `user_menus` / `user_menu_permissions` via CRUD mapper; unified resolver → Phase 06 |
| Frontend `checkPermission(me.permissions, …)`      | EXISTS            | Usability only — e.g. `UserAccessView`, `PlatformRolesView`                                                            |

**API:** `GET /api/v1/menus`, `GET/PUT /api/v1/roles/{role}/menus`, `GET /api/v1/roles` (`routes/menu.ts`).  
**UI:** `apps/admin/src/features/roleMenus`, `userAccess`.  
**Tests:** `menuRoleRbac.test.ts`.

---

## 6. Modules & subscriptions

| Item                                                           | Status  | Evidence                                                                                                |
| -------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `platform_modules`                                             | EXISTS  | Distinct from LMS curriculum modules                                                                    |
| `module_menus` / `organization_modules` / `organization_menus` | EXISTS  | Schema + `routes/platformModules.ts`                                                                    |
| `GET /api/v1/modules`, org modules GET/PUT                     | EXISTS  | `org.manage_all` gated                                                                                  |
| Entitlement enforced inside `effectiveCan`                     | PARTIAL | Phase 04 dual-read: CRM module-bound filter + `requirePermission` entitlement; full resolver → Phase 06 |
| `subscriptionStatus` active/blocked                            | EXISTS  | `organizations.subscriptionStatus`; trial `trialEndsAt`                                                 |
| Subscription plans / plan_modules                              | MISSING | Deferred (AC-D08 A)                                                                                     |
| Grace period / read-only mode / usage limits                   | PARTIAL | `subscription_read_only` + expired trial → read_only; no grace/plans                                    |
| SuperAdmin org modules UI                                      | PARTIAL | TAGET: API ready; UI follow-up                                                                          |

**Tests:** `erpAuthzRoadmap.test.ts` smoke for modules path.

---

## 7. Data scope

| Item                                    | Status            | Evidence                                                                             |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| Membership `data_scope` enum            | EXISTS            | `org` \| `own` \| `subtree`                                                          |
| `normalizeDataScope` / `isOwnerVisible` | EXISTS            | `apps/api/src/auth/dataScope.ts`                                                     |
| CRM list filtering by scope             | EXISTS            | `routes/crmCustomers.ts`                                                             |
| `subtree` as real unit-tree filter      | EXISTS (Phase 05) | `isOwnerVisibleInUnitSubtree` (viewer units + descendants); sync helper fails closed |
| Record-level ACL beyond owner           | MISSING           | Not generalized                                                                      |

---

## 8. Access response & frontend bootstrap

| Item                                                | Status         | Evidence                                                         |
| --------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `GET /api/v1/me`                                    | EXISTS         | Identity + nav + permissions (menu UNION)                        |
| `GET /api/v1/me/access`                             | N/A (AC-D04 A) | Extended `/me` instead — modules/scopeSummary/accessVersion      |
| AdminShell nav from `me.nav`                        | EXISTS         | TAGET M1.5/M1.6; Admin features use `@azes/api` me hooks         |
| Org switcher UI                                     | EXISTS         | `apps/admin/src/features/organizations/components/OrgSwitcher`   |
| Cache invalidate on org-switch / role-menus         | PARTIAL        | TAGET M1.6 claims; verify per-feature invalidateQueries in admin |
| Loading / empty / forbidden UX standards for access | PARTIAL        | Page patterns exist; no dedicated stale-accessVersion protocol   |

---

## 9. Audit

| Item                                    | Status  | Evidence                                                                                |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `audit_logs` table                      | EXISTS  | Schema                                                                                  |
| `GET /api/v1/audit-logs`                | EXISTS  | `routes/auditLogs.ts` — `audit.read`                                                    |
| Comprehensive privileged-event coverage | PARTIAL | CRM/org changes partially instrumented; full target event list not verified as complete |

---

## 10. Admin UI inventory (access-related)

| Feature                     | Path                                             | Status                                        |
| --------------------------- | ------------------------------------------------ | --------------------------------------------- |
| Organizations               | `apps/admin/src/features/organizations`          | EXISTS                                        |
| Users (platform/org create) | Organizations `UsersView` + `POST /api/v1/users` | EXISTS                                        |
| Role ↔ menus                | `features/roleMenus`                             | EXISTS                                        |
| Platform roles              | `features/platformRoles`                         | EXISTS                                        |
| User access profiles        | `features/userAccess`                            | EXISTS (API wired; effective enforcement gap) |
| Customers (CRM)             | `features/customers`                             | EXISTS                                        |
| Module assignment UI        | —                                                | PARTIAL / MISSING (API yes)                   |
| Subscription plan UI        | —                                                | MISSING                                       |
| Unit / branch admin UI      | —                                                | MISSING                                       |

---

## 11. Target vs current matrix (summary)

| Target concept             | Current                      | Gap type                                  |
| -------------------------- | ---------------------------- | ----------------------------------------- |
| Token = identity + context | JWT roles + optional perms   | Shrink permission claims; keep live authz |
| Backend-generated menus    | `/me.nav`                    | Hierarchy + modules + overrides           |
| Effective Access formula   | Unified resolver (Phase 06)  | Admin UI consume → Phase 07               |
| GeneralAdmin               | Missing                      | Decision AC-D01                           |
| Org Unit                   | Exists (API Phase 03)        | UI Phase 07                               |
| Permission registry        | TS + menu codes + CRUD flags | Decision AC-D03                           |
| Subscription lifecycle     | Lite block/trial             | Phase 04                                  |
| Delegation ceiling         | Exists (Phase 05 helpers)    | Wired with resolver grantable set         |
| `/me` access fields        | Exists (AC-D04 A)            | modules + scopeSummary + accessVersion    |

---

## 12. Reusable components (do not rewrite)

- `apps/api` auth routes, tokens, refresh rotation, rate limits
- `requireAuth` / `requirePermission` middleware shape
- `menu` repository + Admin role-menus UI
- `platform_modules` / org modules APIs
- `organization_memberships` + active-organization
- `@azes/auth` + `@azes/api` mutator Bearer/refresh
- Audit log table + SuperAdmin read API
- Existing Vitest suites listed above

## 13. Highest risks (audit)

1. ~~**User overrides not in effective access**~~ — Phase 05 dual-read closes gap; Phase 06 unifies.
2. **Multiple permission sources** — static map, menu UNION, JWT snapshot, CRUD flags (Phase 06).
3. ~~**`subtree` illusion**~~ — Phase 05 unit-aware; sync fails closed.
4. **LMS + ERP role enum mixing** — mitigated (AC-D07 guards); enum still shared.
5. **JS-readable access token cookie** — XSS surface (documented trade-off).
6. **Entitlement not in core resolver** — dual-read filters exist; single resolver → Phase 06.

## 14. Audit completeness

| Area                                     | Coverage                                           |
| ---------------------------------------- | -------------------------------------------------- |
| `apps/api` schema + auth/menu/org routes | High                                               |
| Admin access features                    | High                                               |
| OpenAPI field-level every DTO            | Medium — regenerate/check in Phase 02/06           |
| Mobile/native auth adapters              | Low — noted EXISTS in package; not ERP-tested here |
| Production secret/bootstrap procedures   | UNKNOWN — intentionally not exposed in docs        |

**Phase 00 deliverable status:** COMPLETE for planning purposes (this file).
