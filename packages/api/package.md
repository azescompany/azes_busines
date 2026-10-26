<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/api/package.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-04
║ Purpose: Sibling documentation for package.json / tsconfig.json
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# Package metadata

`package.json` and `tsconfig.json` are strict JSON and cannot carry AZES comment headers.

- Package: `@azes/api`
- Public exports:
  - `@azes/api` → hand-written foundation (`dist/src/index.js`)
  - `@azes/api/admin` → ADMIN OpenAPI facade (`dist/src/admin/index.js`)
- Runtime: `@tanstack/react-query`
- Peers: `react`, `@tanstack/react-query`
- Forbidden: ui-web, ui-native, state, auth, business domains
- Generated output: `generated/admin/` (Orval-owned), `generated/placeholder/` (scaffold)
- OpenAPI sources: `openapi/admin/swagger.json`, `openapi/openapi.placeholder.yaml`
- Build includes `src` + `generated/admin` (`rootDir: "."` → `dist/src`, `dist/generated`)
