<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/ops/M0-LMS-INVENTORY.md
║ Author: AZES_COMPANY
║ Created: 2026-10-26
║ Updated: 2026-10-26
║ Purpose: M0.8 LMS leftover inventory — no delete; tenant independence
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# M0.8 — LMS inventory

Academy SPA silinib; API LMS surface hələ monorepo-dadır. M1 Tenant Core LMS-ə məcburi asılı olmamalıdır.

## Frontend

| Path                         | Status                   |
| ---------------------------- | ------------------------ |
| `apps/academy`               | **REMOVED** (2026-10-26) |
| `docs/academy`, `docs/menus` | **REMOVED**              |

## API route modules

| File                                  | Prefix / concern                                                    |
| ------------------------------------- | ------------------------------------------------------------------- |
| `apps/api/src/routes/lms.ts`          | `/api/v1/categories`, `/courses*`, enroll, lessons, progress, files |
| `apps/api/src/routes/lmsManage.ts`    | `/api/v1/manage/courses*`, modules, lessons, archive, files         |
| `apps/api/src/routes/lmsQuiz.ts`      | manage + student quizzes/assignments/attempts                       |
| `apps/api/src/routes/lmsDashboard.ts` | `/api/v1/me/*` dashboard/certs/bookmarks; manage analytics          |
| `apps/api/src/routes/org.ts`          | `/api/v1/orgs*`, tracks, org-admins (RBAC era)                      |

## Migrations

| Migration                 | Topic              |
| ------------------------- | ------------------ |
| `0002_lms_foundation.sql` | LMS core tables    |
| `0003_org_rbac_track.sql` | Org + RBAC + Track |
| `0004_lms_quiz.sql`       | Quiz               |
| `0005_lms_dashboard.sql`  | Dashboard/certs    |

## OpenAPI / client

- Spec: `packages/api/openapi/azes/openapi.yaml` (auth + LMS tags)
- Facade tags: `auth`, `courses`, `dashboard`, `manage`, `orgs`, `quizzes`

## Tenant risk notes

- Org tables from LMS era may overlap M1 naming — **audit before recreate** (`TAGET.MD` §4.2).
- Track/course permissions are LMS-specific; do not reuse as CRM permission model blindly.
- File/R2 LMS paths remain; unused by Admin Home shell today.

## Recommendation

Keep code until M1 org model is designed; then either adapt `org` tables or migrate/drop with explicit ADR. Do not silent-delete in M0.
