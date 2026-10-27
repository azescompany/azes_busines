<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/api/CURRENT-STATE.md
║ Author: AZES_COMPANY
║ Created: 2026-10-09
║ Updated: 2026-10-27
║ Purpose: Living snapshot of AZES API / Query / auth-bridge for Agent Worker
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# API / Query current state

Living snapshot for [Agent Worker](../../.cursor/rules/apiMenecerAgent.mdc). Keep this
file short and factual. After each API/runtime change: update **How it works now** if needed,
then append one line under **Delta log**. Prefer this over re-auditing `packages/api` every chat.

Authoritative long-form: [api-architecture.md](../architecture/api-architecture.md),
[`packages/api/structure_api.md`](../../packages/api/structure_api.md).  
Codegen hard rules: `.cursor/rules/api-generation.mdc`.

---

## How it works now (2026-10-20)

### Stack

| Layer          | Package / entry                           | Role                                                                    |
| -------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| HTTP runtime   | `apps/api` (`@azes/api-server`)           | Hono + Workers + D1 (+ R2 FILES) — auth + LMS read/manage               |
| Spec (AZES)    | `packages/api/openapi/azes/openapi.yaml`  | Auth + LMS + tenant + units + modules + ERP + /me access (v0.20)        |
| Spec (ADMIN)   | `packages/api/openapi/admin/swagger.json` | Legacy Caspian ADMIN OpenAPI (non-auth leftovers)                       |
| Generate       | Orval → `generated/azes/**` + `admin/**`  | Hooks + models — **never hand-edit**                                    |
| Facade         | `@azes/api/azes` + `@azes/api/admin`      | Tag barrels; Academy uses `@azes/api/azes` (+ `/courses                 | /manage`) |
| Transport      | `@azes/api` → `azesMutator`               | Bearer, device, timeout, 401/402/403; `FORBIDDEN` does not kill session |
| Query defaults | `apiQueryDefaultOptions`                  | stale 30s, gc 5m, retry 1, no focus refetch                             |
| Auth bridge    | getters/handlers on `@azes/api`           | Injected from apps via `@azes/auth`                                     |

Phase 2C: Account/Academy use AZES auth (`/api/v1/auth/*`, `refreshAccessTokens` body
`{ refreshToken, deviceId }`). Point `VITE_API_BASE_URL` at Worker (`http://127.0.0.1:8787`).

LMS: manage write via `/api/v1/manage/*`; student catalog/enroll via `/api/v1/courses*`
(+ Track filter). Academy `#/catalog`, `#/my-programs`, `#/manage/*` → `@azes/api/azes`.

### Public exports (`packages/api/package.json`)

| Import                   | Surface                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `@azes/api`              | Foundation: configure, mutator, auth bridge, device, errors, query defaults/keys, invalidate |
| `@azes/api/azes`         | AZES auth + courses + manage generated hooks/types                                           |
| `@azes/api/azes/auth`    | Auth tag only                                                                                |
| `@azes/api/azes/courses` | LMS catalog + enroll                                                                         |
| `@azes/api/azes/manage`  | LMS write tag                                                                                |
| `@azes/api/admin`        | ADMIN generated hooks/types via facade (legacy Caspian)                                      |

### Runtime flow

```text
App boot
  configureApi({ baseUrl })
  optional seedDeviceId(env | cookie | handoff)
  QueryClient({ defaultOptions: apiQueryDefaultOptions })
  create*AuthClient → connectAuthToApi (getter + refresh handler)
  setAuthSessionInvalidatedHandler → clear session + redirect Account

Authenticated shell (admin)
  useAdminMenusNav → useGetApiV1MenusUserMenu({ enabled: isAuthenticated })
  (no second user-menu prefetch in AppProviders)

Feature pages
  generated hooks OR feature service/query wrappers (e.g. usersKeys + useUsersList)
  mutations → invalidate smallest key set
```

### Mutator / status policy (current)

- Anonymous: login + refresh-token URLs strip `Authorization`.
- `401` → single-flight `tryRefreshAccessToken` → one retry; else session invalidated.
- `403` (non-login) → session invalidated; `402` → payment handler (admin currently `null`).
- Device: `X-Device-Id` + `DeviceId`; JSON write bodies enrich `deviceId` / UA / platform / language
  from **atomic** `azes.device.meta` (never bare id + live navigator). Account→admin handoff
  hash carries the full fingerprint; incomplete `VITE_DEVICE_ID` without UA is ignored.

### App adoption

| App       | `configureApi`                | Auth → API                               | Query usage notes                                                |
| --------- | ----------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `account` | yes (`accountEnv.apiBaseUrl`) | `createAccountAuth`                      | Login via `@azes/api/azes`; refresh `{ refreshToken, deviceId }` |
| `admin`   | yes (`adminEnv.apiBaseUrl`)   | `createAdminAuth` + `#azes_auth` consume | Port **200**; L-shell Home-only; Account post-login handoff      |
| `azes-ui` | showcase                      | n/a                                      | Design system demo                                               |
| `api`     | n/a (is the server)           | Phase 2B `/api/v1/auth/*`                | Local Wrangler + D1; seed `local.dev` (see apps/api README)      |

Account post-login `returnUrl` allowlist: admin origin (default), agent-site
(`VITE_AGENT_SITE_APP_URL`), **and** marketplace (`VITE_REAL_ESTATE_SITE_APP_URL`,
default `http://localhost:400`). Unknown origins fall back to admin — same `#azes_auth` v1
payload. Caspian Login / rail Account CTA sends `returnUrl=window.location.href` so
post-login returns to marketplace (not admin).
Agent-site owner/configure shell can “Back to admin panel” → Account with `returnUrl=admin`
(no `azes_stay`); Account clears suppress-auto so an existing session handoffs to admin.
Admin Site dialog also opens Caspian Key marketplace via `VITE_REAL_ESTATE_SITE_APP_URL`
(default `http://localhost:400` → `/{locale}`).

### File map (edit here first)

| Concern                  | Primary paths                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Mutator / status         | `packages/api/src/client/mutator.ts`                                                                      |
| Token getter             | `packages/api/src/client/auth-token.ts`                                                                   |
| Refresh single-flight    | `packages/api/src/client/auth-refresh.ts`                                                                 |
| Refresh HTTP             | `packages/api/src/client/refresh-tokens.ts`                                                               |
| Session/payment handlers | `packages/api/src/client/auth-status.ts`                                                                  |
| Device meta              | `packages/api/src/client/device-meta.ts`                                                                  |
| baseUrl config           | `packages/api/src/config/env.ts`                                                                          |
| Query defaults           | `packages/api/src/config/query-defaults.ts`                                                               |
| Keys / invalidate        | `packages/api/src/query/keys.ts`, `mutations/invalidate.ts`                                               |
| Public barrel            | `packages/api/src/index.ts`                                                                               |
| ADMIN facade             | `packages/api/src/admin/**` (regen: `generate:facade`)                                                    |
| Orval                    | `packages/api/orval.config.ts`                                                                            |
| Admin providers          | `apps/admin/src/providers/AppProviders.tsx`                                                               |
| Admin auth bridge        | `apps/admin/src/auth/createAdminAuth.ts`                                                                  |
| Account auth bridge      | `apps/account/src/auth/createAccountAuth.ts`                                                              |
| Users feature            | `apps/admin/src/features/users/` + thin `pages/users` (`usersKeys`, RHF+zod forms)                        |
| Ads / Elanlar page       | `apps/admin/src/features/ads/` + thin `pages/ads` (`adsKeys`, RHF+zod forms)                              |
| User ads page            | `apps/admin/src/features/user-ads/` + thin `pages/user-ads` (`userAdsKeys`, `/user-announcement`)         |
| Sold items page          | `apps/admin/src/features/sold-items/` + thin `pages/sold-item` (`soldItemsKeys`, `/sold-item`)            |
| Menus page               | `apps/admin/src/features/menus/` + thin `pages/menus` (`menusKeys`, `/menus`)                             |
| Plans page               | `apps/admin/src/features/plans/` + thin `pages/plans` (`plansKeys`, `/plans`)                             |
| Budgets page             | `apps/admin/src/features/budgets/` + thin `pages/budgets` (`budgetsKeys`, `/budgets`)                     |
| Organizations page       | `apps/admin/src/features/organizations/` + thin `pages/organizations` (`organizationsKeys`)               |
| Roles page               | `apps/admin/src/features/roles/` + thin `pages/roles` (`rolesKeys`, `/roles`, RoleCard grid)              |
| Role↔Menus page          | `apps/admin/src/features/role-menus/` + thin `pages/role-menus` (`roleMenusKeys`, `/role-specific-menus`) |
| Cities page              | `apps/admin/src/features/cities/` + thin `pages/cities` (`citiesKeys`, `/cities`, read-only)              |
| Contacts page            | `apps/admin/src/features/contacts/` + thin `pages/contacts` (`contactsKeys`, `/contacts`, read-only)      |
| Profile (rail dialog)    | `apps/admin/src/features/profile/` — `GET /users/profile` + `PUT /users/profile/{id}` (`profileKeys`)     |
| Dashboard                | `apps/admin/src/features/dashboard/` + thin `pages/dashboard` (`dashboardKeys`, `/{locale}/dashboard`)    |
| Shell menus query        | `apps/admin/src/navigation/useAdminMenusNav.ts`                                                           |

### Feature page model (new pages)

Authoritative: `.cursor/rules/page-architecture.mdc` +
`docs/architecture/pages-and-features.md` (ADR-018).

```text
pages/<feature>/index.tsx          # thin
features/<feature>/
  index.ts                         # public API
  components/ (View, Form, Filters, Table…)
  columns/ | hooks/ | service/ (*Api + *Queries) | models/ (schema, mappers)
```

- Examples: `pages/users` → `UsersView`; `pages/ads` → `AdsView`; `pages/user-ads` → `UserAdsView`.
- API runtime: `apiMenecerAgent.mdc`. UI theme: `uiDesignAgent.mdc`.

### Topic doc map

| Task               | Read                                             |
| ------------------ | ------------------------------------------------ |
| Strategy / ADR     | `docs/architecture/api-architecture.md`, ADR-003 |
| Package audit      | `packages/api/structure_api.md`                  |
| Codegen rules      | `.cursor/rules/api-generation.mdc`               |
| Query vs Redux     | `.cursor/rules/state-management.mdc`             |
| Agent + page build | `.cursor/rules/apiMenecerAgent.mdc`              |

---

## Delta log

Newest first. One bullet per change set. Format:
`YYYY-MM-DD — what changed — files/exports — how it works now (one clause)`.

- 2026-10-20 — **Academy role nav**: `GET /me` → `nav[]` (`id`/`path`/`i18nKey`) from
  `navCatalog`; OpenAPI `azes` v0.12; Academy renders only server nav; unauthorized hash →
  NotFound (no Forbidden page mount). Mutator skips session kill on `error.code=FORBIDDEN`.
- 2026-10-20 — **Academy LMS M7**: `/me/dashboard`, notifications, bookmarks, certificates
  (+ verify), manage analytics; OpenAPI `azes` v0.11 + `@azes/api/azes/dashboard`;
  Academy overview + `#/notifications|certificates|manage/analytics`.
- 2026-10-20 — **Academy LMS M6**: quizzes/questions/attempts + assignments/submissions;
  server grading/timer/attempt limit/idempotency; OpenAPI `azes` v0.10 + `@azes/api/azes/quizzes`;
  Academy `#/quizzes`, `#/manage/quizzes`.
- 2026-10-20 — **Academy LMS M5**: `PUT …/modules/reorder`, `PUT …/lessons/reorder`,
  `POST …/archive` (lesson/module/course, soft); OpenAPI `azes` v0.9; Academy manage
  ↑↓ + preview + archive UI.
- 2026-10-20 — **Academy LMS M4**: `GET /lessons/{id}`, `POST …/complete` (idempotent),
  `GET /courses/{id}/progress`, `GET /me/learning`, HMAC signed `GET /files/{id}/content`;
  OpenAPI `azes` v0.8; Academy `#/learn` + lesson player.
- 2026-10-20 — **Academy LMS M3**: student catalog Track filter (`accessibleCourseIds`);
  idempotent `POST /api/v1/courses/{courseId}/enroll`; OpenAPI `azes` v0.7 + Orval
  `postApiV1CoursesCourseIdEnroll`; Academy `#/catalog`, `#/catalog/:slug`, `#/my-programs`.
- 2026-10-20 — **Academy LMS M2.5**: permission nav + `#/manage/orgs|tracks|assign`; Orval
  `putApiV1UsersUserIdTracks` / track courses; UI «Tədris proqramı».
- 2026-10-20 — **Academy LMS M1b**: `organizations`/`tracks`/`user_tracks`; permission map;
  JWT `orgId` + `GET /me` permissions; `/api/v1/orgs|/tracks`; OpenAPI `azes` v0.6; legacy
  `admin`→`orgAdmin` normalize (not superAdmin).
- 2026-10-20 — **Academy LMS Mərhələ 2**: manage write APIs (course/module/lesson/publish +
  R2 `POST /api/v1/manage/files`); sanitize + mime/5MB checks; OpenAPI `azes` v0.5 + Orval
  `manage`; `@azes/api/azes/manage`; Academy `#/manage/courses` + primaryNav (staff roles).
- 2026-10-20 — **Phase 2F** session surface: `GET /api/v1/me` (Bearer) →
  `{ userId, username, roles, status }`; OpenAPI `0.3.0` + Orval; Academy
  `useAcademyMe` prefers server username/role in shell account menu.
  `@azes/api` azes facade emits **explicit named** value exports (Vite-safe);
  `useAcademyMe` imports `getApiV1Me` from `@azes/api/azes/auth`.
- 2026-10-19 — **Phase 2E** auth hardening: atomic refresh rotate + revoked-token
  family revoke; `CORS_ALLOWED_ORIGINS` + `API_ENV` (prod disables localhost CORS
  fallback); D1 transactional rotate; `auth_rate_limits` → `429 RATE_LIMITED` +
  `Retry-After`; OpenAPI `0.2.1` + Account `errors.rateLimited` (en/az/ru).
- 2026-10-19 — **Phase 2C** auth client cutover: `openapi/azes` + `@azes/api/azes`;
  `refreshAccessTokens` → `/api/v1/auth/refresh` + `deviceId`; Account login
  `usePostApiV1AuthLogin`; Academy refresh aligned; env examples → `:8787`.
- 2026-10-19 — **Phase 2B** `@azes/api-server` auth HTTP: `POST /api/v1/auth/login|refresh|logout`
  (PBKDF2-SHA-256, jose HS256 access JWT TTL 900s, refresh SHA-256 + rotation);
  memory repo tests + `seed:local-user`.
- 2026-10-20 — **Academy LMS Mərhələ 1**: D1 tables (categories/courses/modules/lessons/
  enrollments/lesson_progress/file_assets); Bearer read APIs (`/categories`, `/courses`,
  curriculum, `/me/enrollments`); role authz; OpenAPI `azes` v0.4 + Orval `courses` tag;
  local `seed:lms`. UI səhifələri yoxdur (Mərhələ 2+).
- 2026-10-19 — **Phase 2A** `@azes/api-server` (`apps/api`): Hono + Workers + D1 +
  Drizzle auth foundation (`users` / `roles` / `user_roles` / `refresh_sessions`);
  `GET /health` + `GET /api/v1/health` + JSON `NOT_FOUND` / error envelope; no login
  endpoints; no Orval regen; Account/Academy auth flows untouched. Phase 2C cuts
  OpenAPI clients to AZES.
- 2026-10-15 — Caspian **SSR SEO**: RSC `prefetchHomeQueries` /
  `prefetchListingQueries` + `dehydrate` / `HydrationBoundary` on home +
  `listings/[id]`; `generateMetadata` from `getById`; sitemap adds up to 200
  listing URLs; `ensureServerApiConfigured` for RSC mutator. Keys match
  `homeKeys.listingsCarousel` / `propertiesKeys.detail`. AppProviders no
  longer `return null` pre-auth — `use(getCaspianI18n)` + root `Suspense`
  so Ctrl+U HTML includes listing text.
- 2026-10-15 — Caspian `PropertyType` + **garage** (`Qaraj`); labels match list
  Mənzil / Həyət evi / Ofis / Qaraj / Torpaq / Obyekt; API filter uses localized
  `PropertyTypeName` Contains tokens; mock + bento + search filters updated.
- 2026-10-15 — Caspian home featured carousel: `useHomeListingsCarousel`
  infinite Query pageSize 8, max 24 (`HOME_LISTINGS_MAX`); prefetch from UI at
  7th / 15th slide; then loop only (no more requests).
- 2026-10-15 — Caspian home CRM inquiry form (`HomeInquiryForm`) submits
  `leadRepository` `type: 'contact'` with structured message (inquiry/role/
  property fields); phone + consent required (same spam guards as `LeadForm`).
- 2026-10-14 — `@azes/auth` `AuthProvider`: `'use client'` +
  `sideEffects: [./dist/react/AuthProvider.js]` so Next App Router accepts
  context/hooks; `real-estate-site` `transpilePackages` includes `@azes/auth`
  (parity with agent-site). Rebuild `pnpm --filter @azes/auth build` after
  source change.
- 2026-10-14 — Marketplace `getById`: **`GET /api/v1/ad/{id}`** + one
  `/adattachment` enrich (no `/ad/all/table` page scan — scan missed older ads
  and spammed table). Detail hook merges TanStack cache from home/search when
  GET DTO is sparse. `getSimilar` = one unfiltered table page, enrich slice only.
  Still **never** Id-filter `/ad/all/table` (500 SUBSCRIPTION_CHECK_ERROR).
  (`createApiPropertyRepository`, `usePropertyDetail`)
- 2026-10-14 — Caspian search discovery: `usePropertySearchInfinite` +
  `SEARCH_LISTINGS_PAGE_SIZE=8` (scroll load); home featured teaser pageSize 8
  then CTA to `/search`. Same `POST /ad/all/table` via PropertyRepository.
- 2026-10-14 — Marketplace **private data after Account login**: session-aware
  property repo — anon + `DATA_SOURCE=mock` → mock; Bearer from `#azes_auth`
  handoff → live `/ad/all/table`; handoff invalidates Query cache; header shows
  Signed in. (`createSessionAwarePropertyRepository`, `AppProviders`, shell)
- 2026-10-14 — Caspian Login / rail Account: `redirectToAccountLoginFromMarketplace`
  sends `returnUrl=window.location.href` + `azes_stay` → Account allowlists
  marketplace origin → post-login `#azes_auth` handoff returns to real-estate-site
  (not admin default). (`CaspianSiteShell`, `redirectToAccountLogin.ts`)
- 2026-10-13 — Marketplace listing photos: after `/ad/all/table`, each row loads
  `GET /api/v1/adattachment/ad/{adId}` (`enrichPropertyImages` +
  `listAdImageUrls`); empty/broken → ListingCard “image not found” placeholder.
- 2026-10-13 — Marketplace **Account handoff** (temporary): Admin Site Entry →
  Account (`returnUrl` marketplace, `azes_stay`) → `#azes_auth` →
  `real-estate-site` auth bridge (`createRealEstateSiteAuthClient`) +
  `POST /api/v1/ad/all/table`. Account allowlists
  `VITE_REAL_ESTATE_SITE_APP_URL`. Anon 401 still falls back to mock; session
  invalidation redirects only when previously authenticated.
- 2026-10-13 — `real-estate-site` marketplace listings: `configureApi({ baseUrl:
siteEnv.apiBaseUrl })` + `NEXT_PUBLIC_API_BASE_URL`; when set,
  `createApiPropertyRepository` uses `POST /api/v1/ad/all/table` +
  `normalizeAdsTableResponse` / `mapAdToProperty`, wrapped in
  `createResilientPropertyRepository` (anon 401 / network → mock so local UI
  still loads). Empty base URL = mock only.
- 2026-10-11 — Ads **add-to-work** hardening (`POST /usersads/work`) — capture `adId`
  at dialog open; in-flight guard; `autoFocus: 'cancel'` (focus-steal double-post
  risk); details→confirm deferred after close; sold rows blocked; mutator
  `AzesApiError.message` now prefers response body text (400 text/plain visible in
  dialog). Invalidate `['admin','user-ads']` on success.
- 2026-10-11 — Admin **Dashboard** normalize fix — OpenAPI
  `DashboardSummaryResponse` still `allUsers*`; admin runtime returns per-user
  array (`userName`, `userAdsCount`, `userAdsTotalPrice`, `soldAdsCount`,
  `soldAdsTotalPrice`, `buyerTotalPaymentAmount`, `sellerTotalPaymentAmount`,
  `color`). `normalizeDashboardSummary` maps both; KPI/table/CSV use runtime
  fields. **Swagger regen still needed** for admin/summary schema accuracy.
- 2026-10-11 — Admin **Dashboard** (`features/dashboard/`) — shell `index` +
  `/{locale}/dashboard` both render `DashboardView`; auth-lab/design-lab redirect
  home; logo/goHome → dashboard. KPI/slides:
  `POST /api/v1/ad/dashboard/summary`; Admin/SuperAdmin table also
  `POST /api/v1/ad/dashboard/admin/summary` via `dashboardKeys` + `useQuery` +
  `normalizeDashboardSummary`. Period `?period=` default `Today`
  (`Today|ThisWeek|ThisMonth|LastOneYear`). Evaluation blocked in view. CSV v1.
  No Redux statistics slice; no Swiper/Recharts.
- 2026-10-11 — Admin **Profile** rail sheet (`features/profile/`) — mini-rail **Profile**
  opens full-screen bottom `Drawer`; loads `GET /api/v1/users/profile` (OpenAPI typed as
  `UserProfileUpdateRequest`) via `profileKeys.current`; save `PUT /api/v1/users/profile/{id}`
  (password blank → null; `colorCode` display-only). Wired in `AdminShell` beside Docs/AI.
- 2026-10-11 — Admin **Contacts** page (`features/contacts/`, `/contacts`) — read-only
  `GET /api/v1/contacts/table` → `ContactTableResponse` (phones/email/owner/`isDeleted`);
  client search + AzesTable; **no CRUD** UI.
- 2026-10-11 — Admin **Cities** page (`features/cities/`, `/cities`) — read-only
  `GET /api/v1/cities` → `CityTableResponse` (`id`/`name`/`isDeleted`); client filters +
  AzesTable; **no CRUD** UI (POST/PUT/DELETE exist in OpenAPI but unused here).
- 2026-10-11 — **Device fingerprint iron fix** (`packages/api` `device-meta`) — persist
  full `{deviceId,userAgent,platform,language}` under `azes.device.meta`; orphan bare
  `azes.device.id` discarded when it no longer matches live hash; Account handoff + Admin
  seed carry full meta; `VITE_DEVICE_ID` without `VITE_DEVICE_USER_AGENT` ignored. Fixes
  recurring localhost→prod login **400** after UA/language drift / half env seeds.
- 2026-10-11 — Admin **Roles** rewritten (`features/roles/`, `/roles`) — RoleCard grid
  (not table) + create/edit accordion + delete dialog; list still `GET /api/v1/roles`
  (runtime Role rows; OpenAPI wrongly MenusInRole). Write path uses `azesMutator`
  `POST/PUT/DELETE /api/v1/roles[/{id}]` with `{ name, description }` — **not in OpenAPI
  yet** (provisional until swagger regen). Menu assign moved to Role↔Menus.
- 2026-10-11 — Admin **Role↔Menus** route path → `/role-specific-menus` (`PATHS.roleMenus`).
- 2026-10-11 — Admin **Role↔Menus** page (`features/role-menus/`, `/role-specific-menus`) —
  list `GET /api/v1/roles/menus` flattened to role/menu rows; assign
  `POST /api/v1/roles/menus` + dropdowns `GET /roles/dropdown` + `GET /menus/dropdown`
  (`roleMenusKeys`).
- 2026-10-11 — Admin **Roles** page (initial) — list + menu assign on `/roles` (superseded
  by Role↔Menus split above).
- 2026-10-11 — Admin **Organizations** page (`features/organizations/`, `/organizations`) —
  `GET/POST /api/v1/organizations` + `PUT/DELETE /api/v1/organizations/{id}` via
  generated clients + `organizationsKeys` + client filters; OpenAPI Add/Update have
  **no FK dropdown fields** (scalars/booleans only); mutations also invalidate
  sibling `organizations-dropdown` query caches.
- 2026-10-11 — Admin **Budgets** page (`features/budgets/`, route `/budgets`) —
  mount loads `GET /api/v1/organizations/dropdown`; org pick (URL `?org=`, no default)
  enables `GET /api/v1/adminbudget/organization/{id}/budgets` via `budgetsKeys` +
  open filter accordion + read-only AzesTable.
- 2026-10-11 — Agent Worker roster rename + slim rule — `apiMenecerAgent.mdc`,
  `coordinator-agent.mdc` — encyclopedia stays here; Worker suggests gates only.
- 2026-10-11 — Admin **Plans** page (`features/plans/`, route `/plans`) —
  `GET/POST /api/v1/adminplan/plans` + `PUT/DELETE /api/v1/adminplan/plans/{planId}` via
  generated clients + `plansKeys` + client filter/pagination + RHF+zod CRUD.
- 2026-10-11 — Admin **Menus** page (`features/menus/`, route `/menus`) —
  `GET/POST /api/v1/menus` + `PUT/DELETE /api/v1/menus/{id}` via generated clients +
  `menusKeys` + client filter/pagination + RHF+zod CRUD (no frontend role guard).
- 2026-10-11 — Admin **Sold items** page (`features/sold-items/`, route `/sold-item`) —
  `POST /api/v1/ad/users/sold/table` via `postApiV1AdUsersSoldTable` +
  `normalizeSoldItemsTableResponse` + URL-synced filters/pagination; sell mutation
  also invalidates `soldItemsKeys.table()`.
- 2026-10-10 — Table paging bodies: always send `filters: []` + `sortOptions: []`
  (never `filters: null`) — production `/ad/users/table` returns 500 on null filters;
  fixed in `userAdsQueries` / `adsQueries` / `usersQueries`.
- 2026-10-10 — Admin **User ads** page (`features/user-ads/`, route `/user-announcement`) —
  `POST /api/v1/ad/users/table` via `postApiV1AdUsersTable` + CRUD/attachments (no
  `postApiV1AdTable`, no `usersads/work`) — reuses ads `normalizeAdsTableResponse` /
  `AdDetailsContent` / `AdThumbnail` from `@/features/ads` public API; shell
  `isUserAdsPath` + lazy `pages/user-ads`.
- 2026-10-10 — Admin Users + Ads → thin `pages/*` + feature modules (RHF+zod, `*Queries`,
  `PATHS`, page-architecture rules/ADR-018) — behavior unchanged; new screens copy Users.

- 2026-10-10 — Admin Ads migrated to pages/features (`pages/ads` → `AdsView`) —
  `service/adsQueries` (`adsKeys` / `useAdsList` / CRUD + add-to-work + attachments),
  RHF+zod AdForm/AdsFilters — filter/pagination local; no Redux slice; shell
  imports `@/pages/ads` + `isAdsPath` from `@/features/ads`.
- 2026-10-10 — Admin Users migrated to pages/features (`pages/users` → `UsersView`) —
  `service/usersQueries` (`usersKeys` / `useUsersList` / CRUD mutations), RHF+zod forms —
  filter/pagination stay local React state; no Redux slice; shell imports `@/pages/users`.
- 2026-10-09 — Ads page: row thumbnails via `GET /api/v1/adattachment/ad/{adId}` +
  “add to my work” via `POST /api/v1/usersads/work` (`adId`) with + tooltip —
  `AdThumbnail`, columns/actions, i18n.
- 2026-10-09 — Admin **Ads / Elanlar** page (`features/ads/`, route `/announcement`) —
  `POST /api/v1/ad/table` + `DELETE /api/v1/ad/{id}`, folder model, i18n en/az/ru —
  menu id 3 opens server-paged listings grid (same shell fill pattern as Users).
- 2026-10-09 — API Manager Agent gains **feature page build protocol** (folder model,
  page-scoped APIs, UI compose) — `apiMenecerAgent.mdc`, `apps.mdc`, this snapshot —
  “write X page” tasks use `features/<name>/` with hooks/models/services/components as needed.
- 2026-10-09 — Introduced API Manager Agent rule + this snapshot —
  `.cursor/rules/apiMenecerAgent.mdc`, `docs/api/CURRENT-STATE.md`, parent-rule pointers —
  agents attach `apiMenecerAgent` and read this file before API/Query/auth-bridge work instead
  of full-platform re-audit.
- 2026-10-26 — **TAGET M1 Tenant Core**: OpenAPI **0.14** membership/invite/active-org;
  migration `0006_tenant_membership`; Admin Orgs/Users/OrgSwitcher; api-server 81 tests PASS.
- 2026-10-26 — **TAGET M1.5 Menu RBAC**: OpenAPI **0.15** `menus`/`roles`/`roles/{role}/menus`;
  migration `0007_menu_rbac`; `GET /me` nav+permissions DB UNION; AdminShell `me.nav` +
  `roleMenus` feature; `@azes/api/azes/menus` facade export.
- 2026-10-26 — **TAGET M1.6–M4 ERP Authz**: OpenAPI **0.16** (bootstrap note); live
  `requirePermission`→`effectiveCan`; migrations `0008`–`0011` (platform_modules, hierarchy,
  user access, audit+crm); Admin `useSessionMe` + `checkPermission` + Customers page;
  routes `/modules`, `/permission-profiles`, `/users/:id/access`, `/audit-logs`, `/crm/customers`.
- 2026-10-26 — **TAGET M5.0-lite SuperAdmin Tenant Console**: OpenAPI **0.17**; migration
  `0012_org_subscription_color` (org `description`/`color_code`/`subscription_status`/`trial_ends_at`,
  `member` role + `member-default` profile, `platform-roles` menu); `POST/GET /api/v1/users`,
  `GET/POST/PATCH/DELETE /api/v1/platform-roles`; Admin Orgs/Users CRUD + User access + Platform
  roles UI; `@azes/api/azes/users` + `@azes/api/azes/platform-roles` exports; api-server 93 tests.
- 2026-10-27 — **Access Control Phase 02 (AC-D05 A):** trusted request context
  (`trustedRequestContext` / `getTrustedRequestContext` from JWT `sub`/`sid`/`orgId`/`roles`);
  JWT `permissions[]` still emitted (compat) but **not** authoritative —
  `claimHasPermission` roles-only; live `requirePermission`→`effectiveCan` unchanged;
  XSS note for JS-readable `accessToken` cookie in `PHASE-2B-AUTH-CONTRACT.md`;
  no OpenAPI/Orval change; SSO HttpOnly redesign out of scope.
- 2026-10-27 — **Access Control Phase 03 (AC-D02 A):** `organization_units` +
  `unit_memberships` (migration `0013`); `/api/v1/orgs/:orgId/units*` CRUD + unit
  members; `users.org_id` documented as active pointer; active-org switch requires
  active membership; cross-tenant IDOR + AC-D07 LMS invite≠ERP admin tests;
  OpenAPI **0.18** + Orval; unit UI deferred to Phase 07.
- 2026-10-27 — **Access Control Phase 04 (AC-D08 A):** entitlement helper
  (`access/entitlementPolicy` + repository); soft-disable org modules (no data delete);
  CRM gated by module entitlement + subscription (blocked / read-only / trial expired);
  `/me` nav+perm dual-read filter; migration `0014_subscription_read_only`;
  OpenAPI **0.19** (`/modules`, org modules); full plans deferred; UI → Phase 07.
- 2026-10-27 — **Access Control Phase 05 (AC-D01/D03/D07 A):** CRUD→code
  `permissionMapper`; `user_menus`/`user_menu_permissions` in `effectiveAccess` dual-read;
  delegation ceiling (`delegation.ts`) on user-access grants; SuperAdmin not
  ordinary-assignable (platform-roles / role-menus / invite); `data_scope.subtree` =
  unit tree (sync fails closed); LMS invite ≠ ERP `org.manage_all`; audit on sensitive
  grants; OpenAPI unchanged **0.19**; full Access Resolver → Phase 06.
- 2026-10-27 — **Access Control Phase 06 (AC-D04/D06 A):** central
  `access/effectiveAccess.resolveEffectiveAccess` for `requirePermission` + `GET /me`;
  `menu/effectiveAccess` thin wrap (no parallel truth); additive `/me`
  `modules` + `scopeSummary` (`org|own|subtree`) + stable `accessVersion`;
  `ACCESS_RESOLVER_MODE=legacy|unified` (default unified); OpenAPI **0.20** + Orval;
  no `/me/access`; UI → Phase 07.
- 2026-10-27 — **Orval facade fix:** platform `/modules` + org module entitlement
  moved to OpenAPI tag `modules` → `@azes/api/azes/modules` (was under `orgs`,
  Vite named-export drift after regen). Admin Vite cache clear + `pnpm dev` restart.
- 2026-10-27 — **Access Control Phase 07 (Admin UI):** consume `/me`
  `nav`/`modules`/`accessVersion`; org-switch + role-menu + user-access invalidate;
  UserAccess CRUD→code labels; org detail modules + units (OpenAPI); subscriptionReadOnly
  chip/toggle; i18n en+az+ru. No OpenAPI bump.
