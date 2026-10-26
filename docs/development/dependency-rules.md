<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/development/dependency-rules.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-09-29
║ Purpose: Practical rules for what may import what
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Dependency Rules (practical)

Authoritative graph: [../architecture/dependency-graph.md](../architecture/dependency-graph.md).

## Quick rules

- Apps may import any `@azes/*` package. Apps may NOT import other apps.
- Product apps may NOT import `@mui/material` components, `@mui/system`, or `@emotion/*`.
  `apps/realestate` may import `@mui/material-nextjs`, `@emotion/cache`, `@emotion/server`,
  and `@mui/material/InitColorSchemeScript`. `apps/azes-ui` may import
  `@mui/icons-material/<Name>`. See [ADR-009](../decisions/ADR-009-mui-web-theme.md).
- `ui-web` / `ui-native` may import: `design-tokens`, `utils`, `constants`, `types`, and their
  platform runtime + primitives. They may NOT import `api`, `state`, `auth`, or business domains.
- `utils`, `constants`, `types` may NOT import React, react-native, or `api`.
- `api/generated` may NOT import business logic; nobody hand-edits it.
- `state` may NOT store server data owned by TanStack Query.
- Import only from package public entry points (`@azes/<pkg>`). No `@azes/<pkg>/src/...`.

## Allowed intra-package edges

- `design-tokens -> ui-web`, `design-tokens -> ui-native`
- `types -> api | state | validation`
- `api -> state`, `auth -> state`

## Enforcement

- ESLint import-boundary rules (`tooling/eslint`).
- Package `exports` maps.
- CI boundary check (Phase 2+); full audit in Phase 12 (`pnpm architecture:verify`).

## When you think you need to break a rule

You almost never do. Options in order of preference:

1. Move the shared thing to the correct lower-level package.
2. Invert the dependency (pass data in rather than importing up).
3. If genuinely new shared capability, propose a package + ADR, get approval.
