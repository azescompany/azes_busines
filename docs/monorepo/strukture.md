<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: strukture.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-20
║ Purpose: Current monorepo layout — apps, packages, tooling, docs
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AZES monorepo — cari struktur

Hesabat tarixi: **2026-10-20**. Mənbə: diskdəki `apps/`, `packages/`, `tooling/`, kök konfiq və
`package.json` metadata. Bu fayl köhnə (2026-10-02) “9 shell app” hesabatını əvəz edir.

> **Qısa fərq (köhnə → indi):** `admin`, `agent-platform`, `agent-site`, `realestate`,
> `mobile-*` bu iş ağacında **yoxdur**. Əlavə olunub: `apps/academy` (LMS SPA) və
> `apps/api` (Hono + Cloudflare Workers + D1 + R2). Platform paketləri eyni 10-dur;
> Academy LMS aktiv inkişafda (WORKER §4b).

---

## 1. Ümumi baxış

AZES — **Turborepo + pnpm** workspace. Paket scope: `@azes/*`. Node `>=22`, pnpm `10.30.3`
(`packageManager` pin).

Əsas ideya:

| Qat              | Rol                                                          |
| ---------------- | ------------------------------------------------------------ |
| `apps/`          | Məhsul tətbiqləri — biznes məntiqi, `features/`, route, i18n |
| `packages/`      | Paylaşılan platforma (UI, API client, auth, state, …)        |
| `tooling/`       | ESLint / Prettier / TS / Vitest shared config                |
| `docs/`          | Arxitektura, ADR, CURRENT-STATE snapshot-lar                 |
| `.cursor/rules/` | Agent və kod qaydaları                                       |

```text
azes-monorepo/
├── apps/                 # 4 tətbiq (cari disk)
│   ├── academy/          # LMS SPA (Vite :200)
│   ├── account/          # Auth / login SPA (Vite :100)
│   ├── api/              # HTTP API — Workers + D1 (@azes/api-server)
│   └── azes-ui/          # Design-system showcase (Vite :700)
├── packages/             # 10 platform paket
├── tooling/              # eslint, prettier, typescript, vitest
├── docs/                 # architecture, api, styles, academy, decisions…
├── e2e/                  # Playwright smoke + visual
├── scripts/              # architecture-audit, scaffold helpers
├── .cursor/rules/        # agent / coding rules
├── package.json          # root scripts (build, lint, api:generate…)
├── pnpm-workspace.yaml   # apps/* | packages/* | tooling/*
├── turbo.json
├── WORKER.md             # icra müqaviləsi + Academy §4b checkpoint
├── CLAUDE.MD / CHAT.MD   # Academy LMS plan (+ *_DELTA prioritet)
└── strukture.md          # bu fayl
```

Workspace glob (`pnpm-workspace.yaml`):

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
```

---

## 2. Asılılıq qrafı (dəmir qaydalar)

```text
apps ──► packages          ✅
apps ──► apps              ❌
ui-web / ui-native ──► api / state / auth / biznes  ❌
design-tokens ──► React                            ❌
generated OpenAPI ──► əl ilə redaktə               ❌
```

İstiqamət (sadələşdirilmiş):

```text
design-tokens
    ├──► ui-web  ──┐
    └──► ui-native ┤
                   ├──► apps/*
OpenAPI → Orval → @azes/api ──┘
@azes/auth, state, i18n, validation, permissions ──► apps/*

apps/api (@azes/api-server) = server runtime (Hono/D1)
packages/api (@azes/api)    = frontend client (Orval + TanStack Query)
```

Server state → **TanStack Query** (`@azes/api`). Client/UI state → **Redux Toolkit**
(`@azes/state`). API cavabı Redux-a getmir (əsaslı ADR olmadan).

Səhifə quruluşu: nazik `pages/<ad>/index.tsx` + dolu `features/<ad>/`
(`.cursor/rules/page-architecture.mdc`).

---

## 3. apps/ — cari tətbiqlər

| Qovluq    | Paket              | Stack           | Dev port            | UI             | Vəziyyət                                            |
| --------- | ------------------ | --------------- | ------------------- | -------------- | --------------------------------------------------- |
| `academy` | `@azes/academy`    | Vite + React 19 | **200**             | `@azes/ui-web` | **LMS məhsulu** — kataloq, öyrənmə, manage, quiz UI |
| `account` | `@azes/account`    | Vite + React 19 | **100**             | `@azes/ui-web` | Auth/login + session handoff                        |
| `api`     | `@azes/api-server` | Hono + Wrangler | **8787** (wrangler) | —              | Auth + LMS + org/RBAC + quiz API                    |
| `azes-ui` | `@azes/azes-ui`    | Vite + React 19 | **700**             | `@azes/ui-web` | Design-system showcase / lab                        |

`apps → apps` idxalı yoxdur. Web UI yalnız `@azes/ui-web` vasitəsilə (birbaşa raw MUI UI
məhsul səhifələrində gözlənilmir).

### 3.1 `apps/academy` — AZES Academy (LMS)

Əsas məhsul track-i. Shell mövcuddur; LMS feature-lar `features/` altında.

```text
apps/academy/src/
├── app/              # AcademyShell, App root
├── auth/             # createAcademyAuth, permissions, useAcademyMe
├── features/
│   ├── catalog/      # kurs kataloqu, detallar, my-programs
│   ├── learn/        # öyrənməm, lesson player
│   ├── manage-courses/
│   ├── manage-orgs/
│   ├── manage-tracks/
│   ├── manage-quizzes/
│   ├── quizzes/      # tələbə quiz UI
│   └── ai-assistant/
├── pages/            # nazik route entry-lər
├── navigation/       # primaryNav (permission-filtered)
├── routing/
├── providers/
├── i18n/locales/{az,en,ru}/
└── …
```

Asılılıqlar: `@azes/api`, `@azes/auth`, `@azes/i18n`, `@azes/ui-web`, `@azes/validation`.

Hash route nümunələri (cari): `#/catalog`, `#/my-programs`, `#/learn`, `#/manage/*`,
`#/quizzes`. İcazələr JWT/`/me` üzərindən (`role`, `orgId`, `permissions`).

Plan / checkpoint: `CLAUDE*.MD`, `CHAT*.MD`, `WORKER.md` §4b
(`docs/academy/RBAC-ORG-TRACK-DECISIONS.md`).

### 3.2 `apps/account` — Account SPA

Login və auth session. Academy və digər app-lər üçün handoff nöqtəsi.

```text
apps/account/src/
├── app/
├── auth/
├── features/login/
├── branding/, loading/, providers/, i18n/
└── …
```

Asılılıqlar: `@azes/api`, `@azes/auth`, `@azes/i18n`, `@azes/state`, `@azes/ui-web`,
`@azes/validation`, `@tanstack/react-query`, RHF resolvers.

Dev: `vite --port 100`. API base adətən Worker (`VITE_API_BASE_URL` → `http://127.0.0.1:8787`).

### 3.3 `apps/api` — HTTP API server (`@azes/api-server`)

**Qeyd:** `packages/api` ilə qarışdırılmamalıdır. Bu app — Cloudflare Workers üzərində
işləyən backend runtime.

```text
apps/api/
├── src/
│   ├── app.ts, index.ts, env.ts, cors.ts, errors.ts
│   ├── auth/          # tokens, permissions, scope, requireAuth, service
│   ├── db/            # Drizzle schema + client
│   ├── lms/           # repository, mutations, progress, quiz, files, sanitize…
│   ├── org/           # org repository / types
│   └── routes/        # auth, health, lms, lmsManage, lmsQuiz, org
├── drizzle/migrations/
│   ├── 0000_auth_foundation.sql
│   ├── 0001_auth_rate_limits.sql
│   ├── 0002_lms_foundation.sql
│   ├── 0003_org_rbac_track.sql
│   └── 0004_lms_quiz.sql
├── scripts/           # seed-local-user, seed-role-users, seed-lms
├── test/              # auth, lms, rbac, quiz, rateLimit…
└── wrangler.toml
```

Stack: **Hono**, **Drizzle ORM**, **D1**, **R2** (fayllar), **jose** (JWT), **zod**.

Əsas marşrut qrupları:

| Prefiks / sahə          | Məqsəd                                                  |
| ----------------------- | ------------------------------------------------------- |
| `/api/v1/auth/*`        | login, refresh, logout, me                              |
| `/api/v1/courses*`      | kataloq, enroll, lesson, progress (tələbə)              |
| `/api/v1/manage/*`      | kurs/modul/dərs yazma, publish, reorder, archive, files |
| `/api/v1/orgs`, tracks… | org / Track / assign (RBAC)                             |
| quiz routes             | cəhd, qiymətləndirmə (M6)                               |

Lokal seed: `pnpm --filter @azes/api-server seed:role-users` / `seed:lms`
(bax: `USERS.MD`, `RUNNER.MD`).

### 3.4 `apps/azes-ui` — Design system showcase

Token və `@azes/ui-web` komponentlərinin canlı nümayişi (`showcase/`, `phases/`, `lab/`).
Məhsul biznes məntiqi yoxdur; visual Playwright testləri buradan işlədilə bilər.

---

## 4. packages/ — platforma

On paket. Hələ **yoxdur** (plan/ADR-də “later”): `analytics`, `logger`, `feature-flags`,
`utils`, `constants`, `types` (ayrı paket kimi).

| Qovluq          | Paket                 | Nədir                                | Qeyd                                              |
| --------------- | --------------------- | ------------------------------------ | ------------------------------------------------- |
| `design-tokens` | `@azes/design-tokens` | React-siz tokenlər + CSS variables   | Export: `.`, `./css`, `./themes`, `./primitives`  |
| `ui-web`        | `@azes/ui-web`        | Web DS — MUI v9.3.1 + Emotion        | Çoxsaylı subpath export (aşağıda)                 |
| `ui-native`     | `@azes/ui-native`     | RN DS (token əsaslı)                 | MUI/Emotion **yox**; peer: react, react-native    |
| `api`           | `@azes/api`           | OpenAPI → Orval + TanStack Query     | Frontend client; `generated/**` əl ilə toxunulmur |
| `state`         | `@azes/state`         | Redux Toolkit (client state)         | Server cache **deyil**                            |
| `auth`          | `@azes/auth`          | Auth müqaviləsi + web/native adapter | Backend authoritative                             |
| `i18n`          | `@azes/i18n`          | i18next / react-i18next              | en / az / ru konvensiyası app-lərdə               |
| `validation`    | `@azes/validation`    | Zod sxemləri                         | OpenAPI-ni təkrarlamır                            |
| `permissions`   | `@azes/permissions`   | `resource.action` UX modeli          | Backend qərar verir                               |
| `testing`       | `@azes/testing`       | Test helper / coverage               | Export: `.`, `./web`, `./native`, `./coverage`    |

### 4.1 `@azes/ui-web` — subpath export-lar

| Import                                                            | Sahə                     |
| ----------------------------------------------------------------- | ------------------------ |
| `@azes/ui-web`                                                    | Theme, əsas primitivlər  |
| `…/brand`                                                         | Brand primary / seeds    |
| `…/settings`, `…/settings/ssr`                                    | Settings + SSR cookie    |
| `…/navigation`, `…/layout`, `…/menu`                              | Shell chrome             |
| `…/table`, `…/data-grid`, `…/charts`                              | Cədvəl / qrafik          |
| `…/forms`, `…/feedback`, `…/dialog` (via feedback)                | Form / snackbar / dialog |
| `…/side-panel`, `…/backdrop`, `…/skeleton`, `…/icons`, `…/locale` | Digər UI                 |

Daxili qovluqlar: `theme`, `layout`, `navigation`, `table`, `forms`, `skeleton`, …

### 4.2 `@azes/api` — OpenAPI client (frontend)

```text
packages/api/
├── openapi/
│   ├── azes/openapi.yaml     # AZES auth + LMS + org (cari məhsul kontraktı)
│   └── admin/swagger.json    # Legacy Caspian ADMIN (saxlanılıb)
├── generated/                # Orval output — NEVER hand-edit
│   ├── azes/{auth,courses,manage,orgs,quizzes,models}
│   └── admin/…
├── src/
│   ├── client/, config/, query/, mutations/
│   ├── azes/                 # facade barrels
│   └── admin/
└── scripts/                  # generate
```

Public import nümunələri:

| Import                   | Surface                                            |
| ------------------------ | -------------------------------------------------- |
| `@azes/api`              | configureApi, mutator, auth bridge, query defaults |
| `@azes/api/azes`         | AZES tag barrel                                    |
| `@azes/api/azes/auth`    | Auth hooks                                         |
| `@azes/api/azes/courses` | Kataloq / enroll / progress                        |
| `@azes/api/azes/manage`  | Manage write                                       |
| `@azes/api/azes/orgs`    | Org / tracks                                       |
| `@azes/api/azes/quizzes` | Quiz                                               |
| `@azes/api/admin`        | Legacy admin facade                                |

Generate: kök `pnpm api:generate` / `pnpm api:generate:check`.
Living snapshot: `docs/api/CURRENT-STATE.md`.

### 4.3 `@azes/design-tokens`

Framework-agnostic. Kateqoriyalar: color, typography, spacing, radius, shadow, breakpoint,
zIndex, motion, size. `ui-web` və `ui-native` hər ikisi buradan qidalanır.

---

## 5. tooling/

| Qovluq       | Paket                     | Rol                             |
| ------------ | ------------------------- | ------------------------------- |
| `eslint`     | `@azes/eslint-config`     | Flat ESLint + import boundaries |
| `prettier`   | `@azes/prettier-config`   | Format                          |
| `typescript` | `@azes/typescript-config` | Shared tsconfig presets         |
| `vitest`     | `@azes/vitest-config`     | Test preset                     |

Lint kökdə: ESLint (`eslint.config.js`). Format: Prettier. Biome **yoxdur**.
Git hooks: Husky + lint-staged.

---

## 6. docs/ və idarəetmə faylları

| Yol                                  | Məqsəd                                            |
| ------------------------------------ | ------------------------------------------------- |
| `docs/architecture/`                 | overview, dependency-graph, pages-and-features, … |
| `docs/api/CURRENT-STATE.md`          | API/Query living snapshot (Worker)                |
| `docs/styles/CURRENT-STATE.md`       | Theme/UI living snapshot (Dizayner)               |
| `docs/academy/`                      | RBAC / Track qərarları                            |
| `docs/decisions/`                    | ADR-lər                                           |
| `WORKER.md`                          | Phase protokolu + Academy §4b checkpoint          |
| `CLAUDE.MD` / `CHAT.MD` (+ `_DELTA`) | LMS icra planı / chat promptlar                   |
| `RUNNER.MD`                          | Lokal işəsalma                                    |
| `USERS.MD`                           | Demo rollar / parollar                            |
| `.cursor/rules/*.mdc`                | Agent rolları, page-architecture, boundaries…     |

Agent roster (qısa):

| Rol         | Sahə                                                         |
| ----------- | ------------------------------------------------------------ |
| Memar       | Yalnız plan + Worker/Dizayner prompt                         |
| Dizayner    | tokens / ui-web / theme                                      |
| Worker      | API client + feature səhifə                                  |
| Coordinator | full build / git / deploy                                    |
| İcraçı      | Academy LMS (`CLAUDE`+`CHAT`, `WORKER` §4b) — tam səlahiyyət |

---

## 7. Stack (cari disk)

| Sahə           | İndi                                                      |
| -------------- | --------------------------------------------------------- |
| Monorepo       | Turborepo + pnpm workspaces                               |
| Web SPA        | React 19 + TypeScript + Vite 7                            |
| API server     | Hono + Cloudflare Workers + D1 + R2 (`apps/api`)          |
| API client     | OpenAPI → Orval → `@azes/api` + TanStack Query            |
| Client state   | Redux Toolkit (`@azes/state`)                             |
| Web UI         | `@azes/ui-web` (MUI 9.3.1 + Emotion)                      |
| Mobile UI      | `@azes/ui-native` (paket var; mobil app bu ağacda yoxdur) |
| Validation     | Zod (`@azes/validation` + serverdə birbaşa zod)           |
| i18n           | i18next (app locale-ləri az/en/ru)                        |
| Test           | Vitest + Testing Library; E2E Playwright (`e2e/`)         |
| Lint / format  | ESLint + Prettier                                         |
| DB (local API) | Drizzle + D1 migrations                                   |

Kök skriptlər (seçmə): `pnpm build`, `dev`, `lint`, `typecheck`, `test`,
`api:generate`, `architecture:verify`.

---

## 8. Tipik lokal axın (Academy)

```text
1) apps/api     → wrangler dev          (:8787)
2) seed         → seed:role-users / seed:lms
3) apps/account → vite :100             (login)
4) apps/academy → vite :200             (LMS UI)
5) VITE_API_BASE_URL → http://127.0.0.1:8787
```

Kontrakt dəyişəndə: `packages/api/openapi/azes` → `pnpm api:generate` → app feature-lar
generated hook-lardan istifadə edir.

---

## 9. Köhnə target app-lər (bu ağacda yox)

Arxitektura sənədləri hələ də bəzən bunları “target” kimi göstərir; **cari `apps/`
qovluğunda yoxdurlar**:

- `admin`, `agent-platform`, `agent-site`, `realestate`
- `mobile-account`, `mobile-agent`, `mobile-realestate`

Onlar gələcəkdə yenidən əlavə oluna bilər; bu hesabat yalnız diskdəki faktı əks etdirir.
`packages/api/openapi/admin` + `generated/admin` legacy Caspian kontraktı kimi qalır.

---

## 10. Qaydalar (hələ qüvvədə)

1. App başqa app-i idxal etmir.
2. Generated OpenAPI (`packages/api/generated/**`) əl ilə dəyişdirilmir.
3. Server state = TanStack Query; client state = Redux Toolkit.
4. `ui-web` / `ui-native` API, auth və biznes bilmir.
5. Web və native UI ayrı paketdir; ortaq mənbə yalnız `design-tokens`.
6. Özəllik yalnız bir neçə məhsul eyni koda ehtiyac duyanda `packages/`-ə çıxarılır.
7. Hər comment-dəstəkləyən faylda AZES header (JSON istisna).
8. Yeni səhifə: `page-architecture.mdc` + i18n **en+az+ru** eyni tapşırıqda.

Ətraflı: `docs/architecture/overview.md`, `dependency-graph.md`, `WORKER.md`.
)
