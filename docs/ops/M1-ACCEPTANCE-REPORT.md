<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/ops/M1-ACCEPTANCE-REPORT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-26
║ Updated: 2026-10-26
║ Purpose: TAGET M1 Tenant Core acceptance report (İcraçı)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# M1 — Tenant Core — qəbul hesabatı

**Status:** `COMPLETED` (PARTIAL — brauzer E2E / full build; local D1 `0006` applied 2026-10-26)

**Tarix:** 2026-10-26  
**Agent:** İcraçı

## DONE meyarları

| Meyar                         | Nəticə                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Təşkilat yaratmaq / idarə     | PASS — mövcud SuperAdmin CRUD + `GET /orgs/{id}` + profile patch                        |
| İlkin OrgAdmin dəvəti + qəbul | PASS — invite create + `POST /invitations/accept` (token hash, TTL, single-use)         |
| OrgAdmin üzv dəvəti           | PASS — `org.manage` + active org scope                                                  |
| Multi-org membership          | PASS — `organization_memberships` + `GET /me/organizations`                             |
| Server-side rollar            | PASS — membership role → `user_roles` sync on active switch                             |
| Active org API                | PASS — `POST /me/active-organization` → yeni token cütü                                 |
| Cross-org ID isolation        | PASS — `tenantMembership.test.ts` (403)                                                 |
| Tenant cache/UI ayrımı        | PARTIAL — switch `invalidateQueries` + yeni JWT; brauzer E2E yox                        |
| OpenAPI / Orval / `@azes/api` | PASS — OpenAPI **0.14.0**, `pnpm generate`                                              |
| Unit/integration testlər      | PASS — api-server **81** tests                                                          |
| Lint/typecheck/build          | PARTIAL — api typecheck PASS; admin typecheck PASS; full monorepo build/Coordinator yox |
| Qəbul hesabatı                | Bu fayl                                                                                 |

## Audit plan

`docs/ops/M1-AUDIT-PLAN.md`

## Əsas dəyişikliklər

### Backend

- Migration `0006_tenant_membership.sql` (+ journal)
- Schema: `organizationMemberships`, `organizationInvitations`
- `tenantRepository` / `tenantService` / `routes/tenant.ts`
- Auth: `setUserOrgId`, `setUserRoles`, `createUser`; `issueTokenPair` export
- OrgAdmin create → membership sync

### Contract

- OpenAPI 0.14 tenant paths + schemas; Orval regenerate; orgs facade type exports

### Admin UI

- PATHS: `/organizations`, `/organizations/:orgId`, `/users`
- Features: list/create, detail (members+invite), Users (active org), OrgSwitcher
- i18n en/az/ru

## Validation

```text
pnpm --filter @azes/api-server typecheck  → PASS
pnpm --filter @azes/api-server test       → 81 PASS
pnpm --filter @azes/admin typecheck       → PASS
pnpm --filter @azes/api generate          → PASS
```

## Backlog (M1 sonrası / qəbuldan sonra)

- Local/prod D1-ə `0006` migrate tətbiqi
- Invite e-poçt çatdırılması (indi token UI-da bir dəfə göstərilir)
- OrgAdmin UI role select (native select) + member revoke UI
- `generate:check` — `.git` lazımdır
- HttpOnly cookies / signed handoff (M0 backlog)

## STOP

M1 user qəbulu gözlənilir. **M2 Module Registry başlamır.**
