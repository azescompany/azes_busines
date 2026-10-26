<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/api/openapi/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-19
║ Purpose: OpenAPI source strategy for @azes/api
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# OpenAPI source

API contracts are isolated per backend source under this directory.

| Source      | Spec                                                     | Orval project | Generated output         | Public import     |
| ----------- | -------------------------------------------------------- | ------------- | ------------------------ | ----------------- |
| AZES        | [`azes/openapi.yaml`](./azes/openapi.yaml)               | `azes`        | `generated/azes/`        | `@azes/api/azes`  |
| ADMIN       | [`admin/swagger.json`](./admin/swagger.json)             | `admin`       | `generated/admin/`       | `@azes/api/admin` |
| Placeholder | [`openapi.placeholder.yaml`](./openapi.placeholder.yaml) | `placeholder` | `generated/placeholder/` | (scaffold only)   |

## Runtime ownership (Phase 2C+)

| Concern        | Location                        | Role                                            |
| -------------- | ------------------------------- | ----------------------------------------------- |
| HTTP runtime   | `apps/api` (`@azes/api-server`) | Hono + Workers + D1 — behaviour source of truth |
| Client codegen | this package (`@azes/api`)      | OpenAPI → Orval → app imports                   |

**Phase 2C:** `openapi/azes/` auth slice is published; Account/Academy use `@azes/api/azes` + Worker origin. Caspian `admin/swagger.json` remains for legacy non-auth clients until retired.

## Rules

- OpenAPI remains the source of truth for **client** contracts once published.
- Runtime behaviour is owned by `apps/api` — keep OpenAPI in sync when endpoints ship.
- Never hand-edit `packages/api/generated/`.
- Do not invent domain endpoints in the placeholder to simulate a product API.
- Keep each backend source in its own folder (`openapi/<source>/` → `generated/<source>/`).
- Future sources must follow the same isolation pattern — do not mix outputs.
