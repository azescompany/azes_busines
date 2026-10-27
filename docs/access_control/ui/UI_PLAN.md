<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/ui/UI_PLAN.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Frontend plan for access bootstrap, nav, and admin access UIs
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# UI Plan — Access Control

**Backend remains security authority.** UI consumes contracts from `@azes/api`.  
Depends on Phase 06 API shape (AC-D04) before inventing new client types.

---

## 1. Login → access bootstrap

1. Account app login via existing `@azes/auth` + AZES auth endpoints
2. SSO handoff to Admin (existing hash/cookie flow — do not redesign unless Phase 02 asks)
3. Admin boot: `AuthGate` → `GET /api/v1/me` (session bootstrap)
4. Render shell nav from `me.nav` only
5. Cache with long `staleTime`; invalidate on org switch / access mutations / logout (M1.6 pattern)

---

## 2. `/me` vs `/me/access` strategy

**PROPOSED AC-D04 A:** extend `/me` (modules, scope summary, `accessVersion`).  
UI Phase 07 must:

- Prefer additive fields on existing `useGetApiV1Me`
- Not introduce a second bootstrap fetch unless backend ships `/me/access`
- Treat `accessVersion` change as invalidate signal when present

---

## 3. Menu tree & modules

| Current                    | Target UI                                                                 |
| -------------------------- | ------------------------------------------------------------------------- |
| Flat `me.nav` → AdminShell | Same; support hierarchy if API adds children                              |
| Module entitlement         | Hide modules not in effective payload; never soft-unlock via local config |
| Hardcoded primaryNav       | Forbidden (already removed per TAGET)                                     |

Icon mapping stays in AdminShell (icon keys from API).

---

## 4. Organization switch

- Existing `OrgSwitcher` + `POST /api/v1/me/active-organization`
- On success: invalidate me + org-scoped queries; clear incompatible UI state
- Never trust client-typed orgId without API success

Feature: `apps/admin/src/features/organizations/components/OrgSwitcher`.

---

## 5. Administration screens (EXISTING — evolve)

| Screen         | Feature path             | Notes                                            |
| -------------- | ------------------------ | ------------------------------------------------ |
| Organizations  | `features/organizations` | Subscription lite fields already; plan UI later  |
| Users          | `UsersView`              | Platform vs orgAdmin create rules                |
| Role menus     | `features/roleMenus`     | SuperAdmin / `org.manage_all`                    |
| Platform roles | `features/platformRoles` | Elastic catalog                                  |
| User access    | `features/userAccess`    | Profiles + CRUD flags — align with AC-D03 mapper |
| Customers      | `features/customers`     | Permission UX via `checkPermission`              |

**Missing UI (Phase 07 after API):** org module assignment console, unit/branch admin, subscription plan management, GeneralAdmin labeling (AC-D01).

---

## 6. Permission UX

- `checkPermission(me.permissions, code)` — enable/disable only
- Forbidden pages: redirect/home per existing shell rules when path not in nav
- Do not call privileged mutations if UI thinks user lacks perm — still handle 403

---

## 7. Loading / empty / error / forbidden / stale-access

| State        | Behavior                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Loading      | Existing loaders/skeletons (`CaspianLoader` / feature skeletons)                                   |
| Empty nav    | Home-only / empty state — no invented menus                                                        |
| Error me     | Block shell; retry/logout path                                                                     |
| 403          | Snackbar / page forbidden; no silent ignore                                                        |
| Stale access | Invalidate on `accessVersion` or mutation success; optional refetchOnWindowFocus policy documented |

---

## 8. Cache invalidation triggers

Invalidate me (and related) when:

- Active organization changes
- Role↔menu PUT succeeds
- User access PUT succeeds
- Platform role changes that affect actor
- Module entitlement changes (when UI exists)
- Logout

---

## 9. i18n & page architecture

- New/changed copy: **en + az + ru** same key tree
- Thin `pages/` + fat `features/` per `page-architecture.mdc`
- Tables: `AzesTable`; dialogs: `useAzesDialog`; no raw MUI DataGrid

---

## 10. Phase dependency

```text
UI Phase 07 starts only after Phase 06 contract APPROVED/shipped
  (or explicitly scoped to existing endpoints only)
```

Dizayner owns tokens/chrome only if a phase requires visual system change — default: compose existing.
