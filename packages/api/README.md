<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/api/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-04
║ Purpose: Usage and generation guide for @azes/api
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/api`

OpenAPI → Orval → typed client + TanStack Query integration.

## Layout

```text
openapi/
  admin/swagger.json          # ADMIN backend contract
  openapi.placeholder.yaml    # scaffold-only empty contract
generated/
  admin/                      # Orval ADMIN output — NEVER hand-edit
  placeholder/                # Orval placeholder output — NEVER hand-edit
src/
  client/                     # mutator, errors, token getter
  config/                     # base URL + query defaults
  query/                      # query key factory
  mutations/                  # invalidation helpers
  admin/                      # clean ADMIN facade (@azes/api/admin)
  index.ts                    # public hand-written foundation (@azes/api)
```

## Imports

```ts
import {
  configureApi,
  setAccessTokenGetter,
  apiQueryDefaultOptions,
  apiQueryKeys,
} from '@azes/api';

import {
  usePostApiV1AccountsLogin,
  useGetApiV1Organizations,
  useGetApiV1AdminbudgetOverdue,
} from '@azes/api/admin';
```

## Commands

```bash
pnpm --filter @azes/api generate        # Orval + ADMIN facade barrels
pnpm --filter @azes/api generate:check  # fail if generated/ drifts
pnpm api:generate                       # root alias
```

## Runtime config

```ts
configureApi({ baseUrl: import.meta.env.VITE_API_BASE_URL });
setAccessTokenGetter(() => accessToken);
```

ADMIN Swagger has no `servers` entries; paths are absolute (`/api/v1/...`).
`baseUrl` must be the API origin only.

## Rules

- Never edit `generated/` by hand.
- Do not put API response data into Redux (TanStack Query owns server state).
- UI packages must not depend on `@azes/api`.
- Prefer `@azes/api/admin` over deep imports into `generated/admin/**`.
- Orval query keys are path-based (e.g. `['/api/v1/roles']`). Use the generated
  `get*QueryKey` helpers for precise invalidation.
