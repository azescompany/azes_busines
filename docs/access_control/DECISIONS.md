<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/access_control/DECISIONS.md
║ Author: AZES_COMPANY
║ Created: 2026-10-27
║ Updated: 2026-10-27
║ Purpose: Locked architecture decisions for access control (Phase 01)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Access Control — Architecture Decisions

**Statuses:** `PROPOSED` | `APPROVED` | `REJECTED`  
**Phase 01 lock:** 2026-10-27 — user confirmed plan “Phase 01 — Qərarların kilidlənməsi”;
all AC-D01…AC-D08 locked as **option A** (recommended).

---

## AC-D01 — GeneralAdmin authority model

| Field          | Value                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID             | AC-D01                                                                                                                                                      |
| Status         | **APPROVED**                                                                                                                                                |
| Chosen option  | **A**                                                                                                                                                       |
| Problem        | Target defines GeneralAdmin; codebase has `superAdmin` + `org.manage_all` only.                                                                             |
| Facts          | No `GeneralAdmin` role string in `permissions.ts` / membership enums. Platform ops gated by `org.manage_all`, `org.create`, `modules.manage`, etc.          |
| Options        | **A)** Capability profile on existing platform roles (permissions only). **B)** New named global role `generalAdmin`. **C)** Collapse into SuperAdmin only. |
| Pros/Risks     | A: least churn, clear capability split. B: clearer UX, migration + seed risk. C: violates target separation of platform owner vs ops.                       |
| Recommendation | **A** — document GeneralAdmin as permission set; optional later rename. SuperAdmin remains non-assignable via ordinary role UI.                             |
| Decision       | GeneralAdmin = documented capability/permission set; **no** mandatory new global enum.                                                                      |
| Blocks         | Phase 05 role templates, Phase 07 platform admin UX labeling                                                                                                |

---

## AC-D02 — Organization Unit vs parentOrganizationId

| Field          | Value                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID             | AC-D02                                                                                                                                                                                        |
| Status         | **APPROVED**                                                                                                                                                                                  |
| Chosen option  | **A**                                                                                                                                                                                         |
| Problem        | Target needs branch/dept/team inside a tenant; current `parentOrganizationId` is org-to-org tree.                                                                                             |
| Facts          | M2.5 child orgs + `org_multi`; no `organization_units` table.                                                                                                                                 |
| Options        | **A)** Keep parent-org as holding/child tenants; add `organization_units` for in-tenant structure. **B)** Reuse child orgs as “branches”. **C)** Defer units; keep only `data_scope` own/org. |
| Pros/Risks     | A: clean semantics; more schema. B: confuses billing/tenant isolation. C: blocks true branch managers.                                                                                        |
| Recommendation | **A** — do not overload parent-org as units.                                                                                                                                                  |
| Decision       | `parentOrganizationId` remains tenant tree; **Organization Unit** is a separate in-tenant hierarchy.                                                                                          |
| Blocks         | Phase 03 unit work, Phase 05 scope, Phase 07 delegated admin UI                                                                                                                               |

---

## AC-D03 — Permission model (codes vs CRUD flags)

| Field          | Value                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| ID             | AC-D03                                                                                                                                   |
| Status         | **APPROVED**                                                                                                                             |
| Chosen option  | **A**                                                                                                                                    |
| Problem        | Parallel models: TS `Permission` union, `menu_permissions` codes, `user_menu_permissions` CRUD flags.                                    |
| Facts          | `effectiveCan` uses role→menu→codes + static map; user CRUD flags not in resolver.                                                       |
| Options        | **A)** Canonical string codes; map CRUD flags → `{resource}.{action}` on write/read. **B)** CRUD-only forever. **C)** Casbin/OPA engine. |
| Pros/Risks     | A: supports approve/post/refund; migration mapper needed. B: blocks business actions. C: heavy, out of monorepo norms.                   |
| Recommendation | **A** + explicit deny/restriction precedence; default deny.                                                                              |
| Decision       | Canonical string permission codes; CRUD flags are a UI/storage mapper only.                                                              |
| Blocks         | Phase 05–06 resolver; user-access enforcement                                                                                            |

---

## AC-D04 — Access bootstrap endpoint shape

| Field          | Value                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID             | AC-D04                                                                                                                                                       |
| Status         | **APPROVED**                                                                                                                                                 |
| Chosen option  | **A**                                                                                                                                                        |
| Problem        | Target shows `GET /me/access`; production bootstrap is `GET /me`.                                                                                            |
| Facts          | AdminShell + Query cache depend on `/me`; OpenAPI already exposes me.nav/permissions.                                                                        |
| Options        | **A)** Extend `/me` with modules, scope summary, `accessVersion`. **B)** Add `/me/access` and dual-fetch. **C)** Replace `/me` with `/me/access` (breaking). |
| Pros/Risks     | A: minimal client churn. B: clearer contract, two calls. C: breaks Account/Admin.                                                                            |
| Recommendation | **A** now; optional `/me/access` alias later if needed.                                                                                                      |
| Decision       | Extend `GET /api/v1/me`; do **not** require `/me/access` for Phase 06.                                                                                       |
| Blocks         | Phase 06 response contract, Phase 07 cache invalidation                                                                                                      |

---

## AC-D05 — JWT claims and permission freshness

| Field          | Value                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID             | AC-D05                                                                                                                                                                                     |
| Status         | **APPROVED**                                                                                                                                                                               |
| Chosen option  | **A**                                                                                                                                                                                      |
| Problem        | Optional large `permissions[]` in JWT vs live DB authz; cookie-readable access token.                                                                                                      |
| Facts          | TTL 900s; M1.6 live `effectiveCan` when menuRepo present; web adapter puts access in JS-readable cookie for Bearer.                                                                        |
| Options        | **A)** Keep identity claims; stop treating JWT permissions as authoritative; document XSS until storage ADR. **B)** Immediate HttpOnly-only + BFF. **C)** Embed full ACL in JWT.           |
| Pros/Risks     | A: matches current live authz. B: SSO handoff redesign. C: stale ACL risk.                                                                                                                 |
| Recommendation | **A**; storage hardening as separate security ADR later.                                                                                                                                   |
| Decision       | Token = identity + session context (`sub`/`sid`/`orgId`/`roles`); live server authz; JWT `permissions[]` not authoritative; cookie XSS documented, storage redesign out of Phase 02 scope. |
| Blocks         | Phase 02 token cleanup; Phase 08 security acceptance                                                                                                                                       |

---

## AC-D06 — Resolver location (no new package)

| Field          | Value                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ID             | AC-D06                                                                                                                       |
| Status         | **APPROVED**                                                                                                                 |
| Chosen option  | **A**                                                                                                                        |
| Problem        | Need one policy service without inventing `@azes/role_system`.                                                               |
| Facts          | Logic lives in `apps/api` (`effectiveAccess`, `permissions`, route asserts).                                                 |
| Options        | **A)** Centralize under `apps/api/src/access/*` evolving current helpers. **B)** New shared package. **C)** Leave scattered. |
| Pros/Risks     | A: aligned with plan. B: premature package. C: conflicts remain.                                                             |
| Recommendation | **A**                                                                                                                        |
| Decision       | Resolver lives in `apps/api` (evolve `effectiveAccess` → `access/*`); no new package.                                        |
| Blocks         | Phase 06                                                                                                                     |

---

## AC-D07 — LMS vs ERP role separation

| Field          | Value                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID             | AC-D07                                                                                                                                               |
| Status         | **APPROVED**                                                                                                                                         |
| Chosen option  | **A**                                                                                                                                                |
| Problem        | Membership enum mixes LMS and ERP (`instructor` vs `member`).                                                                                        |
| Facts          | Invitations still use LMS-oriented roles; ERP uses profiles/`member`.                                                                                |
| Options        | **A)** Keep shared users; split grant channels (LMS track vs ERP menus/perms). **B)** Separate identity systems. **C)** Force all into one ERP enum. |
| Pros/Risks     | A: pragmatic. B: costly. C: breaks Academy.                                                                                                          |
| Recommendation | **A** — document dual channels; stop auto-mapping LMS roles to ERP module admin.                                                                     |
| Decision       | Shared users; dual grant channels; LMS roles must not auto-grant ERP module admin.                                                                   |
| Blocks         | Phase 05 invitation/role assignment rules                                                                                                            |

---

## AC-D08 — Subscription lifecycle depth

| Field          | Value                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID             | AC-D08                                                                                                                                                      |
| Status         | **APPROVED**                                                                                                                                                |
| Chosen option  | **A**                                                                                                                                                       |
| Problem        | Target wants plans, grace, read-only; current is active/blocked + trial.                                                                                    |
| Facts          | M5.0-lite explicitly excluded billing/grace.                                                                                                                |
| Options        | **A)** Extend lite: blocked + trial + optional read-only flag before full plans. **B)** Full plans/plan_modules now. **C)** Stay blocked-only indefinitely. |
| Pros/Risks     | A: incremental. B: large Phase 04. C: blocks commercial product.                                                                                            |
| Recommendation | **A** for next implementation wave; full plans when product-ready.                                                                                          |
| Decision       | Subscription lite: active/blocked + trial + optional read-only; full plans deferred.                                                                        |
| Blocks         | Phase 04 depth                                                                                                                                              |

---

## Approval log

| ID     | User decision | Date       | Notes                 |
| ------ | ------------- | ---------- | --------------------- |
| AC-D01 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
| AC-D02 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
| AC-D03 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
| AC-D04 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
| AC-D05 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
| AC-D06 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
| AC-D07 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
| AC-D08 | APPROVED A    | 2026-10-27 | Phase 01 plan confirm |
