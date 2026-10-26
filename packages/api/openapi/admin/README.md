<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/api/openapi/admin/README.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: ADMIN OpenAPI source notes for @azes/api
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# ADMIN OpenAPI source

- Contract: [`swagger.json`](./swagger.json) (`CASPIAN.HOMES.Api`, OpenAPI 3.0.4)
- Orval project key: `admin` → output `packages/api/generated/admin/`
- Public facade: `@azes/api/admin` → `packages/api/src/admin/`

## Runtime base URL

The Swagger document has an empty `servers` array. Request paths are root-absolute
(e.g. `/api/v1/...`). Apps must call `configureApi({ baseUrl })` with the ADMIN API
origin (scheme + host, no trailing slash). Do not hardcode environment URLs in this package.

## Regeneration

```bash
pnpm --filter @azes/api generate
# or from repo root:
pnpm api:generate
```

Never hand-edit `packages/api/generated/admin/`.
