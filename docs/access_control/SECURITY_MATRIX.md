<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/SECURITY_MATRIX.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Phase 08 — cross-cutting 20-case map (auto vs manual)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Security Matrix — Cross-cutting Cases (Phase 08)

Maps ACCEPTANCE_CRITERIA cross-cutting §1–20 → automated Vitest **or** dated MANUAL
checklist with owner. Owner codes: **BE** = Agent Worker / api-server; **UI** = Admin QA /
Dizayner; **Coord** = Coordinator release; **User** = product GO.

| #   | Case                               | Coverage      | Evidence                                                                                                                                          | Owner   |
| --- | ---------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | Unauthenticated → reject           | AUTO          | `auth.test.ts` — `/me` missing Bearer → 401                                                                                                       | BE      |
| 2   | Bad token → reject                 | AUTO          | `auth.test.ts` — wrong-signed JWT → 401                                                                                                           | BE      |
| 3   | Disabled user → reject             | AUTO          | `auth.test.ts` — login rejects disabled                                                                                                           | BE      |
| 4   | No membership → reject             | AUTO          | `tenantMembership.test.ts` — switch / cross-tenant without membership → 403                                                                       | BE      |
| 5   | Cross-tenant → reject              | AUTO          | `tenantMembership.test.ts`, `orgUnits.test.ts` IDOR                                                                                               | BE      |
| 6   | Unentitled module → reject         | AUTO          | `erpAuthzRoadmap.test.ts` — orgAdmin cannot activate modules; entitlement deny                                                                    | BE      |
| 7   | Disabled module APIs → reject      | AUTO          | `erpAuthzRoadmap.test.ts` — soft-disable CRM → 403                                                                                                | BE      |
| 8   | Org admin menus ⊆ entitled modules | AUTO          | Resolver ∩ entitlement (`phase06Resolver`, entitlementPolicy); nav filtered                                                                       | BE      |
| 9   | Normal user menus ⊆ assignments    | AUTO          | `menuRoleRbac.test.ts`, `rbacOrg.test.ts` nav vs role_menus                                                                                       | BE      |
| 10  | Menu ≠ action authz                | AUTO          | `phase06Resolver.test.ts` — customers nav without create → POST 403                                                                               | BE      |
| 11  | Read-only cannot mutate            | AUTO          | `erpAuthzRoadmap.test.ts` — read-only subscription GET ok / POST 403                                                                              | BE      |
| 12  | Branch/unit isolation              | AUTO          | `dataScope.test.ts` subtree; `orgUnits.test.ts` CRUD/IDOR                                                                                         | BE      |
| 13  | Delegation ceiling                 | AUTO          | `phase05RolesScope.test.ts` — ceiling deny + `user.access.denied_ceiling` audit                                                                   | BE      |
| 14  | Revocation window                  | AUTO          | `menuRoleRbac.test.ts` — unassign → same JWT 403 (live)                                                                                           | BE      |
| 15  | Org switch safety                  | AUTO + MANUAL | AUTO: `tenantMembership` switch only for active membership. MANUAL: Admin OrgSwitcher invalidates me/access queries (Phase 07) — smoke in staging | BE + UI |
| 16  | Concurrent refresh/logout          | AUTO          | `auth.test.ts` — parallel refresh ≤1 success; logout revoke                                                                                       | BE      |
| 17  | SuperAdmin not ordinary-assignable | AUTO          | `phase05RolesScope.test.ts` — platform-roles / role-menus guards                                                                                  | BE      |
| 18  | Subscription expiry without wipe   | AUTO          | `erpAuthzRoadmap.test.ts` — blocked/read-only; soft-disable keeps rows                                                                            | BE      |
| 19  | Missing policy → deny              | AUTO          | `phase06Resolver` / `requirePermission` default deny; member CRM 403                                                                              | BE      |
| 20  | Existing auth regression green     | AUTO          | Full `@azes/api-server` Vitest suite (Phase 08 gate)                                                                                              | BE      |

## Privilege escalation audit

| Action                       | Audited? | Notes                                |
| ---------------------------- | -------- | ------------------------------------ |
| `user.access.update`         | YES      | `userAccess.ts`                      |
| `user.access.denied_ceiling` | YES      | Escalation attempt logged            |
| `role.menus.update`          | YES      | `menu.ts`                            |
| `org.modules.update`         | YES      | Phase 08 fill — `platformModules.ts` |
| CRM mutations                | YES      | `crmCustomers.ts`                    |
| Platform user create         | YES      | `platformUsers.ts`                   |

## MANUAL checklist (staging / pre-prod)

Owner: **UI** + **User**. Run once before production GO.

- [ ] Admin: login → nav only from `/me`; no hardcoded sidebar items
- [ ] Org switch → me/access refetch; previous org CRM IDs → 403
- [ ] Unassign role-menu in Role Menus UI → target user loses API within same session (refresh optional)
- [ ] Disable org CRM module as SuperAdmin → CRM page empty/forbidden; data still in DB
- [ ] Attempt grant beyond ceiling as orgAdmin → 403 + audit row (if audit UI available)

**Prod GO** checkbox lives on PHASE_08 / ACCEPTANCE (User).
