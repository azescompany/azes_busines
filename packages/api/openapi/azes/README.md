<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/api/openapi/azes/README.md
║ Author: AZES_COMPANY
║ Created: 2026-10-19
║ Updated: 2026-10-19
║ Purpose: AZES OpenAPI source notes (auth slice)
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# AZES OpenAPI source

| Spec                             | Orval  | Generated         | Import           |
| -------------------------------- | ------ | ----------------- | ---------------- |
| [`openapi.yaml`](./openapi.yaml) | `azes` | `generated/azes/` | `@azes/api/azes` |

Auth paths must stay aligned with [`apps/api/docs/PHASE-2B-AUTH-CONTRACT.md`](../../../../apps/api/docs/PHASE-2B-AUTH-CONTRACT.md).

Never hand-edit `packages/api/generated/azes/**` — regenerate via `pnpm api:generate`.
