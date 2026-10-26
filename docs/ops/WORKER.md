<!--
ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
â AZES COMPANY
â File: docs/ops/WORKER.md
â Author: AZES_COMPANY
â Created: 2026-08-22
â Updated: 2026-10-20
â Purpose: Operational execution contract (phase roadmap + Academy İcraçı checkpoint)
â Layer: docs
ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-->

# WORKER.md â AZES Monorepo Execution Contract

This file is the single source of truth for how Cursor agents execute work in this
repository. Read it fully before making any change. Do not skip the approval protocol.

---

## 1. Project mission

AZES is a large-scale enterprise **frontend** monorepo (Turborepo + pnpm) that will host
multiple React, Next.js and React Native applications backed by shared platform packages
(design tokens, UI systems, generated API clients, state, auth, validation, i18n,
permissions, analytics, logging, feature flags).

The backend does **not** live here. The frontend consumes backend contracts through
OpenAPI/Swagger, generated with Orval.

Target applications:

- Web (React + TS, Vite): `account`, `admin`, `agent-platform`
- Web (React + TS, Next.js App Router): `realestate`, `agent-site`
- Web (Next.js, App Router): `realestate`
- Mobile (React Native, Expo): `mobile-account`, `mobile-agent`, `mobile-realestate`

---

## 2. Architecture principles

1. Shared, stable capabilities belong in `packages/`. Product-specific business logic
   belongs inside `apps/` and their `features/`.
2. `apps â apps` is forbidden. `apps â packages` is allowed.
3. Server state is owned by TanStack Query. Client/global state is owned by Redux Toolkit.
   API response data does not go into Redux without a documented reason.
4. Web UI (`ui-web`) and Native UI (`ui-native`) are separate packages. Both consume the
   shared `design-tokens` package. `design-tokens` must not depend on React.
5. Applications depend on `@azes/ui-web` / `@azes/ui-native`, never directly on third-party
   UI libraries.
6. Generated OpenAPI code is never hand-edited.
7. No premature abstraction. A feature moves to `packages/` only when multiple products
   genuinely need it.
8. Packages expose a controlled public API (package `exports`). No deep imports into
   another package's internals.
9. Every comment-supporting file carries the AZES header (see `.cursor/rules/comment-header.mdc`).
10. No framework-specific code leaks into universal/core packages (`utils`, `constants`, `types`).

Authoritative rule set: `.cursor/rules/*.mdc`. Full rationale: `docs/**`.

---

## 3. Status model

Each phase uses exactly one status:

- `PENDING` â not ready to start (prerequisites unmet or awaiting approval)
- `READY` â prerequisites met, awaiting user approval to start
- `IN_PROGRESS` â actively being implemented (only ONE phase at a time)
- `BLOCKED` â cannot proceed; reason recorded
- `COMPLETED` â all validation criteria passed and recorded

Rules:

- Only one phase may be `IN_PROGRESS`.
- A phase becomes `COMPLETED` only when its validation commands pass.
- The agent never silently advances to the next phase.

---

## 4. Mandatory phase approval protocol

```text
READ WORKER.md
      -> Understand current phase
      -> Inspect relevant files
      -> STOP
      -> ASK USER FOR APPROVAL
      -> Implement ONLY the approved phase
      -> Run validation
      -> Update WORKER.md
      -> Report result
      -> STOP
```

After completing a phase the agent MUST:

1. Update this file.
2. Mark completed tasks with `[x]`.
3. Record changed files.
4. Record validation results.
5. Record any issues discovered.
6. Record architectural decisions (link/create ADRs).
7. Set the next phase to `PENDING`/`READY`.
8. STOP and ask for approval before the next phase.

If an unrelated problem is found mid-phase: document it in "Backlog" below, do NOT fix it
silently, do NOT expand scope.

---

## 4a. Agent roster (Cursor)

**Iron law (language):** all agents speak to the user in **Azerbaijani only**
(`.cursor/rules/agent-role-gate.mdc`). Code paths / CLI names may stay as in the repo.

**Iron law (role):** if the user did not name a role, ask which of Memar / Dizayner / Worker /
Coordinator / İcraçı (and suggest from the command). Do **not** execute until they confirm
(`.cursor/rules/agent-role-gate.mdc`).

**Iron law (Coordinator / İcraçı terminal):** after the user assigns Coordinator or İcraçı
work, run in-monorepo terminal commands without re-asking permission. Paths **outside** the
monorepo require an explicit permission ask + explanation
(`.cursor/rules/coordinator-agent.mdc`, `.cursor/rules/icraciAgent.mdc`).

Chat names map to `.cursor/rules`. Start a chat with the agent name, then the task.

| Chat name             | Rule                                    | Owns                                                               | Must not                                            |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| **Agent Coordinator** | `coordinator-agent.mdc` (`alwaysApply`) | Full gates, git/deploy (batch); no re-ask in-repo                  | Feature/UI impl; out-of-repo without permission     |
| **Agent Memar**       | `memarAgent.mdc`                        | Plan-only; chat plan + Worker/Dizayner prompts (AZ)                | Any code/file write; build/git/deploy               |
| **Agent Dizayner**    | `uiDesignAgent.mdc`                     | tokens, ui-web; **responsive**; scoped `--filter`                  | Auth/API; desktop-only; full build; **git/deploy**  |
| **Agent Worker**      | `apiMenecerAgent.mdc`                   | Pages from **packages API+models**; i18n en/az/ru                  | Invent DTOs; no locales; full build; **git/deploy** |
| **Agent İcraçı**      | `icraciAgent.mdc`                       | Academy LMS via DELTA+CLAUDE/CHAT; full powers; `WORKER.md` resume | Invent scope; shell redesign; skip checkpoint       |

Flow: optional **Memar** → plan + 2 prompts in chat → user pastes to Worker/Dizayner → they
implement (+ scoped filters). User need **not** forward every Agent Report. On “son
dəyişiklikləri build/deploy et”, Coordinator runs **one batch**. Gate fail → report only.

**Academy LMS track:** **Agent İcraçı** reads §4b below, executes one step from
`CLAUDE_DELTA`/`CHAT_DELTA` (prioritet) + `CLAUDE.MD`/`CHAT.MD`, updates the checkpoint,
then STOP. Next session resumes from §4b.

Living snapshots: `docs/styles/CURRENT-STATE.md` (Dizayner), `docs/api/CURRENT-STATE.md` (Worker).

---

## 4b. Academy LMS (İcraçı Agent)

> **REMOVED (2026-10-26):** User request — `apps/academy`, `docs/academy`, `docs/menus`
> silindi. Köhnə monorepo baza kimi qalır; üzərində yeni məhsul/repo işləri üçün.
> LMS track dayandırılıb. `apps/api` LMS route-ları hələ ağacda ola bilər (ayrıca təmizlik).

| Field                 | Value                                                                 |
| --------------------- | --------------------------------------------------------------------- |
| Current step          | TAGET M1 Tenant Core                                                  |
| Status                | `COMPLETED` (PARTIAL — D1 migrate/E2E brauzer; no `.git`)              |
| Last completed        | M1 membership/invite/active-org + Admin UI (2026-10-26)               |
| Next action           | STOP — user M1 qəbulu; sonra M2 Module Registry                       |
| Decisions (CLAUDE §3) | N/A — sources silinib                                                 |
| M3–M8 status          | historical only (kod/docs silinib)                                    |

### Adaptasiya (haradayıq → yeni prompt)

| Keçmiş                            | Yeni                                                                  |
| --------------------------------- | --------------------------------------------------------------------- |
| M0–M2 tamam (köhnə `admin` staff) | Qalır; M1b-də retrofit (org_id, rollar, Track, permission)            |
| M3 READY idi                      | **COMPLETED** (2026-10-20)                                            |
| M4                                | **COMPLETED** (2026-10-20)                                            |
| M5                                | **COMPLETED** (2026-10-20)                                            |
| M6                                | **COMPLETED** (2026-10-20)                                            |
| M7                                | **COMPLETED** (2026-10-20)                                            |
| M8                                | **COMPLETED** (2026-10-20)                                            |
| Növbəti kod                       | **yox** — Academy LMS M0–M8 bitdi                                     |
| İcraçı oxu sırası                 | `docs/ops/WORKER` → DELTA → CLAUDE/CHAT → `docs/menus` → decisions.md |

### Log

- 2026-10-26 — **TAGET M1 (İcraçı)**: `M1-AUDIT-PLAN.md` + `M1-ACCEPTANCE-REPORT.md`;
  migration 0006 memberships/invites; tenant routes; OpenAPI 0.14 + Orval; Admin
  Orgs/Users/OrgSwitcher; api-server 81 tests PASS; admin typecheck PASS. STOP — M2 yox.
- 2026-10-26 — **TAGET M0 (İcraçı)**: audit `docs/ops/M0-AUDIT-REPORT.md` +
  `M0-LMS-INVENTORY.md`; handoff `issuedAt`+120s TTL; ports OK; api-server 74 tests PASS;
  generate:check BLOCKED (no git). STOP — M1 yox; user git/M0 təsdiqi.
- 2026-10-26 — **Admin L-shell Home (İcraçı)**: `AdminShell` + Home-only nav + `/:locale`
  router + i18n en/az/ru; settings/locale/account; no AI/catalog. Gates: admin typecheck/test.
- 2026-10-26 — **Admin shell :200 (İcraçı)**: `apps/admin` Vite React+TS; Account login
  → `#azes_auth` → Admin consume; unauth → Account `returnUrl`. Gates: admin typecheck/test.
- 2026-10-26 — **Academy REMOVED (İcraçı)**: `apps/academy`, `docs/academy`, `docs/menus`
  silindi. Git yox idi (user silib). Monorepo qalan app-lərlə run. Növbəti: yeni repo/app.
- 2026-10-20 — **OrgAdmin design_task (İcraçı, kod yox)**: `docs/menus/orgadmin/` —
  audit yeniləndi (`course.write` → InstructorDashboard; AzesTable courses;
  PATCH org yalnız manage_all); `DESIGN_PLAN.md` + 7 spek (17 bölmə) + README.
  P0: dashboard/müəllimlər/istifadəçilər/kurslar; P1: tracks/analytics; P2: settings.
  Yalnız docs. Növbəti: STOP / OrgAdmin P0 kod əmri.
- 2026-10-20 — **Instructor DESIGN_PLAN P0 (İcraçı)**: `course.write` dashboard branch
  (draft attention + KPI from courses/tracks/analytics); ManageCourses AzesTable +
  Chip + useAzesDialog archive/publish; ManageQuizzes AzesTable + publish confirm;
  i18n az/en/ru. Gates: academy typecheck. Növbəti: Instructor P1 / STOP.
- 2026-10-20 — **Bugfix tracks 400 (İcraçı)**: GET `/api/v1/tracks` without orgId
  failed for superAdmin (`orgId` null). API: `listAllTracks` when `org.manage_all`;
  FE ManageTracks/Assign pass JWT orgId; superAdmin org picker for create. Gates:
  rbacOrg + academy typecheck. Növbəti: STOP / digər əmr.
- 2026-10-20 — **Student DESIGN_PLAN P0 (İcraçı)**: LearnerDashboard hero continue +
  AzesSkeleton/EmptyState; MyLearning tabs + progress cards; LessonPlayer
  CurriculumNav split (curriculum+progress APIs); Quizzes take chrome +
  useAzesDialog submit confirm; i18n az/en/ru. Gates: academy typecheck PASS.
  Növbəti: Student P1 / STOP.
- 2026-10-20 — **SuperAdmin DESIGN_PLAN P0 (İcraçı)**: PATCH `/orgs/:id`; OrgAdmin
  CRUD API; platform-overview; OpenAPI 0.13 + Orval; Academy AzesTable orgs,
  `#/manage/org-admins`, superAdmin dashboard branch; i18n az/en/ru. Gates: rbacOrg
  10 PASS; academy typecheck + primaryNav PASS. Növbəti: P1 / STOP.
- 2026-10-20 — **Guest UX plan (İcraçı, kod yox)**: `guest/design_task.md` üzrə audit
  (Account LoginPage/handoff, CatalogView, guest `catalog.read`); `DESIGN_PLAN.md` +
  `login.md` + `ictimai-katalog.md` (19 bölmə); README. Yalnız `docs/menus/guest/**`
  (+ WORKER). Validation: n/a (docs). Növbəti: STOP / user.
- 2026-10-20 — **Instructor UX plan (İcraçı, kod yox)**: `instructor/design_task.md`
  üzrə audit (ManageTracks/Courses/Assign/Quizzes, Analytics, permissions, AzesTable);
  `DESIGN_PLAN.md` + 8 səhifə speki (19 bölmə); README status. Yalnız
  `docs/menus/instructor/**` (+ WORKER). Validation: n/a (docs). Növbəti: STOP / user.
- 2026-10-20 — **Student UX plan (İcraçı, kod yox)**: `student/design_task.md` üzrə
  audit (Dashboard/Catalog/Learn/Player/Quizzes/Certs/Notifications, AzesTable, `/me/*`);
  `DESIGN_PLAN.md` + 10 səhifə speki (16 bölmə); README status. Yalnız
  `docs/menus/student/**` (+ WORKER). Validation: n/a (docs). Növbəti: STOP / user.
- 2026-10-20 — **OrgAdmin UX plan (İcraçı, kod yox)**: `orgadmin/design_task.md` üzrə
  audit; `DESIGN_PLAN.md` + 7 səhifə speki (17 bölmə); README status. Yalnız
  `docs/menus/orgadmin/**`. Validation: n/a (docs). Növbəti: STOP / user.
- 2026-10-20 — **SuperAdmin UX plan (İcraçı, kod yox)**: `design_task.md` üzrə audit
  (AzesTable API, ManageOrgs minimal, nav/API boşluqlar); `DESIGN_PLAN.md` + 8 səhifə
  speki genişləndirildi; `superadmin/README` status cədvəli. Validation: n/a (docs).
  Paths: `docs/menus/superadmin/**`, `docs/menus/README.md`. Növbəti: STOP / user.
- 2026-10-20 — **Docs reorg (İcraçı, kod yox)**: root Academy/ops MD-lər `docs/` altına
  köçürüldü (`academy/roadmap|chat|ops|audit`, `ops/WORKER.md`, `agents/`, `monorepo/`);
  `.cursor/rules` yolları yeniləndi; `docs/menus/{superadmin,orgadmin,instructor,student,guest}`
  rol menyu speksləri (41 fayl). Validation: n/a (docs). Növbəti: STOP / user əmri.
- 2026-10-20 — **Mərhələ 8 COMPLETED**: quiz-submit (30/10m) + file-upload (20/15m) rate
  limits; `lmsE2e.test.ts` (enroll→lesson→quiz→cert→verify); `docs/academy/RELEASE-HARDENING.md`
  (smoke/a11y/perf/migration/rollback/CF staging checklist); README link.
  Tests: **69 PASS** (`lmsE2e` 1, `rateLimit` 6); typecheck PASS. Növbəti: STOP.
- 2026-10-20 — **Mərhələ 7 COMPLETED**: migration `0005_lms_dashboard`; `/me/dashboard`
  (real stats); notifications read/unread; bookmarks; certificate issue (100% required
  lessons + quiz pass, idempotent) + public verify; manage analytics (scoped);
  OpenAPI v0.11 + Orval `dashboard`; Academy `#/` dashboard, `#/notifications`,
  `#/certificates`, `#/manage/analytics`; i18n az/en/ru. Tests: 66 PASS
  (`lmsDashboard` 3); typecheck PASS; local D1 `0005` apply ✅.
  Paths: `apps/api/src/lms/dashboardService`, `routes/lmsDashboard`,
  `apps/academy/src/features/dashboard`. Növbəti: M8.
- 2026-10-20 — **Mərhələ 6 COMPLETED**: migration `0004_lms_quiz`; quiz CRUD + questions;
  start/submit attempt (server timer, maxAttempts→409, idempotency, correct answers gizlidir
  take/start-də); gradeAnswers; assignments submit + instructor grade; OpenAPI `azes` v0.10
  - Orval `quizzes`/`manage`; Academy `#/quizzes` + `#/manage/quizzes`; i18n az/en/ru.
    Tests: api-server 63 PASS (`lmsQuiz` 4); academy + api typecheck PASS.
    Paths: `apps/api/src/lms/quizService|quizTypes`, `routes/lmsQuiz`, `drizzle/0004_*`,
    `apps/academy/src/features/{quizzes,manage-quizzes}`. Local D1: migration apply lazımdır.
    Növbəti: M7.
- 2026-10-20 — **Mərhələ 5 COMPLETED**: modul/dərs ↑↓ reorder (full id list); soft-archive
  lesson/module/course (`hadProgress` flag; hard-delete yox); preview → LessonPlayerView
  (staff); OpenAPI `azes` v0.9 + Orval manage; `#/manage/courses` UI + i18n az/en/ru.
  Tests: api-server 59 PASS (`lmsManage` reorder/archive); academy typecheck PASS.
  Paths: `apps/api/src/lms/mutations`, `routes/lmsManage`, `test/lmsManage.test.ts`,
  `packages/api/openapi/azes`, `apps/academy/src/features/manage-courses`. Növbəti: M6.
- 2026-10-20 — **Mərhələ 4 COMPLETED**: lesson detail + idempotent complete; course/me
  learning progress; HMAC signed file URLs; OpenAPI v0.8 + Orval; Academy `#/learn` +
  player `#/learn/courses/:id/lessons/:id`; i18n az/en/ru. Tests: api-server 58 PASS;
  academy typecheck PASS. Paths: `apps/api/src/lms/{progress,signedUrl}`, `routes/lms`,
  `apps/academy/src/features/learn`. Növbəti: M5.
- 2026-10-20 — **Hotfix (2)**: facade artıq `*MutationOptions` re-export etmir;
  Account login → `@azes/api/azes/auth` (courses barrel yox); Orval vite-generics
  postprocess; account/academy `.vite` clear. M4 hələ icazə gözləyir.
- 2026-10-20 — **Hotfix**: Academy Vite stale Orval named-export
  (`getPostApiV1CoursesCourseIdEnrollMutationOptions`); `optimizeDeps.exclude @azes/api` +
  `.vite` cache clear. M4 hələ icazə gözləyir.
- 2026-10-20 — **Dev seed (rol userləri)**: `seed:role-users` → local D1:
  `sa.demo` / `oa.demo` / `instructor.demo` / `student.demo` (parol `LocalDevPass123!`);
  `guest` loginless. M4 başlamadı — user icazəsi gözlənilir. Path:
  `apps/api/scripts/seed-role-users.mjs`.
- 2026-10-20 — **Mərhələ 3 COMPLETED**: Track-aware `GET /courses` + idempotent enroll;
  OpenAPI v0.7 + Orval `postApiV1CoursesCourseIdEnroll`; Academy `#/catalog` (+ slug detail),
  `#/my-programs`; search/filter/pagination; i18n az/en/ru. Tests: api-server 53 PASS;
  academy typecheck PASS. Paths: `apps/api/src/routes/lms`, `lms/mutations`,
  `apps/academy/src/features/catalog`, `navigation/primaryNav`, `AcademyShell`. Növbəti: M4.
- 2026-10-20 — **Mərhələ 2.5 COMPLETED**: permission-filtered nav; `#/manage/orgs|tracks|assign`
  - courses; `useAcademyMe` permissions/orgId; OpenAPI assign endpoints; i18n az/en/ru.
    Academy typecheck PASS. Paths: `apps/academy/src/features/manage-{orgs,tracks}`,
    `navigation/primaryNav`, `app/AcademyShell`. Növbəti: M3 kataloq.
- 2026-10-20 — **Mərhələ 1b COMPLETED**: migration `0003_org_rbac_track`; permissions + scope;
  JWT/`GET /me` (`role`, `orgId`, `permissions`); org/track APIs; manage authz retrofit;
  OpenAPI v0.6 + Orval; seed Track; tests 50 PASS. Paths: `apps/api/src/auth/permissions|scope`,
  `org/*`, `routes/org`, `drizzle/migrations/0003_*`, `packages/api/openapi/azes`. Növbəti: M2.5 UI.
- 2026-10-20 — **DELTA adaptasiya (docs, kod yox)**: `CLAUDE_DELTA`/`CHAT_DELTA` prioritet
  rules-ə (`icraciAgent`, role-gate, `my_cursor_gents`); `CLAUDE.MD`/`CHAT.MD` delta merge;
  `docs/academy/RBAC-ORG-TRACK-DECISIONS.md` (CHAT_DELTA §9); M3 PAUSED; növbəti M1b təsdiq.
- 2026-10-20 — **Mərhələ 2 COMPLETED**: manage write APIs (create/patch/module/lesson/publish +
  R2 `POST /api/v1/manage/files`); sanitize + mime/size validation; OpenAPI v0.5 + Orval
  `manage`; Academy `#/manage/courses` + primaryNav (instructor/admin); i18n az/en/ru.
  Tests: `lmsManage` 6 PASS; academy typecheck PASS. Paths: `apps/api/src/routes/lmsManage`,
  `lms/mutations|files|sanitize`, `apps/academy/src/features/manage-courses`,
  `packages/api/openapi/azes` + `generated/azes/manage`. (M3 əvvəl planlaşdırılırdı — indi PAUSED.)
- 2026-10-20 — **Mərhələ 1 COMPLETED**: LMS D1 migration `0002_lms_foundation`; read APIs +
  authz (401/403); OpenAPI/Orval `courses`; tests 38 PASS; local seed `seed:lms`. Paths:
  `apps/api/src/lms|routes/lms|db/schema`, `packages/api/openapi/azes`, `generated/azes/courses`.
  UI yox. Növbəti: Mərhələ 2.
- 2026-10-20 — **Mərhələ 0 Audit COMPLETED** (kod dəyişmədi). Shell var, LMS route/menyu/feature yox;
  API yalnız auth/health; CHAT menyu planı ↔ stub `/` uyğunlaşdırma təklifi chatdə. Növbəti:
  user təsdiqi (§3 + menyu xəritəsi) → Mərhələ 1. Paths: `apps/academy/**` (oxu), `apps/api` auth,
  `packages/api/openapi/azes`.
- 2026-10-20 — İcraçı Agent governance: `icraciAgent.mdc` + role gate + this checkpoint created. LMS icrası hələ başlamayıb (`READY` @ Mərhələ 0).

---

## 5. Current status

- Active phase: none (`IN_PROGRESS` count = 0).
- Completed: **Phase 0â12** (`COMPLETED`), including **Phase 12 â Full Architecture Verification**.
- Completed on branch `dev`: **MUI web design-system migration** (ADR-009). Product Vite apps and
  `realestate` use `AzesThemeProvider`. Showcase app: `apps/azes-ui`. Native UI is unchanged.
- Governance (2026-10-11): **Agent roster** — Coordinator / Memar / Dizayner / Worker
  (`coordinator-agent.mdc`, `memarAgent.mdc`, `uiDesignAgent.mdc`, `apiMenecerAgent.mdc`).
  Memar = Plan-only dual prompts; build/git/deploy = Coordinator only.
- Governance (2026-10-20): **Agent İcraçı** — `icraciAgent.mdc`; Academy LMS via root
  `CLAUDE_DELTA`/`CHAT_DELTA` (prioritet) + `CLAUDE.MD`/`CHAT.MD`; resume §4b; combined
  Memar/Dizayner/Worker/Coordinator powers; in-monorepo terminal without re-ask.
- Governance (approved ad-hoc, 2026-10-09): **API Manager Agent** (now **Agent Worker**) —
  `.cursor/rules/apiMenecerAgent.mdc` + `docs/api/CURRENT-STATE.md` (mirrors UI Design Agent).
- Governance (2026-10-10): **page-architecture** — thin `pages/` + `features/`, RHF+zod,
  Query service layer; Users + Ads migrated; ADR-018; `apps/admin/eslint.config.js` boundaries.
- Ad-hoc (2026-10-10): Admin **User ads** (`#/user-announcement`, `POST /ad/users/table`) —
  `pages/user-ads` + `features/user-ads`; tests 6 PASS; typecheck PASS.
- Ad-hoc (2026-10-11): Admin **Sold items** (`/sold-item`, `POST /ad/users/sold/table`) —
  `pages/sold-item` + `features/sold-items`; read-only table + filters.
- Ad-hoc (2026-10-11): Admin **Menus** (/menus, GET/POST /menus + PUT/DELETE /menus/{id}) —
  pages/menus + eatures/menus; table CRUD (backend enforces SuperAdmin).
- Ad-hoc (2026-10-11): Admin **Plans** (/plans, GET/POST /adminplan/plans + PUT/DELETE /adminplan/plans/{id}) —
  pages/plans + eatures/plans; table CRUD.
- Ad-hoc (2026-10-10): Admin **React Router data mode** — `app/router/` replaces
  hash router; `react-router@7.18.4`; ADR-019 + `docs/architecture/routing.md`.
- Next phase: **none approved**. A planning-only proposal exists at
  `docs/roadmap/phase-13-proposal.md` (**PROPOSAL ONLY â NOT STARTED**).
  Do not set Phase 13 to `IN_PROGRESS` / `COMPLETED` until the user explicitly approves a
  phase definition into this file. The auth proposal was not part of the MUI migration.
- Styles track v1 (branch `styles`, see `docs/styles/legacy/ROADMAP.md`): **Styles Phases 0â15 COMPLETED**.
  Cross-app verification: `docs/styles/legacy/CROSS-APP.md`. Phase 15: twelve-color brand palette.
- UI Platform track (branch `styles`, see `docs/styles/17-migration.md` and Â§7 "UI Platform
  track" below): **Phases 0â8 and 10â14 COMPLETED**. Phase 9 (RTL Emotion cache) is
  **BLOCKED** pending the owner decision on RTL locales. Merging `styles` into `dev` is a
  separate approval.

---

## 6. Global validation commands (target)

These commands are the quality gates. They become runnable as phases add config.
For ad-hoc agent work, **Agent Coordinator** runs them after Dizayner/Worker reports;
Dizayner/Worker must not execute heavy gates (see §4a).

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
pnpm architecture:verify
pnpm api:generate   # regenerate OpenAPI client (from Phase 6)
```

A phase is complete only when its declared subset of these gates passes.

---

## 7. Phase roadmap

Legend: each phase lists Objective, Prerequisites, Tasks, Changes (files/dirs expected to
change), Must NOT change, Validation, Success criteria, Rollback, Checklist.

---

### Phase 0 â Repository Audit & Architecture (Status: COMPLETED)

- Objective: Inspect the repo, decide the architecture, and produce the full blueprint
  (`docs/**`, `WORKER.md`, `.cursor/rules/**`). No implementation code.
- Prerequisites: none.
- Tasks:
  - [x] Full repository audit (greenfield confirmed; only `strukture.md` present).
  - [x] Decide stack and record ADRs.
  - [x] Author `docs/**` architecture blueprint.
  - [x] Author `.cursor/rules/**` (11 `.mdc` files).
  - [x] Author this `WORKER.md`.
- Changes: `docs/**`, `WORKER.md`, `.cursor/rules/**`.
- Must NOT change: nothing else (no `apps/`, `packages/`, `tooling/`, no deps).
- Validation: docs present; 11 Cursor rules present; no implementation code created.
- Success criteria: blueprint complete; governance rules present; roadmap ready for approval.
- Rollback: delete created docs/rules.
- Checklist:
  - [x] Audit documented
  - [x] Blueprint documented
  - [x] `.cursor/rules/*.mdc` created (11 files)
  - [x] No implementation code written
- Changed files (governance completion):
  - `.cursor/rules/architecture.mdc`
  - `.cursor/rules/dependency-boundaries.mdc`
  - `.cursor/rules/coding-standards.mdc`
  - `.cursor/rules/comment-header.mdc`
  - `.cursor/rules/apps.mdc`
  - `.cursor/rules/packages.mdc`
  - `.cursor/rules/api-generation.mdc`
  - `.cursor/rules/state-management.mdc`
  - `.cursor/rules/ui-system.mdc`
  - `.cursor/rules/testing.mdc`
  - `.cursor/rules/worker-process.mdc`

---

### Phase 1 â Monorepo Foundation (Status: COMPLETED)

- Objective: Establish the workspace skeleton so packages/apps can be added incrementally.
- Prerequisites: Phase 0 approved.
- Tasks:
  - [x] `git init`, add `.gitignore`, `.gitattributes`, `.editorconfig`.
  - [x] Root `package.json` (private, packageManager pinned to pnpm), `pnpm-workspace.yaml`
        (`apps/*`, `packages/*`, `tooling/*`).
  - [x] `turbo.json` with tasks (`build`, `dev`, `lint`, `typecheck`, `test`, `format`).
  - [x] Root `tsconfig.json` base + path/project references strategy (documented in `tsconfig.md`).
  - [x] `.nvmrc` / engines; root `README.md`.
  - [x] Supporting foundation: `.npmrc` (engine-strict / peers), `tsconfig.md` (JSON header sibling).
- Changes: root config files, `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, `.npmrc`,
  `pnpm-workspace.yaml`, `turbo.json`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`,
  `tsconfig.md`, `README.md`, git repository initialized.
- Must NOT change: `docs/**`, `.cursor/rules/**` (except status update here) â respected.
- Validation:
  - [x] `pnpm install` succeeded (turbo 2.10.11, typescript 5.9.3).
  - [x] `pnpm exec turbo run build --dry` resolved (0 packages in scope â expected).
  - [x] `pnpm exec turbo run lint typecheck test format --dry` resolved (0 packages â expected).
  - Note: root `tsc` reports no inputs until packages exist â documented, not a Phase 1 failure.
- Success criteria: empty workspace installs and Turbo recognizes the (empty) graph â **met**.
- Rollback: remove root config; repo returns to docs-only.
- Checklist:
  - [x] Workspace installs
  - [x] Turbo graph resolves
  - [x] WORKER.md updated
- Changed / created files:
  - `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, `.npmrc`
  - `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`
  - `turbo.json`, `tsconfig.json`, `tsconfig.md`, `README.md`
  - `.git/` (initialized, no commit created)
- Deviations:
  - Added `.npmrc` (engine-strict, auto-install-peers) â monorepo foundation quality; not in
    original checkbox list but aligned with ADR-001 / engines.
  - Added `tsconfig.md` sibling for JSON header policy compliance.
  - Turbo config uses `tasks` (Turbo 2) rather than legacy `pipeline` key.
- Issues / blockers: none.

---

### Phase 2 â Tooling & Cursor Governance (Status: COMPLETED)

- Objective: Shared tooling configs and quality gates.
- Prerequisites: Phase 1 completed.
- Tasks:
  - [x] `tooling/typescript` (base/react/next/native/node tsconfigs) as `@azes/typescript-config`.
  - [x] `tooling/eslint` (flat config; boundaries; react/next/native presets) as `@azes/eslint-config`.
  - [x] `tooling/prettier` (shared config) as `@azes/prettier-config`.
  - [x] `tooling/vitest` (shared preset) as `@azes/vitest-config`.
  - [x] Husky + lint-staged; pre-commit hook.
  - [x] CI workflow (format, lint+boundaries, typecheck, test, build).
- Changes: `tooling/**`, `.husky/**`, `.github/workflows/**`, root scripts/configs;
  Prettier reformatted existing docs for gate compliance.
- Must NOT change: `apps/**`, `packages/**` source â none created (respected). No Phase 3+ packages.
- Validation:
  - [x] `pnpm format:check` â pass
  - [x] `pnpm lint` (eslint + turbo) â pass; boundary rules active in base config
  - [x] `pnpm typecheck` â pass (0 package scripts; tooling packages are config-only)
  - [x] `pnpm test` â pass (0 package scripts; expected)
  - [x] `pnpm build` â pass (0 package scripts; expected)
  - [x] Husky present (`.husky/_`, `.husky/pre-commit`)
  - Note: GitHub Actions CI not executed remotely in this environment; workflow file is present
    and mirrors local gates (`ci.yml`).
- Success criteria: gates executable repo-wide; boundary lint active â **met**.
- Rollback: remove `tooling/**` + hooks + CI.
- Checklist:
  - [x] configs added
  - [x] hooks active
  - [x] CI workflow authored (local gates green; remote CI pending first push)
  - [x] WORKER.md updated
- Created / key files:
  - `tooling/typescript/**` (`@azes/typescript-config`)
  - `tooling/eslint/**` (`@azes/eslint-config`)
  - `tooling/prettier/**` (`@azes/prettier-config`)
  - `tooling/vitest/**` (`@azes/vitest-config`)
  - `eslint.config.js`, `prettier.config.js`, `.prettierignore`
  - `.husky/pre-commit`, `.github/workflows/ci.yml`
- Dependencies added (root + eslint tooling): eslint, prettier, typescript-eslint, husky,
  lint-staged, vitest, eslint-plugin-boundaries, eslint-plugin-react, eslint-plugin-react-hooks,
  eslint-config-prettier, @eslint/js, globals; workspace links to `@azes/*` tooling packages.
- Deviations:
  - Root `package.json` sets `"type": "module"` for ESM config loading.
  - Root `lint` runs `eslint .` then `turbo run lint` (repo-wide gate + future package scripts).
  - Tooling packages intentionally omit build/lint/test scripts (config-only); Turbo reports
    "No tasks were executed" for those â expected.
  - Next/Expo-specific ESLint plugins deferred until apps install those frameworks (presets
    documented to compose later).
- Issues / blockers: none.

---

### Phase 3 â Design Tokens (Status: COMPLETED)

- Objective: `packages/design-tokens` â framework-agnostic design language.
- Prerequisites: Phase 2 completed.
- Tasks:
  - [x] Define primitive tokens: colors, typography, font sizes/weights, spacing, radius,
        shadow/elevation, breakpoints, z-index, motion/durations, sizing.
  - [x] Define semantic colors + light/dark theme foundations.
  - [x] Expose TS/JS token objects (web + native consumable) and CSS custom-property helpers.
  - [x] Package build, typecheck, unit tests; no React dependency.
- Changes: `packages/design-tokens/**` only (plus WORKER.md status).
- Must NOT change: apps; other packages â respected. No UI/React providers.
- Validation:
  - [x] `pnpm --filter @azes/design-tokens build` â pass
  - [x] `pnpm --filter @azes/design-tokens typecheck` â pass
  - [x] `pnpm --filter @azes/design-tokens test` â 5/5 pass
  - [x] Public exports resolve (`@azes/design-tokens`, `/css`)
  - [x] `pnpm format:check` / `lint` / `typecheck` / `test` / `build` â pass
  - [x] No React/RN/Next/Expo in package dependencies
- Success criteria: tokens importable by web/next/native; no React in deps â **met**.
- Rollback: remove `packages/design-tokens`.
- Checklist:
  - [x] tokens defined
  - [x] outputs build
  - [x] no react dep
  - [x] WORKER.md updated
- Created:
  - `packages/design-tokens/` (`@azes/design-tokens`) with primitives, semantic, themes, css helpers,
    tests, README
- Dependencies added (package): typescript, vitest, `@azes/typescript-config`,
  `@azes/vitest-config` (dev only). Runtime deps: none.
- Decisions:
  - Source of truth is hand-authored TS (Style Dictionary deferred per ADR-008).
  - CSS emitted via helpers (`themeToCss` / `toCssVariables`), not a separate codegen pipeline.
  - Dual spacing/radius/size values (`rem` + `*Px`) for web vs native StyleSheet.
  - No component-level tokens in Phase 3.
- Deviations: none material.
- Issues / blockers: none.

---

### Phase 4 â Web UI Foundation (Status: COMPLETED)

- Objective: `packages/ui-web` â AZES web design system over headless primitives.
- Prerequisites: Phase 3 completed.
- Tasks:
  - [x] Radix-style primitive strategy (`@radix-ui/react-slot` for Button `asChild`).
  - [x] Starter set: `ThemeProvider`, `Box`, `Stack`, `Text`, `Button`.
  - [x] Theme provider consuming `@azes/design-tokens` CSS variables.
  - [x] Public `exports` map (`@azes/ui-web`, `@azes/ui-web/styles.css`).
  - [x] Vitest + Testing Library (jsdom) setup and component tests.
- Changes: `packages/ui-web/**` only (+ WORKER.md).
- Must NOT change: api/state/auth/business â respected. No ui-native.
- Validation:
  - [x] package build / typecheck / test (7/7)
  - [x] `pnpm format:check` / `lint` / `typecheck` / `test` / `build` â pass
  - [x] Public imports resolve: ThemeProvider, Box, Stack, Text, Button
  - [x] Depends on design-tokens + Slot only; no api/state/auth
- Success criteria: apps can import `@azes/ui-web`; no third-party UI leaks to apps â **met**.
- Rollback: remove `packages/ui-web`.
- Checklist:
  - [x] primitives wired
  - [x] tokens consumed
  - [x] tests pass
  - [x] WORKER.md updated
- Dependencies: `@azes/design-tokens`, `@radix-ui/react-slot`; peers `react`/`react-dom`;
  dev Testing Library + jsdom + React types.
- Decisions: CSS variables via ThemeProvider + `styles.css` (not Tailwind/MUI); only Slot from
  Radix for Phase 4 starter set; component catalog intentionally small.
- Deviations: none material.
- Issues / blockers: none.

---

### Phase 5 â Native UI Foundation (Status: COMPLETED)

- Objective: `packages/ui-native` â AZES RN design system over RN primitives.
- Prerequisites: Phase 3 completed (independent of Phase 4).
- Tasks:
  - [x] RN primitive components: `ThemeProvider`/`useTheme`, `Box`, `Stack`, `Text`, `Button`.
  - [x] Token-driven StyleSheet values via `@azes/design-tokens` (`spacingPx`, theme colors, etc.).
  - [x] Public exports map (`@azes/ui-native` only).
  - [x] Component tests (react-test-renderer + Flow-free RN mock for Vitest).
- Changes: `packages/ui-native/**` (+ WORKER.md). Did not modify ui-web/api/apps.
- Must NOT change: web UI; api; business domains â respected. No ui-web dependency.
- Validation:
  - [x] package build / typecheck / lint / test (10/10)
  - [x] `pnpm format:check` / `lint` / `typecheck` / `test` / `build` â pass
  - [x] dist public entry emits (`dist/index.js`, `dist/index.d.ts`)
  - [x] Depends on design-tokens + react/react-native peers only
- Success criteria: mobile apps can import `@azes/ui-native` â **met** (Metro/RN runtime).
- Rollback: remove `packages/ui-native`.
- Checklist:
  - [x] RN primitives
  - [x] tokens consumed
  - [x] tests pass
  - [x] WORKER.md updated
- Dependencies: `@azes/design-tokens`; peers `react`, `react-native`;
  dev `react-test-renderer`, typescript, vitest. No `@azes/ui-web`.
- Decisions: mirror Phase 4 starter set; StyleSheet/token JS values (not CSS variables);
  Vitest uses RN mock because raw `react-native` ships Flow (`import typeof`) incompatible with
  Node/Vitest; full RNTL deferred until Expo apps (Phase 10) provide Metro test env.
- Deviations: tests use react-test-renderer + mock instead of `@testing-library/react-native`
  (Flow/Node incompatibility). Documented; behavior coverage retained.
- Issues / blockers: none.

---

### Phase 6 â API / OpenAPI / Orval + TanStack Query (Status: COMPLETED)

- Objective: `packages/api` â generated client + query layer.
- Prerequisites: Phase 2 completed.
- Tasks:
  - [x] OpenAPI source strategy (committed placeholder until real backend contract exists).
  - [x] `orval.config.ts` â `generated/` + custom mutator.
  - [x] Hand-written `client/` (mutator, auth-token getter, `AzesApiError`).
  - [x] `config/` (base URL, query defaults), `query/keys`, `mutations/invalidate`.
  - [x] `pnpm api:generate` + `pnpm api:generate:check` (CI drift).
- Changes: `packages/api/**`, root scripts, CI workflow, eslint/prettier ignores for generated.
- Must NOT change: generated files by hand; app source â respected.
- Validation:
  - [x] `pnpm api:generate` / `api:generate:check` â pass
  - [x] package build / typecheck / lint / test (4/4)
  - [x] repo `format:check` / `lint` / `typecheck` / `test` / `build` â pass
  - [x] Public imports resolve for hand-written surface
- Success criteria: typed foundation + Orval pipeline ready; generated/manual separation â **met**.
- Rollback: remove `packages/api` + root/CI scripts.
- Checklist:
  - [x] orval configured
  - [x] client wired
  - [x] drift check
  - [x] WORKER.md updated
- OpenAPI limitation: real backend spec not available; `openapi.placeholder.yaml` has empty
  `paths` and is explicitly non-production. Orval emits empty models index only.
- Dependencies: `@tanstack/react-query`; peers react + react-query; dev orval.
- Decisions: token getter plug-in for Phase 8; no Redux; no domain endpoints invented.
- Deviations: none material (placeholder OpenAPI per Phase 6 instructions).
- Issues / blockers: none.

---

### Phase 7 â State Management (Status: COMPLETED)

- Objective: `packages/state` â Redux Toolkit store scaffolding for client/global state.
- Prerequisites: Phase 6 completed (to codify server/client boundary).
- Tasks: store architecture, slice boundaries, typed hooks/selectors, middleware,
  persistence (web storage vs native secure/async storage), hydration; documented
  "must NOT enter Redux" list enforced in review.
- Changes: `packages/state/**`; ESLint boundary rules for `state`/`api`.
- Must NOT change: putting server data into Redux; api package internals.
- Validation: `format:check`, `lint`, `typecheck`, `test`, `build` â **passed**.
- Success criteria: apps can consume a typed store; Query vs Redux boundary respected â **met**.
- Rollback: remove `packages/state`.
- Checklist:
  - [x] store (`createAzesStore`, `rootReducer`, typed dispatch/state)
  - [x] slices (foundation `preferences` only â theme preference)
  - [x] persistence (adapter contract + memory + web localStorage + hydrate helpers)
  - [x] WORKER.md updated
- Notes: Native secure/async storage adapters deferred to app/auth wiring (Phase 8+);
  only the adapter interface + web/memory implementations ship here. No auth/session/
  domain slices.
- Dependencies: `@reduxjs/toolkit`, `react-redux` (peer: react, react-redux).
- Decisions: no `@azes/api` / TanStack Query in this package; no redux-persist library.
- Deviations: none material.
- Issues / blockers: none.

---

### Phase 8 â Auth Foundation (Status: COMPLETED)

- Objective: `packages/auth` â platform-agnostic auth contracts + web/native adapters.
- Prerequisites: Phases 6 & 7 completed.
- Tasks: session/token contracts; web adapter (cookies/redirects/browser storage);
  native adapter (secure storage, refresh tokens, deep links, lifecycle); no provider coupling.
- Changes: `packages/auth/**`; additive `@azes/api` refresh hook + 401 single retry;
  ESLint `auth` boundary rule.
- Must NOT change: direct provider imports in apps; Phase 0â7 package contracts beyond
  documented API token integration.
- Validation: `format:check`, `lint`, `typecheck`, `test`, `build` â **passed**.
- Success criteria: apps depend on contracts, not a provider â **met**.
- Rollback: remove `packages/auth`; revert api refresh/401 additions if needed.
- Checklist:
  - [x] contracts (`AuthAdapter`, session/token, secure storage)
  - [x] web adapter (in-memory tokens; optional non-secret subject storage)
  - [x] native adapter (injected `AuthSecureStorage`; deep-link/foreground hooks)
  - [x] WORKER.md updated
- Notes: No real backend auth endpoints; `refreshSession` is app-injected. No Expo
  SecureStore/Keychain dependency â inject at app bootstrap. Tokens never in Redux;
  `@azes/state` not a runtime dependency (snapshot may be mirrored by apps later).
- Dependencies: peer `react` only (no `@azes/api` / `@azes/state` package deps â bridge injection).
- Decisions: `connectAuthToApi` injects api setters to avoid cycles; `AuthSessionSnapshot`
  excludes secrets.
- Deviations: none material (api 401 retry is documented integration, not a redesign).
- Issues / blockers: none.

---

### Phase 9 â Validation + i18n + Permissions (Status: COMPLETED)

- Objective: `packages/validation` (Zod), `packages/i18n` (i18next), `packages/permissions`.
- Prerequisites: Phase 6 completed (contracts as source of truth).
- Tasks: Zod schema conventions complementing OpenAPI (no duplicate contracts);
  i18n key/locale structure, fallback, lazy loading, formatting/pluralization across
  web/next/native; `resource.action` permission model for UX/nav decisions.
- Changes: `packages/validation/**`, `packages/i18n/**`, `packages/permissions/**`;
  ESLint boundary elements for the three packages.
- Must NOT change: api generated contracts; backend authorization assumptions.
- Validation: `format:check`, `lint`, `typecheck`, `test`, `build` â **passed**.
- Success criteria: apps import validation/i18n/permissions cleanly â **met**.
- Rollback: remove the three packages.
- Checklist:
  - [x] validation (`zod`, primitives, `parseWithSchema`, conventions)
  - [x] i18n (`createI18nInstance`, locales, Intl helpers, locale preference adapter)
  - [x] permissions (`resource.action` parse/checker + boundary docs)
  - [x] WORKER.md updated
- Notes: No product/business schemas, no app locales beyond minimal `common`, no
  permissions UI. Backend authz remains authoritative.
- Dependencies: validationâzod; i18nâi18next/react-i18next; permissionsânone.
- Decisions: deep-merge i18n resources so apps extend without wiping `common`.
- Deviations: none material.
- Issues / blockers: none.

---

### Phase 10 â Application Shells (Status: COMPLETED)

- Objective: Create all 8 apps as minimal, professional shells (Home only).
- Prerequisites: Phases 3-9 completed (at least tokens + one UI + providers available).
- Tasks per app: correct platform entry point; providers (theme, query client, store,
  i18n as applicable); global theme/styling; clean folder structure; a Home page/screen
  that identifies app name, platform, and dev/env indicator; NO business logic.
  - Web SPA (Vite): `account`, `admin`, `agent-platform`, `agent-site`.
  - Next.js (App Router): `realestate` (layouts, metadata, loading/error boundaries,
    client/server boundaries).
  - Mobile (Expo, expo-router): `mobile-account`, `mobile-agent`, `mobile-realestate`.
- Changes: `apps/**` (new); root `pnpm.overrides` for `@types/react`; ESLint ignores for
  Next/Expo env d.ts; one-shot scaffold scripts under `scripts/`.
- Must NOT change: no auth UI, dashboards, property/agent/admin features, real API calls,
  complex nav, advanced forms, business workflows.
- Validation: `format:check`, `lint`, `typecheck`, `test`, `build` â **passed**.
- Success criteria: all 8 build with a Home page; no business logic â **met**.
- Rollback: remove `apps/*`.
- Checklist:
  - [x] web apps (Vite SPA Ã4, ports 5173â5176)
  - [x] next app (`@azes/realestate`, port 3000)
  - [x] mobile apps (Expo Ã3; build = `tsc --noEmit`)
  - [x] all run (dev scripts present; CI validates build/test)
  - [x] WORKER.md updated
- Notes: Auth package not wired into shells (no auth UI). Mobile build is typecheck-only
  (no Expo export artifact). Next.js auto-manages `next-env.d.ts`.
- Decisions: shared providers pattern (Query + Store + i18n + Theme); Home identity only.
- Deviations: Expo `build` produces no turbo `outputs` (warnings only).
- Issues / blockers: none.

---

### Phase 11 â Testing & Quality Gates (Status: COMPLETED)

- Objective: Harden the quality gates across the workspace.
- Prerequisites: Phase 10 completed.
- Tasks: Vitest unit coverage baseline; Testing Library component tests; Playwright web E2E
  (smoke on shells); RN Testing Library; CI matrix; minimum gates enforced.
- Changes: `packages/testing/**`, per-app/per-package test config, CI.
- Must NOT change: production source behavior.
- Validation: full gate suite green in CI.
- Success criteria: gates enforced; flaky-free smoke suite.
- Rollback: relax/remove added gates.
- Checklist: [x] unit [x] component [x] e2e [x] CI matrix [x] WORKER.md updated
- Completed: 2026-08-22
- Changed files (high level):
  - `packages/testing/**` â `@azes/testing` (coverage thresholds, web/native helpers)
  - `tooling/vitest/index.js` â coverage reporter baseline + exported thresholds
  - `e2e/**` â Playwright smoke suite + sequential runner
  - `.github/workflows/ci.yml` â quality job + E2E matrix per web shell
  - Opt-in `test:coverage` on validation/permissions/testing/design-tokens/ui-native
  - `@azes/account` + `@azes/mobile-account` + `@azes/ui-native` test adapters
  - `docs/architecture/testing.md` â Phase 11 notes
- Validation results:
  - `pnpm format:check` â pass
  - `pnpm lint` â pass
  - `pnpm typecheck` â pass
  - `pnpm test` â pass
  - `pnpm test:coverage` â pass (threshold packages)
  - `pnpm build` â pass
  - `pnpm test:e2e` â pass (5 web shell smokes)
- Issues / limitations:
  - Full `@testing-library/react-native` cannot load real `react-native` under Vitest
    (Flow). `@azes/testing/native` provides an RNTL-shaped API; RNTL remains installed for
    Metro/Jest.
  - Playwright starts one preview server at a time (Windows multi-server timeout); CI
    matrices per app.
- Decisions: no production behavior changes; gates only.

---

### Phase 12 â Full Architecture Verification (Status: COMPLETED)

- Objective: Verify the whole architecture end-to-end against this blueprint.
- Prerequisites: Phase 11 completed.
- Tasks: dependency-graph audit (no forbidden edges), public-API/deep-import audit,
  generated-file policy audit, header-policy audit, bundle/perf sanity, docs/ADR sync.
- Changes: docs updates, minor fixes only (no new features).
- Must NOT change: introduce new scope/features.
- Validation: all gates + boundary + header + drift checks pass.
- Success criteria: architecture matches docs; sign-off recorded.
- Rollback: n/a (verification).
- Checklist: [x] boundaries [x] public APIs [x] headers [x] perf [x] docs synced
- Completed: 2026-08-22
- Changed files (high level):
  - `scripts/architecture-audit/**` â Phase 12 verification runner + audits
  - `docs/architecture/verification-signoff.md` â sign-off record
  - Docs sync: `docs/README.md`, dependency-graph, repository-structure, dependency-rules
  - CI: `architecture:verify` after build
  - Minor: AZES header on `apps/account/ARCHITECTURE.md`; E2E runner Windows spawn fix
- Validation results:
  - `pnpm format:check` â pass
  - `pnpm lint` â pass
  - `pnpm typecheck` â pass
  - `pnpm test` â pass
  - `pnpm test:coverage` â pass
  - `pnpm build` â pass
  - `pnpm architecture:verify` â pass
  - `pnpm api:generate:check` â pass
  - `pnpm test:e2e` â pass
- Issues / decisions:
  - No new product features; verification + docs sync only.
  - Soft bundle ceilings (not hard perf budgets).
  - Roadmap ends at Phase 12 â no Phase 13 defined in repository docs.

---

### Phase 13 â (not in roadmap yet)

- Status: **NOT DEFINED / NOT STARTED**
- Planning artifact only: [`docs/roadmap/phase-13-proposal.md`](docs/roadmap/phase-13-proposal.md)
- Proposed working title (pending approval): **Account Auth Vertical Slice (Web)**
- Do **not** mark `IN_PROGRESS` or `COMPLETED` until explicitly approved and copied into this
  roadmap as a real phase contract.

---

### Styles track â MUI 9.3.1 design system (branch `styles`)

The full phase contracts are in [`docs/styles/legacy/ROADMAP.md`](docs/styles/legacy/ROADMAP.md) (frozen). These phases are
numbered separately from the main roadmap above.

#### Styles Phase 0 â Baseline and docs (Status: COMPLETED)

- [x] Committed the uncommitted MUI migration on `dev` as six grouped commits (`67cd7f5`..`d564a4e`).
- [x] Created branch `styles` from `dev`. It did not exist before.
- [x] Baseline recorded in `docs/styles/legacy/BASELINE.md`: build, typecheck, test, lint, format:check
      and architecture:verify all PASS; azes-ui serves on port 5177.
- [x] Moved `docs/styles/00..13-*.md` to `docs/styles/migration/` (history; now `docs/styles/legacy/migration/`).
- [x] Wrote the topic docs: README, BASELINE, VISION, ARCHITECTURE, THEME, COLOR, TYPOGRAPHY,
      LAYOUT, COMPONENTS, NAVIGATION, RESPONSIVE, ACCESSIBILITY, SHOWCASE, ROADMAP.
- Changed files: `docs/styles/**`, `docs/architecture/ui-architecture.md` (links), `WORKER.md`.
- Runtime code: unchanged.
- Decisions: tokens keep primitives and the MUI theme owns semantics (see
  `docs/styles/legacy/ARCHITECTURE.md`); new theme inputs are only `secondary` and `density`;
  navigation is recipes, not wrapper components; Theme Lab state stays in `apps/azes-ui`.

#### Styles Phase 1 â Theme architecture (Status: COMPLETED)

- [x] Split `createAzesTheme.ts` into `palette.ts`, `typography.ts`, `shadows.ts`, `density.ts`, and `components/*`.
- [x] Parity test written against the monolith still passes. Public exports are unchanged.
- Changed files: `packages/ui-web/src/theme/**`, `docs/styles/legacy/THEME.md`, `docs/styles/legacy/ROADMAP.md`, `WORKER.md`.
- Validation: `@azes/ui-web` typecheck, tests (12), and eslint on `src/theme` passed. Repo gates recorded in the phase report.
- Decision: no `secondary` or `density` input in this phase. `density.ts` only stores the current comfortable button metrics. Empty component groups return `{}` so they add no component keys.

#### Styles Phase 2 â Light/dark and dynamic color (Status: COMPLETED)

- [x] `resolveBrandColor`, optional `secondary` theme input, `contrastThreshold: 4.5`.
- [x] Dark-scheme primary seed adjustment via `resolveDarkSchemePrimary`.
- [x] Contrast tests for all brand seeds; Vite vs Next pre-paint key parity test.
- [x] Showcase Secondary control (demo-only state, not persisted).
- Changed files: `packages/ui-web/src/theme/**`, `apps/azes-ui`, `docs/styles/legacy/COLOR.md`, `ROADMAP.md`.
- Validation: typecheck, test, lint, architecture:verify passed.

#### Styles Phase 3 â Typography, spacing and density (Status: COMPLETED)

- [x] `density` on `createAzesTheme` / `AzesThemeProvider`; compact `defaultProps` for inputs, lists, tables, toolbar, IconButton.
- [x] `controlXs` (28px) in design-tokens; comfortable button metrics unchanged.
- [x] Shadow ladder 1â24 anchored on sm/md/lg.
- [x] Exported `azesVariantMapping` (MUI v9 removed theme `variantMapping`).
- [x] Showcase Density control (demo state).
- Validation: typecheck, test (ui-web, design-tokens, ui-native, azes-ui), lint, architecture:verify.

#### Styles Phase 4 â Core component customization (Status: COMPLETED)

- [x] Button `disableElevation`; IconButton radius; ButtonGroup; Chip outlined + full radius;
      Card outlined + radiusLg; Paper outlined border; SvgIcon token sizes; Link text.link.
- [x] Catalog: `ButtonGroup`, `Link`, `SvgIcon`. No curated icons barrel (decision recorded).
- [x] Showcase Buttons section demos ButtonGroup, Chip, Link.
- Validation: ui-web/azes-ui typecheck and tests, lint, architecture:verify.

#### Styles Phase 5 â Layout (Status: COMPLETED)

- [x] Catalog export: `Container`.
- [x] Showcase Layout sections: Container/Grid/Stack demo and app-shell recipe.
- [x] Decision: no `AppShell` in `@azes/ui-web` until two product apps need it (`LAYOUT.md`).
- Validation: ui-web/azes-ui typecheck and tests, lint, architecture:verify.

#### Styles Phase 6 â AppBar, Drawer and navigation (Status: COMPLETED)

- [x] `navigation.ts`: MuiAppBar (default/transparent), Drawer, Tabs/Tab, Breadcrumbs.
- [x] Catalog: `Breadcrumbs`, `ListItemIcon`, `useScrollTrigger`.
- [x] Showcase: selectable AppBar and sidebar modes; mini drawer Tooltip + accessible names.
- [x] Theme test asserts navigation component defaults/overrides.
- Validation: ui-web/azes-ui typecheck and tests, lint, architecture:verify.

#### Styles Phase 7 â Forms and inputs (Status: COMPLETED)

- [x] `inputs.ts`: TextField outlined, OutlinedInput focus/error/disabled, choice controls primary,
      Slider, ToggleButton selected mix, Autocomplete popper z-index + compact options.
- [x] Density TextField/Select/FormControl/Autocomplete/Checkbox defaults owned by `inputs.ts`.
- [x] Catalog: Autocomplete, Checkbox, Radio, RadioGroup, Slider, ToggleButton(Group),
      FormHelperText, InputAdornment.
- [x] Showcase Inputs/Forms demos; Autocomplete inside Dialog.
- Validation: ui-web/azes-ui typecheck and tests, lint, architecture:verify.

#### Styles Phase 8 â Feedback and overlays (Status: COMPLETED)

- [x] `feedback.ts`: Alert, Snackbar, Dialog*, Tooltip, Menu, Popover, Progress, Skeleton,
      Backdrop, Collapse.
- [x] Catalog: AlertTitle, Backdrop, Collapse, Fade, LinearProgress, Menu, MenuList, Popover,
      Skeleton.
- [x] Showcase: alerts/progress/skeleton, snackbar, dialogs, menus/popover/tooltip.
- [x] Test: z-index stack tooltip > snackbar > modal > drawer > appBar.
- Validation: ui-web/azes-ui typecheck and tests, lint, architecture:verify.

#### Styles Phase 9 â Data display (Status: COMPLETED)

- [x] ListItemButton/TableRow primary color-mix hover/selected; TableContainer scroll below md.
- [x] Avatar secondary fallback; Badge error; Accordion bordered; Pagination density size.
- [x] Catalog: Accordion*, AvatarGroup, Badge, ListItem*, Pagination, TableContainer/Footer/
      Pagination/SortLabel.
- [x] Showcase: Tables, Lists, Avatars and badges, Accordion.
- Validation: ui-web/azes-ui typecheck and tests, lint, architecture:verify.

#### Styles Phase 10 â Responsive (Status: COMPLETED)

- [x] Audit: no raw px `@media` in apps/ui-web (only prefers-reduced-motion).
- [x] Theme Lab Viewport presets Fluid/360/768/1024/1440 frame the showcase shell.
- [x] Dialog fullScreen below sm / 360 preset; Responsive section; viewport smoke test.
- Validation: azes-ui typecheck/tests/lint, ui-web tests, architecture:verify.

#### Styles Phase 11 â Accessibility polish (Status: COMPLETED)

- [x] Contrast tests: primary seeds, body text, secondary, status colors (light/dark).
- [x] Compact control targets â¥ 24px; ListItemButton focus-visible ring.
- [x] Skip to content, accessibility section demos, role/name showcase tests.
- [x] Decision: do **not** add `axe-core` (no explicit dep approval); manual axe checklist in
      `ACCESSIBILITY.md`.
- Validation: ui-web/azes-ui typecheck and tests, lint, architecture:verify.

#### Styles Phase 12 â Complete showcase (Status: COMPLETED)

- [x] ThemeLabProvider / ThemeLabPanel; shell + section registry + `#/` hash routes.
- [x] Polished Overview; foundations incl. Motion; regrouped Inputs/Surfaces/Data/Feedback.
- [x] Copy config; smoke test every section id; docs updated (`SHOWCASE.md`, `ROADMAP.md`).
- Validation: azes-ui typecheck, lint, test, build; architecture:verify.

#### Styles Phase 13 â Cross-app integration verification (Status: COMPLETED)

- [x] Audited all web apps consuming `@azes/ui-web` (account, admin, agent-platform, agent-site,
      realestate, azes-ui).
- [x] Theme / MUI / Emotion / SSR matrix; hard-coded style + design-token audits (no Category A).
- [x] Validation: typecheck, lint, test, architecture:verify; per-app builds; runtime smoke
      (account dark/mobile; realestate InitColorSchemeScript).
- [x] Docs: `docs/styles/legacy/CROSS-APP.md`, ROADMAP/README; ADR-009 + ui-architecture pointers.
- Must NOT: redesign theme, expand azes-ui, upgrade MUI/Emotion, add axe-core, touch ui-native.

#### Styles Phase 14 â Primary-driven brand harmony (Status: COMPLETED)

- [x] `harmony.ts`: derive secondary / focus / link from primary (light + dark).
- [x] `createColorSchemes` uses derivation when `secondary` is omitted; feedback stays fixed.
- [x] Theme Lab primary-only; secondary shown as auto preview.
- [x] Tests + `COLOR.md` / ROADMAP / WORKER updated.

#### Styles Phase 15 â Twelve-color brand palette (Status: COMPLETED)

- [x] `brandSeeds` expanded to 12 curated primaries + `brandSeedDarkPrimary` + `brandSeedOrder`.
- [x] Dark primary HSL lift for custom hex; Theme Lab 12-swatch picker.
- [x] Contrast tests for all seeds (primary + auto secondary); docs updated.

---

### UI Platform track â MUI platform, docs rebuild, azes-ui pilot (branch `styles`)

Supersedes the v1 "no AppShell / navigation is recipes / Theme Lab stays in azes-ui / no icon
barrel" decisions. ADRs: 010â016. Docs: `docs/styles/`. Package name stays `@azes/ui-web`
(subpaths). Native is unchanged.

#### UI Platform Phase 0 â Docs rebuild (Status: COMPLETED)

- [x] `git mv` v1 `docs/styles/*` into `docs/styles/legacy/` (frozen).
- [x] Numbered set `00`â`20` + `README.md`.
- [x] ADR-010â016 authored.
- [x] References updated: this file, `docs/README.md`, `docs/architecture/ui-architecture.md`,
      ADR-009, `.cursor/rules/ui-system.mdc`, `apps/azes-ui` accessibility note.
- [x] Audit checks: `styles-docs`, `docs-sync` lists the new ADRs.

#### UI Platform Phase 1 â Tokens and theme v2 (Status: COMPLETED)

- [x] `layoutPx`, `componentPx`, `fontFamilyPresets` in `@azes/design-tokens`.
- [x] `createAzesTheme` accepts `fontFamily` and `direction`; `theme.azes` holds layout,
      component, density and customShadows.
- [x] Parity tests keep the existing palette/override contract.

#### UI Platform Phase 2 â Settings engine (Status: COMPLETED)

- [x] `@azes/ui-web/settings`: store, reducer, parse/migrate, selectors, `AzesUiProvider`.
- [x] Persistence key `azes.settings.v1`; migrates `azes-primary`.
- [x] Color scheme remains owned by MUI `useColorScheme`. Direction control hidden by default.

#### UI Platform Phase 3 â Navigation engine (Status: COMPLETED)

- [x] `@azes/ui-web/navigation`: schema, `filterNav`, `resolveActive`, depth 3, router adapter.
- [x] `azes-ui` `SHOWCASE_NAV` is `AzesNavConfig`. Hash adapter in `useHashRoute`.

#### UI Platform Phase 4 â Dashboard layout (Status: COMPLETED)

- [x] `AzesDashboardLayout`, `AzesHeader`, vertical + mobile nav, `AzesMainContent`.
- [x] Dimensions from `theme.azes.layout` / `--azes-layout-*`. ShowcaseShell removed.

#### UI Platform Phase 5 â Nav variants (Status: COMPLETED)

- [x] Mini and horizontal renderers; `navColor`; container fixed/fluid.

#### UI Platform Phase 6 â Settings drawer (Status: COMPLETED)

- [x] `AzesSettingsDrawer` / `Button` / `Section` / `Control`.
- [x] Theme Lab panel replaced. Viewport presets stay app-only in `azes-ui`.

#### UI Platform Phases 7â8 â QA (Status: COMPLETED)

- [x] Contrast tests for seeds and custom hex (light + dark).
- [x] Responsive + a11y pass in layout/showcase tests (skip link, drawer, focus).
- [x] Lazy section loaders. Playwright visual project `e2e/playwright.visual.config.ts`
      (local-only; baselines are platform-specific).
- [x] Architecture checks: `forbidden-libraries`, `ui-web-subpaths`, `layout-hardcoded-values`.

#### UI Platform Phase 9 â RTL (Status: BLOCKED)

- Blocked on the owner decision (are Azerbaijani / English / Russian going to need RTL?).
- Until unblocked: CSS logical properties, `direction` setting exists, control hidden, LTR theme.
- Unblocking adds `@emotion/cache` + `stylis-plugin-rtl` (ADR-015). No install performed.

#### UI Platform Phases 10â12 â Data grid, charts, forms (Status: COMPLETED)

- [x] `@azes/ui-web/data-grid` (`AzesDataGrid`, MUI X community).
- [x] `@azes/ui-web/charts` (`AzesLineChart`, `AzesBarChart`, `AzesPieChart`).
- [x] `@azes/ui-web/forms` (react-hook-form). Schemas stay in `@azes/validation`; resolvers
      live in the app. Date pickers deferred (optional).
- [x] Showcase sections: data-grid, charts, form-binding.

#### UI Platform Phases 13â14 â Pilot pages and showcase (Status: COMPLETED)

- [x] `AzesAuthLayout` / `AzesMainLayout`. Pages: analytics, list, form, auth.
- [x] Full showcase IA (design-system + platform + pages). Adoption guide in `17-migration.md`.
- [x] Product apps unchanged; `admin` adoption is a later approved track.

Validation recorded for this track: `@azes/design-tokens` tests, `@azes/ui-web` tests,
`@azes/azes-ui` tests, `pnpm architecture:verify`. Product-app smoke remains the existing
Playwright suite (unchanged).

---

## 8. Change log

- 2026-10-11 — **Bütün agentlər maksimum protokol:** `coordinator-agent.mdc`,
  `uiDesignAgent.mdc`, `apiMenecerAgent.mdc` (+ əvvəlki `memarAgent.mdc`) — oxu sırası,
  anti-uydurma/anti-drift, self-check, Report/DoD. Proses keyfiyyəti (Auto≠Opus).
  `my_cursor_gents.md` yeniləndi. Validation: n/a (governance).
- 2026-10-11 — **Agent Memar maksimum protokol** (`memarAgent.mdc`): Plan-only + anti-uydurma;
  məcburi oxu sırası; A planı 11 bölmə; B/C prompt keyfiyyət checklist; self-check.
  Proses keyfiyyəti (Auto≠Opus). `my_cursor_gents.md` yeniləndi. Validation: n/a (governance).
- 2026-10-11 — **Agent Memar** (`memarAgent.mdc`): Plan-only; chatdə memarlıq planı + ayrı
  Worker/Dizayner promptları (AZ); kod/fayl yox. Role gate + `my_cursor_gents.md` + §4a
  dörd rol. Validation: n/a (governance).
- 2026-10-11 — Agent policy: Coordinator in-monorepo terminal no re-ask; out-of-repo must ask;
  Dizayner/Worker may run scoped `--filter` gates; full build/git/deploy stay Coordinator-only
  (`coordinator-agent.mdc`, `uiDesignAgent.mdc`, `apiMenecerAgent.mdc`, `my_cursor_gents.md`).
- 2026-10-11 — Coordinator deploy: `pnpm build` PASS (RN mutator types + `@azes/ui-web/brand`
  for Next layout); commit `e6a871e` on `account` → merged/pushed `origin/account`,
  `origin/dev`, `origin/main`; local branch `full_app` checked out at same tip.
- 2026-10-11 — Agent roster: `coordinator-agent.mdc` (alwaysApply; exclusive build/git/deploy);
  `uiDesignAgent.mdc` → **Agent Dizayner** (slim, suggest-only gates, narrower globs);
  `apiMenecerAgent.mdc` → **Agent Worker** (slim, encyclopedia deferred to CURRENT-STATE);
  WORKER.md §4a. Docs/rules only — no product code. Validation: n/a (governance).
- 2026-10-10 — Global `AzesDialog` (Context queue + `useAzesDialog` / `openDialog` bridge,
  `theme.azes.dialog`, Design Lab demos). Admin Users delete + Ads delete/add-to-work migrated;
  `DeleteUserDialog`/`DeleteAdDialog` removed; en/az/ru `dialog.*` + `DialogLabelsBridge`;
  ESLint `no-alert`; docs `23-dialog.md` + CURRENT-STATE. Validation: `@azes/ui-web`
  typecheck/build + dialog/settings/snackbar tests; `@azes/admin` typecheck + Users/Ads
  dialog flow tests. Lint: changed dialog/admin files clean; full ui-web lint still has
  pre-existing unrelated errors. Bundle: `dist/dialog` ~59KB (not claimed as core budget gate).
  Bridge not wired into API 401/403 middleware (auth redirect already owns that).
- 2026-10-09 — OKLCH brand/surfaces redesign in `@azes/ui-web` (`color-utils`, `surfaces`,
  retuned `brand`/`harmony`/`palette`, `tintSurfaces`, tests + snapshot, `pnpm color:report`,
  azes-ui Colors grid, `docs/styles/05-color-system.md` + CURRENT-STATE). Validation:
  `@azes/ui-web` theme/color tests + typecheck (see agent report).
- 2026-10-09 — UI Design Agent governance: `.cursor/rules/uiDesignAgent.mdc` +
  `docs/styles/CURRENT-STATE.md`; pointers in `architecture.mdc`, `packages.mdc`,
  `ui-system.mdc`, `apps.mdc`; `docs/styles` README + `02-architecture` synced for
  `/feedback` + `/locale` exports. Not a numbered product phase. Validation: docs/rules only.
- 2026-08-22 â Phase 0 blueprint authored (`docs/**`, `WORKER.md`). Greenfield audit complete.
- 2026-08-22 â Created all 11 `.cursor/rules/*.mdc` files. Phase 0 marked `COMPLETED`. Phase 1 set to `READY` (awaiting explicit approval).
- 2026-08-22 â Phase 1 COMPLETED: git init, pnpm workspace, Turborepo, root TypeScript base, README. Phase 2 set to `READY`.
- 2026-08-22 â Phase 2 COMPLETED: tooling packages (typescript/eslint/prettier/vitest), husky, lint-staged, CI workflow. Phase 3 set to `READY`.
- 2026-08-22 â Phase 3 COMPLETED: `@azes/design-tokens` primitives, semantic light/dark themes, CSS helpers, tests. Phase 4 set to `READY`.
- 2026-08-22 â Phase 4 COMPLETED: `@azes/ui-web` ThemeProvider + Box/Stack/Text/Button, Radix Slot, Testing Library. Phase 5 set to `READY`.
- 2026-08-22 â Phase 5 COMPLETED: `@azes/ui-native` ThemeProvider/useTheme + Box/Stack/Text/Button, token StyleSheet, tests. Phase 6 set to `READY`.
- 2026-08-22 â Phase 6 COMPLETED: `@azes/api` Orval pipeline, mutator, query keys, CI drift check; placeholder OpenAPI (empty paths). Phase 7 set to `READY`.
- 2026-08-22 â Phase 7 COMPLETED: `@azes/state` RTK store factory, preferences slice, typed hooks, persistence adapters, boundary docs/tests. Phase 8 set to `READY`.
- 2026-08-22 â Phase 8 COMPLETED: `@azes/auth` contracts + web/native adapters, API token/refresh bridge, 401 retry hook; Phase 9 set to `READY`.
- 2026-08-22 â Phase 9 COMPLETED: `@azes/validation`, `@azes/i18n`, `@azes/permissions` foundations. Phase 10 set to `READY`.
- 2026-08-22 â Phase 10 COMPLETED: 8 application shells (4 Vite, 1 Next.js, 3 Expo) with Home-only + providers. Phase 11 set to `READY`.
- 2026-08-22 â Phase 11 COMPLETED: `@azes/testing`, coverage baseline, Playwright smoke E2E, RNTL-shaped native helpers, CI matrix. Phase 12 set to `READY`.
- 2026-08-22 â Phase 12 COMPLETED: architecture verification suite (`pnpm architecture:verify`), sign-off recorded. Roadmap ends (no Phase 13 in docs).
- 2026-08-22 â Planning only: Phase 13 proposal authored (`docs/roadmap/phase-13-proposal.md`). Root `pnpm dev` scoped to apps + distinct Expo Metro ports. Phase 13 **not** started.
- 2026-09-29 â MUI web theme migration completed on `dev` (ADR-009, `docs/styles/`). `@azes/ui-web` uses Material UI v9. `@azes/ui-native` and the auth Phase 13 proposal are unchanged.
- 2026-10-02 â Styles Phase 0 COMPLETED on branch `styles`: MUI migration committed on `dev`, baseline recorded, `docs/styles/` restructured with a Phase 0â13 roadmap. Styles Phase 1 is `PENDING`.
- 2026-10-02 â Styles Phase 1 COMPLETED on branch `styles`: theme factory split with no visual change. Phase 2 is `PENDING`.
- 2026-10-02 â Styles Phase 2 COMPLETED: dynamic secondary, contrast threshold, dark primary adjustment, color-scheme parity test. Phase 3 is `PENDING`.
- 2026-10-02 â Styles Phase 3 COMPLETED: density presets, shadow ladder, azesVariantMapping. Phase 4 is `PENDING`.
- 2026-10-02 â Styles Phase 4 COMPLETED: Button/Chip/Card/Paper/Link/SvgIcon overrides. Phase 5 is `PENDING`.
- 2026-10-02 â Styles Phase 5 COMPLETED: Container export, layout showcase, no AppShell in ui-web. Phase 6 is `PENDING`.
- 2026-10-02 â Styles Phase 6 COMPLETED: AppBar/Drawer/Tabs/Breadcrumbs theme + showcase nav modes. Phase 7 is `PENDING`.
- 2026-10-02 â Styles Phase 7 COMPLETED: form/input theme overrides + showcase demos. Phase 8 is `PENDING`.
- 2026-10-02 â Styles Phase 8 COMPLETED: feedback/overlay theme + z-index stack test. Phase 9 is `PENDING`.
- 2026-10-02 â Styles Phase 9 COMPLETED: list/table/avatar/badge/accordion/pagination theme. Phase 10 is `PENDING`.
- 2026-10-02 â Styles Phase 10 COMPLETED: viewport presets + responsive audit. Phase 11 is `PENDING`.
- 2026-10-02 â Styles Phase 11 COMPLETED: a11y contrast/focus/skip-link; axe-core declined. Phase 12 is `PENDING`.
- 2026-10-02 â Styles Phase 12 COMPLETED: showcase IA (lab/shell/sections), Overview polish, registry smoke. Phase 13 is `PENDING`.
- 2026-10-02 â Styles Phase 13 COMPLETED: cross-app verification (`CROSS-APP.md`); all six web apps PASS; no Category A theme fixes. Styles roadmap complete; merge to `dev` awaits approval.
- 2026-10-04 â Styles Phase 14 COMPLETED: primary-driven secondary/focus/link harmony in `@azes/ui-web`; Theme Lab primary-only.
- 2026-10-04 â Styles Phase 15 COMPLETED: 12 brand seeds + dark companions + Theme Lab swatches.
- 2026-10-04 â UI Platform track COMPLETED on `styles` (Phases 0â8, 10â14). Docs rebuilt under
  `docs/styles/` with v1 in `legacy/`. `@azes/ui-web` gained settings, navigation, layout, icons,
  data-grid, charts and forms subpaths. `azes-ui` is the pilot. Phase 9 RTL is BLOCKED.
- 2026-10-04 â User-approved: pushed styles/UI platform to `origin/dev`, created branch `account`.
  Built `@azes/account` login and `@azes/admin` hash token handoff.
- 2026-10-05 â Dual chrome (mini rail + horizontal menus), headerMode autoHide, palette refresh,
  settings gear trigger, account login redesign (cinematic v2). Details live in working tree /
  prior session notes; re-expand in WORKER if a full chronicle restore is needed.
- 2026-10-06 â Settings drawer visual redesign: OptionCards, mode previews, color cards.
- 2026-10-06 â Settings wiring slice (this task): remove custom hex UI; 12 seed ColorOptionCards;
  fonts Inter / Manrope / Plus Jakarta (`@fontsource-variable/*`, latin-ext, dynamic load);
  `navToneVars` for sidebar + header + horizontal toolbar; container maxWidth 1280 on main +
  header inner; density spacing base 8/6 + compact component defaults; drawer scroll footer pad.
  Validation: `@azes/design-tokens` test PASS; `@azes/ui-web` settings+theme+layout (44) PASS;
  typecheck + build PASS.
- 2026-10-06 — Account login visual polish v3 (approved ad-hoc): centered 200px logo (no
  adjacent brand text), Ken Burns/LED/god-rays/particles fix (reveal vs KB on separate layers;
  soft glow kept under prefers-reduced-motion), living border + form stagger + mesh panel,
  autofill unified surface, success UI ≤250ms. Validation: `@azes/account` test (7) + lint PASS.

- 2026-10-06 — Chrome density lock + menus-hide persistence: header/toolbar use layoutPx /
  chromeMetrics (density does not reflow chrome); AdminShell no longer remounts on locale
  (removed locale-keyed layout remount). Layout tests 13 PASS.

- 2026-10-06 — Admin Users list-first page: POST /users/table via useQuery, AzesDataGrid server pagination, #/users route, en/az/ru i18n. Tests 21 PASS; typecheck PASS.
- 2026-10-06 — Admin Users add/delete: AddUserDialog (POST /users + org/role dropdowns),
  DeleteUserDialog (DELETE /users/{id}), table invalidate via `USERS_TABLE_QUERY_ROOT`,
  en/az/ru i18n. Layout uses MuiBox (AZES Stack has no `component` / responsive `direction`).
  Validation: `@azes/admin` typecheck PASS; users tests 8 PASS.
- 2026-10-06 — Fix autoHide header stuck: `bottomLocked` used `concealed` circularly and
  never cleared on short scoops (Users page). `resolveBottomChromeLock` releases on scroll-up
  and skips lock when maxScroll ≤ unlock. Layout tests 16 PASS; `@azes/ui-web` build PASS.
- 2026-10-06 — Stop autoHide thrash on list pages: gate conceal with overflow budget
  (`resolveScrollChromeConcealed` / MIN 220px); MainContent flex fill chain; UsersPage
  fills scoop so DataGrid scrolls internally. Layout 20 PASS; ui-web build PASS;
  admin typecheck + users tests PASS.
- 2026-10-06 — Restore global autoHide (removed overflow gate that blocked conceal).
  Keep Users fill-height + MainContent flex chain; compensate scoop scrollTop on
  chrome collapse to avoid thrash. bottomLocked short-page fix retained.
  Validation: layout tests 16 PASS; `@azes/ui-web` build PASS.
- 2026-10-06 — Root cause of dead autoHide: MainContent `minHeight:0` + `overflowX:auto`
  made main the vertical scrollport (CSS). Reverted default MainContent; opt-in `fill`
  only for Users via AdminShell `slotProps.main.fill`. Scoop scrolls again for autoHide.
  Validation: layout 17 PASS; `@azes/ui-web` build PASS; `@azes/admin` typecheck PASS.
- 2026-10-09 — Cross-port auth device bind: cookie `azes_device_id` + hash handoff restore;
  Admin seeds device before refresh/user-menu; raw refresh requires `{ refreshToken, token }`;
  logout clears device cookie with JWTs; Admin mirrors `VITE_DEVICE_ID`. Fixes prod API
  user-menu 403 (Account device A vs Admin device B). Validation: `@azes/auth` 18,
  `@azes/api` 22, `@azes/account` 9, `@azes/admin` tests + account/admin typecheck PASS.
- 2026-10-09 — API Manager Agent governance: `.cursor/rules/apiMenecerAgent.mdc` +
  `docs/api/CURRENT-STATE.md`; pointers in `architecture.mdc`, `packages.mdc`, `apps.mdc`,
  `api-generation.mdc`, `docs/architecture/api-architecture.md`. Docs/rules only — no runtime
  code change. Validation: N/A (governance).
- 2026-10-09 — API Manager Agent: **feature page build protocol** (folder/`index.tsx`,
  components/hooks/models/services/optional slice, page-scoped APIs, `@azes/ui-web` compose).
  Updated `apiMenecerAgent.mdc`, `apps.mdc`, `docs/api/CURRENT-STATE.md`. Docs/rules only.
- 2026-10-09 — Admin Ads/Elanlar page: `apps/admin/src/features/ads/` (folder model),
  route `/announcement` (menu id 3), `POST /api/v1/ad/table` + delete, i18n en/az/ru,
  AdminShell mount + main fill. Validation: ads feature tests 5 PASS; `@azes/admin`
  typecheck PASS.
- 2026-10-09 — Ads: thumbnails `GET /adattachment/ad/{id}` + add-to-work
  `POST /usersads/work` (+ tooltip). Ads feature tests 9 PASS. Full `@azes/admin`
  typecheck currently fails on unrelated `DesignLabPage.tsx` GridColDef (backlog).
- 2026-10-10 — Pages/features architecture: Users + Ads migrated to thin
  `pages/*` + `features/*` (RHF+zod, `service/*Queries`, `PATHS`, lazy shell imports).
  Rules: `page-architecture.mdc`, `ui-conventions.mdc`; docs ADR-018 +
  `pages-and-features.md`; admin ESLint boundaries. Validation: users/ads/pages tests
  22 PASS; typecheck PASS; lint PASS; admin build PASS.
- 2026-10-10 — Admin **User ads** page: `pages/user-ads` + `features/user-ads`,
  route `#/user-announcement` (`PATHS.userAds`; legacy `#/ad/users` still matched),
  list `POST /api/v1/ad/users/table` (+ CRUD/attachments; no usersads/work).
  Shell lazy mount + i18n en/az/ru. Validation: user-ads tests PASS; typecheck PASS.
- 2026-10-09 — AzesDataGrid redesign (approved UI track): `theme.azes.dataGrid`,
  `dataGridStyles.ts`, default `autoHeight` + `maxHeight`, CSS sticky actions
  (`azes-sticky-end`, `columnBufferPx=480`, not Pro pinning). Migrated admin
  Users/Ads/Design Lab + azes-ui. Docs: `13-mui-x.md`, ADR-013 sticky note,
  `docs/styles/CURRENT-STATE.md`. Validation: `@azes/ui-web` typecheck + DataGrid
  tests PASS; `@azes/ui-web` build; `@azes/admin` typecheck PASS; users/ads tests
  17 PASS.
- 2026-10-09 — Header autoHide anti-jitter: `resolveChromeAutoHideLatch` settle
  (`CHROME_SETTLE_MS=350`) + show-up hysteresis (`CHROME_SHOW_UP_PX=32`); post-
  compensation baseline + settle on L-shell collapse. Manual menus hide/Apps pin
  unchanged. Validation: layout unit tests + `@azes/ui-web` typecheck.
- 2026-10-09 — Scoop↔rail join radius animates with header conceal/show
  (`onConcealedChange`, `CHROME_MOTION_MS`, `data-azes-scoop-join` flat|curve).
- 2026-10-09 — AzesTable (`@azes/ui-web/table`, ADR-017): TanStack Table v8 + MUI
  Table, sticky actions, `theme.azes.table`. Users/Ads migrated off DataGrid.
  ESLint bans `/data-grid` + direct TanStack in product apps (Design Lab excepted).
  Docs: `21-table.md`. Validation: ui-web table tests + admin users/ads tests;
  core `dist/index.js` has no `@tanstack/react-table`.
- 2026-10-12 — Agent-site owner shell (ad-hoc plan): locale owner routes
  `/{locale}/` (listings) + `/{locale}/sold-item`; profile dialog; shell header/nav +
  `AzesUiProvider` settings; admin Konfiq `ownerHomeUrl`; legacy `/manage` redirect;
  public `/a/{publicKey}` kept. Features: `shell`, `listings`, `sold-items`, `profile`.
  Validation: `@azes/agent-site` typecheck/lint/test/build PASS; admin `agentSiteUrls` tests PASS.

## 9. Backlog (discovered, not yet scheduled)

- `loadAzesFont.ts` had orphan `dmSans` / `spaceGrotesk` cases (no preset/deps) that
  broke `@azes/ui-web` typecheck/tests; cases removed to restore green. Full font
  presets need an approved task (packages + settings + drawer).
- `AzesAccordion` panel `component="form"` + `KeyboardEvent<HTMLDivElement>` broke
  ui-web build; handler widened to `HTMLElement` as a minimal unblock (accordion
  itself is out of AzesTable scope).
- `pnpm install` warns about ignored dependency build scripts (unrelated to styling).
- Turbo warns `no output files found` for `@azes/mobile-*#build` (check `outputs` in `turbo.json`).
- `@emotion/react` / `@emotion/styled` use caret ranges in `packages/ui-web/package.json`, and
  `@mui/material-nextjs` is 9.4.0 while `@mui/material` is 9.3.1. Pinning needs approval.
- `@azes/design-tokens` `themeToCss` / `toCssVariables` have no web consumers. Removing them
  needs an approved task.
- No git `user.name` / `user.email` is configured on this machine.
- UI Platform Phase 9 (RTL Emotion cache + `stylis-plugin-rtl`) waits for an owner decision.
- `@azes/state` `preferences.theme` duplicates MUI color-scheme storage; removal needs approval.
- Font presets (5): `@fontsource-variable/{inter,manrope,plus-jakarta-sans,dm-sans,space-grotesk}` (latin + latin-ext).
  Further self-hosted subsets or additional families need approval.
- `@axe-core/playwright` remains declined (Styles Phase 11). Revisit only with explicit approval.
- `apps/azes-ui/strukture.md` is untracked and describes the pre-platform showcase; owner decides
  whether to update, commit, or drop it.
- Playwright visual baselines for `azes-ui` are local-only (`e2e/playwright.visual.config.ts`).
- `pnpm architecture:verify` generated-file policy currently fails on
  `packages/api/generated/admin/**` (Orval admin clients importing the hand-written mutator).
  That work is outside the UI platform track.
- Auth prod gaps (deferred from device-cookie fix): `402` payment handler/route;
  `RoleId === "4"` Evaluation route + skip user-menu; role allowlist separate from menus.
- `AzesSidePanel` (2026-10-10): global host shipped; Settings + Ads filters migrated.
  Ads `?panel=adsFilters` + `?ad=` URL sync shipped with React Router `useQueryState` (push).
  Legacy `features/ads/components/AdsFilters` accordion form is unused after side-panel
  migration — remove in a cleanup task (Users / UserAds still use search accordion).
- Admin React Router migration (2026-10-10): `react-router@7.18.4` data mode under
  `apps/admin/src/app/router/`; hash router removed. Validation: typecheck/lint/test/build
  PASS (57 tests). Manual browser pass (menu/refresh/back/dirty) not run in this session.
  Deferred deeper unit tests: RequireAuth/RequireRole full matrix, useUnsavedChangesGuard,
  Ads deep-link integration. RR 8.x blocked on React ≥19.2.7 (needs separate approval).
- `AzesMenu` / glass Backdrop (2026-10-10): shipped. Next Menu migrations (not done):
  `AzesAccountMenu`, `NavMenuItems` (mini/horizontal nav children). Form `Select` stays.
- 2026-10-11 — Caspian Key global loaders (ad-hoc UI): admin `NavigationLoader` (page→page
  via `useNavigation`) + enhanced `CaspianLoader` (MUI LinearProgress, glass fullscreen);
  `RouteLoader mode="handoff"` for account→admin (`:5173`→`:5174`); account `CaspianKeyLoader`
  for boot + handoff; `hasPendingAuthHandoff` in `consumeHandoff` (ESLint-safe). Docs:
  `docs/styles/25-logo-and-loading.md` + CURRENT-STATE delta. Validation: admin/account
  eslint + typecheck prior; CaspianLoader 3, consumeHandoff 5, LoginPage/adminHandoff 6 PASS.
- 2026-10-11 — Loader exclusivity + `/auth-lab` scoop scroll: legacy skeletons → RouteLoader;
  Design Lab loading demos; `announce` gate; ScrollToMain manual + delayed reset; skip-link
  preventScroll. Validation: ScrollToMain/CaspianLoader/consumeHandoff tests + typecheck.
- 2026-10-11 — Cross-port UI prefs (ad-hoc): cookie bridge so dark mode + primary (and full
  settings) match on account↔admin logout/handoff. `crossPortStorage` + ThemeProvider
  `storageManager`; account/admin index.html cookie boot. Docs `10-settings.md`.- 2026-10-11 � AutoHide short-page trap: after chrome collapse scoop grows, scrollTop clamps
  to 0 while latch baseline stays high ? cannot reveal header. Fix: release at scrollTop<=0
  (even during settle), force-reveal when maxScroll < showUpPx, min overflow gate 120px,
  ResizeObserver re-sync. Layout tests 24 PASS; ui-web build PASS.
- 2026-10-11 � Locale switch flash: per-locale route branches (shell-en/shell-az) remounted
  AdminShell + lazy pages on first language change. Collapsed to single /:locale tree so shell
  stays mounted; LocaleGate preserves unprefixed bookmarks. LocaleGate tests 2 PASS.
