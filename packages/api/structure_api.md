<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/api/structure_api.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Current structure/audit report for packages/api (ADMIN OpenAPI)
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/api` — struktur audit və hesabat

Hesabat tarixi: **2026-10-04**.  
Mənbə: diskdəki `packages/api/**` (OpenAPI, Orval output, facade, foundation).

---

## 1. Qısa nəticə

| Əvvəl (Phase 6 scaffold)                 | İndi                                                     |
| ---------------------------------------- | -------------------------------------------------------- |
| Yalnız placeholder OpenAPI (`paths: {}`) | **ADMIN** real contract: `openapi/admin/swagger.json`    |
| `generated/` demək olar ki, boş          | `generated/admin/` — 258 fayl (26 tag + 231 model)       |
| Public export yalnız `@azes/api`         | `@azes/api` **və** `@azes/api/admin`                     |
| App-lər yalnız `apiQueryDefaultOptions`  | ADMIN hooks/types hazırdır; app wiring hələ ayrıca işdir |

Vəziyyət: **ADMIN API generated + facade READY**. Foundation (mutator, auth, errors, query defaults) saxlanılıb və genişləndirilib.

```ts
import { configureApi, apiQueryDefaultOptions } from '@azes/api';
import {
  usePostApiV1AccountsLogin,
  useGetApiV1Organizations,
  useGetApiV1AdminbudgetOverdue,
} from '@azes/api/admin';
```

---

## 2. Paket kimliyi

| Sahə      | Dəyər                                           |
| --------- | ----------------------------------------------- |
| Paket     | `@azes/api` `0.0.0` (private, ESM)              |
| Məqsəd    | OpenAPI → Orval → typed client + TanStack Query |
| ADR       | ADR-003 (Orval), ADR-002 (server state = Query) |
| Runtime   | `@tanstack/react-query`                         |
| Peers     | `react`, `@tanstack/react-query`                |
| Generator | Orval `^7.10` (runtime generate: v7.21.0)       |

### Public exports

| Import            | Fayl                                |
| ----------------- | ----------------------------------- |
| `@azes/api`       | `dist/src/index.js` + `.d.ts`       |
| `@azes/api/admin` | `dist/src/admin/index.js` + `.d.ts` |

### Asılılıq sərhədləri (qorunur)

Paket **asılı deyil**: `@azes/ui-web`, `@azes/ui-native`, `@azes/state`, `@azes/auth`.  
Auth körpüsü injection ilədir (`setAccessTokenGetter` / `setAccessTokenRefreshHandler`).

---

## 3. Disk strukturu (cari)

```text
packages/api/
├── package.json                 # exports: "." + "./admin"
├── package.md
├── README.md
├── structure_api.md             # bu hesabat
├── tsconfig.json                # rootDir "." — src + generated/admin → dist/
├── vitest.config.ts
├── orval.config.ts              # projects: placeholder + admin
│
├── openapi/
│   ├── README.md
│   ├── openapi.placeholder.yaml # scaffold (paths: {})
│   └── admin/
│       ├── swagger.json         # CASPIAN.HOMES.Api (OpenAPI 3.0.4)
│       └── README.md
│
├── generated/                   # Orval-owned — əl ilə edit OLUNMUR
│   ├── admin/
│   │   ├── models/              # 231 schema/type faylı + index
│   │   ├── accounts/
│   │   ├── ad/
│   │   ├── ad-attachment/
│   │   ├── ad-complaint/
│   │   ├── admin-budget/
│   │   ├── admin-payment/
│   │   ├── admin-plan/
│   │   ├── admin-subscription/
│   │   ├── cities/
│   │   ├── cloudflare-file/
│   │   ├── contacts/
│   │   ├── data/
│   │   ├── menus/
│   │   ├── organizations/
│   │   ├── owners/
│   │   ├── owner-types/
│   │   ├── payment/
│   │   ├── properties/
│   │   ├── property-evaluation/
│   │   ├── roles/
│   │   ├── sources/
│   │   ├── subscription/
│   │   ├── test/
│   │   ├── users/
│   │   ├── users-ads/
│   │   └── well-known-location/
│   └── placeholder/
│       └── models/index.ts      # boş scaffold output
│
├── scripts/
│   ├── check-generated-drift.mjs
│   └── build-admin-facade.mjs   # src/admin barrels regenerate
│
└── src/
    ├── index.ts                 # foundation public API
    ├── index.test.ts
    ├── client/
    │   ├── mutator.ts           # + responseType: blob|text|json
    │   ├── mutator.test.ts
    │   ├── auth-token.ts
    │   ├── auth-refresh.ts
    │   └── errors.ts
    ├── config/
    │   ├── env.ts               # configureApi / baseUrl
    │   └── query-defaults.ts
    ├── query/
    │   └── keys.ts              # + admin / adminResource
    ├── mutations/
    │   └── invalidate.ts        # + invalidateAdmin*
    └── admin/                   # təmiz facade (@azes/api/admin)
        ├── index.ts
        ├── models/index.ts
        ├── accounts/ … well-known-location/
        ├── admin-budget/
        │   ├── index.ts
        │   └── overdue/index.ts
        └── roles/
            ├── index.ts
            ├── menus/index.ts
            └── dropdown/index.ts
```

---

## 4. Yeniliklər (2026-10-04) — nə dəyişdi

### 4.1 ADMIN OpenAPI mənbəyi

- Spec: `openapi/admin/swagger.json`
- Title: `CASPIAN.HOMES.Api`, version `v1`, OpenAPI `3.0.4`
- **149** path · **188** operation (GET 92 · POST 61 · PUT 19 · DELETE 16)
- `servers: []` — URL runtime-da `configureApi({ baseUrl })` ilə verilir
- `operationId` yoxdur — Orval path-əsaslı adlar generasiya edir

### 4.2 Multi-source Orval

`orval.config.ts` indi iki layihə saxlayır (hər biri öz `clean` scope-unda):

| Project       | Input                              | Output                   |
| ------------- | ---------------------------------- | ------------------------ |
| `admin`       | `openapi/admin/swagger.json`       | `generated/admin/`       |
| `placeholder` | `openapi/openapi.placeholder.yaml` | `generated/placeholder/` |

Hər ikisi eyni `azesMutator` + react-query override istifadə edir.

### 4.3 Generated ADMIN layer

- Mode: `tags-split`
- Models: `generated/admin/models/` (**231** tip faylı)
- Tag client-ləri: `generated/admin/<tag>/<tag>.ts`
- Transport: mövcud `azesMutator` (Bearer, timeout, `AzesApiError`, 401 refresh + single retry)
- Blob: mutator `responseType: 'blob'` dəstəyi (məs. property-evaluation report)

### 4.4 Facade `src/admin/`

Əl ilə saxlanılan (regenerate: `build-admin-facade.mjs`) domain barrel-lər:

- Hər Swagger tag → bir qovluq (`kebab-case`)
- Nested yalnız path əsaslı:
  - `roles/menus`, `roles/dropdown`
  - `admin-budget/overdue`
- Models: `src/admin/models` → `export *` + barrel-də `adminModels` namespace
- Consumer **heç vaxt** `generated/admin/**` deep-import etməməlidir

### 4.5 Package / build

- `exports["./admin"]` əlavə olunub
- `tsconfig`: `rootDir: "."`, include: `src` + `generated/admin` → `dist/src`, `dist/generated`
- Köhnə `dist/index.js` yolu dəyişib → `dist/src/index.js` (exports map vasitəsilə)

### 4.6 Foundation genişlənmələri

| Modul                     | Yenilik                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `mutator.ts`              | `responseType?: 'json' \| 'blob' \| 'text'`                |
| `query/keys.ts`           | `admin()`, `adminResource(name)`                           |
| `mutations/invalidate.ts` | `invalidateAdminQueries`, `invalidateAdminResourceQueries` |
| `index.ts`                | yuxarıdakılar + `AzesMutatorResponseType` export           |

**Qeyd:** Orval query key-ləri path-baseddır (`['/api/v1/roles']`). Preciz invalidation üçün generated `get*QueryKey` istifadə edin. `apiQueryKeys.admin()` optional app-level namespace-dir.

---

## 5. ADMIN domain xəritəsi

Qruplaşdırma sırası: **Swagger tag → path hierarchy → (operationId yoxdur)**.

| Facade qovluq                     | Tag                | Query | Mutation | Hooks |
| --------------------------------- | ------------------ | ----: | -------: | ----: |
| `accounts`                        | Accounts           |     0 |        3 |     3 |
| `ad`                              | Ad                 |     4 |       10 |    14 |
| `ad-attachment`                   | AdAttachment       |     5 |        3 |     8 |
| `ad-complaint`                    | AdComplaint        |     1 |        4 |     5 |
| `admin-budget` (+ `overdue/`)     | AdminBudget        |     4 |        4 |     8 |
| `admin-payment`                   | AdminPayment       |     2 |        2 |     4 |
| `admin-plan`                      | AdminPlan          |     3 |        5 |     8 |
| `admin-subscription`              | AdminSubscription  |     6 |        7 |    13 |
| `cities`                          | Cities             |     5 |        4 |     9 |
| `cloudflare-file`                 | CloudflareFile     |     3 |        6 |     9 |
| `contacts`                        | Contacts           |     3 |        3 |     6 |
| `data`                            | Data               |     2 |        4 |     6 |
| `menus`                           | Menus              |     4 |        4 |     8 |
| `organizations`                   | Organizations      |     4 |        3 |     7 |
| `owner-types`                     | OwnerTypes         |     2 |        4 |     6 |
| `owners`                          | Owners             |     3 |        3 |     6 |
| `payment`                         | Payment            |     0 |        1 |     1 |
| `properties`                      | Properties         |     1 |        0 |     1 |
| `property-evaluation`             | PropertyEvaluation |     2 |        4 |     6 |
| `roles` (+ `menus/`, `dropdown/`) | Roles              |     5 |        1 |     6 |
| `sources`                         | Sources            |     2 |        3 |     5 |
| `subscription`                    | Subscription       |     5 |        2 |     7 |
| `test`                            | Test               |     3 |        0 |     3 |
| `users`                           | Users              |     5 |        6 |    11 |
| `users-ads`                       | UsersAds           |    10 |        6 |    16 |
| `well-known-location`             | WellKnownLocation  |     8 |        4 |    12 |

**Cəm:** 149 path · 188 operation · **92** query · **96** mutation · **188** unique hook · **231** model faylı · **26** domain tag.

---

## 6. Foundation public API (`@azes/api`)

| Export                                                          | Rol                                   |
| --------------------------------------------------------------- | ------------------------------------- |
| `configureApi` / `getApiConfig` / `resolveRequestUrl`           | baseUrl + timeout                     |
| `azesMutator` / `AzesMutatorConfig` / `AzesMutatorResponseType` | Orval transport                       |
| `setAccessTokenGetter` / `clearAccessTokenGetter`               | Bearer injection                      |
| `setAccessTokenRefreshHandler`                                  | 401 refresh hook                      |
| `AzesApiError` / `isAzesApiError`                               | Normalized errors                     |
| `apiQueryDefaultOptions`                                        | QueryClient defaults                  |
| `apiQueryKeys`                                                  | Typed key factory (+ admin namespace) |
| `invalidateAllApiQueries` / `invalidateResourceQueries`         | Cache helpers                         |
| `invalidateAdminQueries` / `invalidateAdminResourceQueries`     | Admin namespace helpers               |

---

## 7. İstehlak qaydaları

```ts
// Foundation
import { configureApi, setAccessTokenGetter, apiQueryDefaultOptions } from '@azes/api';

configureApi({ baseUrl: import.meta.env.VITE_API_BASE_URL }); // origin only

// ADMIN domain API
import {
  useGetApiV1Roles,
  useGetApiV1RolesMenus,
  useGetApiV1AdminbudgetOverdue,
  type CASPIENHOMESApplicationContractsDTOsRoleDTO,
} from '@azes/api/admin';
```

**Qadağan:**

- `generated/` əl ilə edit
- App-lərdə `@azes/api/generated/...` deep import
- UI / state / auth paketindən `@azes/api`-yə əks asılılıq pozuntusu
- Server data-nın Redux-a yazılması

---

## 8. Skriptlər və validasiya

| Skript                                  | Əmr                                                   |
| --------------------------------------- | ----------------------------------------------------- |
| `generate`                              | Orval (admin + placeholder) + facade scaffold         |
| `generate:facade`                       | Yalnız `src/admin` barrels                            |
| `generate:check`                        | generate + git drift (`generated/` commit tələb edir) |
| `typecheck` / `test` / `build` / `lint` | keyfiyyət qapıları                                    |

Root alias: `pnpm api:generate`, `pnpm api:generate:check`.

### Son doğrulama (2026-10-04)

| Qapı                                     | Nəticə                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| `pnpm --filter @azes/api typecheck`      | PASS                                                   |
| `pnpm --filter @azes/api test` (7 test)  | PASS                                                   |
| `pnpm --filter @azes/api build`          | PASS                                                   |
| `pnpm --filter @azes/api generate`       | PASS                                                   |
| `pnpm --filter @azes/api generate:check` | FAIL — `generated/` hələ commit olunmayıb (gözlənilən) |

---

## 9. Swagger / arxitektura qeydləri

1. **`operationId` yoxdur** — hook adları uzun path-baseddir (`useGetApiV1AdminbudgetOrganizationOrganizationIdBudgets`).
2. **Schema adları** .NET FQN-dir (`CASPIENHOMESApplicationContractsDTOs…`) — Swagger mənbəyidir, əl ilə rename olunmayıb.
3. **UsersAds debug** endpoint-ləri kontrakta görə generate olunub.
4. **Gələcək API mənbələri** (`agent-site` və s.) eyni pattern: `openapi/<source>/` → `generated/<source>/` → `src/<source>/` + `exports["./<source>"]`. Bu taskda yaradılmayıb.
5. **App wiring** (`configureApi`, auth bridge, real hook istifadəsi) hələ product app-lərdə bağlanmayıb — bilərəkdən scope xaricindədir.

---

## 10. Növbəti addımlar (plan — icra olunmayıb)

1. `generated/` + facade dəyişikliklərini commit et → `generate:check` yaşıl olsun.
2. `apps/admin` (və ehtiyac olan digər app-lər) üçün `configureApi` + `@azes/auth` → `connectAuthToApi`.
3. Real feature-lərdə `@azes/api/admin` hook-larından istifadə.
4. Gələcək backend source-ları eyni izolyasiya modelində əlavə et.
5. İstəyə bağlı: backend `operationId` əlavə etsə, hook adları daha oxunaqlı olar (regenerate tələb edir).
