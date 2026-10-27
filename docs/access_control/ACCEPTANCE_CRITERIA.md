<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/ACCEPTANCE_CRITERIA.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Measurable acceptance criteria for access-control phases (Phase 08 mapped)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Acceptance Criteria — Access Control

Criteria are **measurable**. A phase is DONE only when its checklist items pass and the user
has had opportunity to review (STOP/GO).

Existing suites to extend (do not discard):  
`auth.test.ts`, `menuRoleRbac.test.ts`, `rbacOrg.test.ts`, `tenantMembership.test.ts`,
`tenantConsole.test.ts`, `erpAuthzRoadmap.test.ts`.

---

## Phase 00 — Audit (docs)

- [x] `docs/access_control/` package created
- [x] Audit matrix uses EXISTS/PARTIAL/MISSING/CONFLICT/UNKNOWN with file paths
- [x] No application/schema edits in this phase
- [x] Cross-links to TAGET / root architecture / ops WORKER without modifying them

## Phase 01 — Decisions

- [x] AC-D01…AC-D08 reviewed by user
- [x] Each blocking decision is `APPROVED` or `REJECTED` with chosen option
- [x] Phase docs updated to reflect approved choices
- [x] No code changes required for DONE

## Phase 02 — Auth & session

- [x] Unauthenticated protected routes → 401
- [x] Invalid/expired/wrong-signed JWT → 401
- [x] Refresh rotation + revoked reuse behavior still passes (`auth.test` / Phase 2E contract)
- [x] Logout revokes session; subsequent refresh fails
- [x] Claim hygiene matches AC-D05 (documented + tested)
- [x] XSS/CSRF token-storage risks documented (PHASE-2B note; storage ADR deferred)
- [x] Scoped api auth tests PASS

## Phase 03 — Tenant & membership

- [x] User without active membership cannot access org-owned resource → 403
- [x] Cross-tenant IDOR → 403
- [x] Active org switch only for memberships that exist and are active
- [x] `users.org_id` semantics documented as active pointer (not sole membership)
- [x] If AC-D02 A approved: unit CRUD + membership-to-unit tests; else explicit deferral note
- [x] `tenantMembership` / `rbacOrg` regression PASS

## Phase 04 — Modules & subscriptions

- [x] Unentitled module cannot be activated by orgAdmin → 403
- [x] Disabled org module: related nav hidden and protected APIs denied
- [x] Disable module does not delete business rows
- [x] Blocked subscription behavior matches approved AC-D08 policy
- [x] `erpAuthzRoadmap` / module route tests extended and PASS

## Phase 05 — Roles, permissions, scope

- [x] Role unassign → live deny within documented window (existing menuRoleRbac pattern)
- [x] User overrides appear in effective permissions (closes PARTIAL gap)
- [x] Admin cannot grant beyond delegation ceiling
- [x] SuperAdmin not assignable via ordinary role UI / APIs
- [x] Read-only profile cannot create/update/delete/approve without explicit perms
- [x] `own` scope hides other owners' CRM rows; `subtree` behavior matches approved unit model
- [x] LMS role cannot silently receive ERP `org.manage_all`

## Phase 06 — Effective Access Resolver

- [x] Single resolver used by `requirePermission` and `/me` bootstrap
- [x] Formula layers tested: membership ∩ entitlement ∩ role/override ∩ scope
- [x] Default deny on missing policy
- [x] Menu in nav does **not** authorize unrelated mutation
- [x] `accessVersion` (or equivalent) present if AC-D04 A; clients can invalidate
- [x] OpenAPI + Orval in sync; no hand-edited generated files
- [x] Resolver mode rollback documented

## Phase 07 — Admin UI

- [x] Nav rendered only from backend me/access payload
- [x] Org switch invalidates access queries
- [x] Role-menus / user-access / platform-roles / orgs UIs call real APIs only
- [x] Forbidden / empty / error / loading states covered
- [x] i18n en+az+ru for new strings
- [x] No new design system; `@azes/ui-web` only
- [x] Scoped admin typecheck/tests PASS

## Phase 08 — Security & acceptance

- [x] Full checklist from target §17-style cases mapped to automated or manual tests ([SECURITY_MATRIX.md](./SECURITY_MATRIX.md))
- [x] Privilege escalation attempts audited where required (ceiling deny + modules update)
- [x] Dead parallel authz paths removed or dated deprecation (legacy mode + JWT `permissions[]` → 2026-12-31)
- [x] Coordinator full gates when user requests release readiness
- [x] Migration notes + residual limitations written ([RESIDUAL_LIMITATIONS.md](./RESIDUAL_LIMITATIONS.md))
- [ ] User GO for production apply

---

## Cross-cutting security cases (map into phases 02–08)

1. Unauthenticated → reject
2. Bad token → reject
3. Disabled user → reject
4. No membership → reject
5. Cross-tenant → reject
6. Unentitled module → reject
7. Disabled module APIs → reject
8. Org admin menus ⊆ entitled modules
9. Normal user menus ⊆ assignments
10. Menu ≠ action authz
11. Read-only cannot mutate
12. Branch/unit isolation (when units exist)
13. Delegation ceiling
14. Revocation window
15. Org switch safety
16. Concurrent refresh/logout
17. SuperAdmin not ordinary-assignable
18. Subscription expiry policy without data wipe
19. Missing policy → deny
20. Existing auth regression green

---

## Regression bar

Before any phase COMPLETE:

```text
pnpm --filter @azes/api-server test   # or apps/api package name as in repo
# plus touched admin filters when UI phase
```

Exact package filter names must be taken from workspace `package.json` at implementation time
(do not invent). Full monorepo build = Coordinator only.
