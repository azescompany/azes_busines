<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/ops/M1-AUDIT-PLAN.md
║ Author: AZES_COMPANY
║ Created: 2026-10-26
║ Updated: 2026-10-26
║ Purpose: M1.1 audit + Tenant Core adaptation plan (TAGET)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# M1.1 — Tenant Core audit və plan

## Mövcud vəziyyət (tapıntılar)

| Sahə | Vəziyyət |
| --- | --- |
| `organizations` | Var (`0003_org_rbac_track.sql`); CRUD SuperAdmin (`org.create` / `org.manage_all`) |
| `users.org_id` | Tək aktiv təşkilat pointeri; multi-membership yoxdur |
| Rollar | Global `user_roles` + `roles`; JWT `roles` + `orgId` |
| OrgAdmin | `POST /api/v1/org-admins` — user + `orgAdmin` rol + `org_id` (müvəqqəti parol) |
| Scope | `assertSameOrg` / `assertCanWriteTrack` — `users.org_id` üzərindən |
| Dəvət | Yox |
| Active org switch | Yox |
| Admin UI | Yalnız Home (M0); Orgs/Users yox |

**Qərar:** Parallel org modeli yaratmamaq. `organizations` + mövcud permission saxlanılır; üzərinə `organization_memberships` + `organization_invitations` əlavə olunur. `users.org_id` = **aktiv təşkilat**.

## Backend plan

1. Migration `0006_tenant_membership.sql` — memberships, invitations; mövcud `users.org_id` → membership backfill.
2. Membership role: `orgAdmin` \| `instructor` \| `student` (təşkilat səviyyəli).
3. Platform `superAdmin` yalnız `user_roles`-da qalır; aktiv org dəyişəndə non-platform rollar membership-dən sinxronlaşır.
4. Endpoint-lər:
   - `GET /api/v1/me/organizations`
   - `POST /api/v1/me/active-organization` → yeni token cütü
   - `GET /api/v1/orgs/{orgId}` (manage_all və ya üzv + manage)
   - `GET|PATCH` mövcud orgs siyahısı/patch (OrgAdmin öz org name)
   - `GET /api/v1/orgs/{orgId}/members`
   - `PATCH|DELETE` member role/status / revoke
   - `POST|GET /api/v1/orgs/{orgId}/invitations`
   - `POST /api/v1/invitations/accept` (public; token + password)
5. OrgAdmin create + invite accept → membership yazır.
6. Isolation testlər (`tenantMembership.test.ts`).

## Frontend plan

1. Admin PATHS: `/organizations`, `/organizations/:orgId`, `/users` (org members).
2. Org switcher — shell header; switch → token yenilə + Query invalidate.
3. Features: `organizations`, `orgMembers` (+ invite form); i18n en/az/ru.
4. Yalnız `@azes/api` (OpenAPI 0.14 + Orval).

## Out of scope (M1)

- HttpOnly cookie migration
- Signed handoff
- Module Registry / CRM
- Landing app
