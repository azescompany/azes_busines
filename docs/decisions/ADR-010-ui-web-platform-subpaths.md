<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-010-ui-web-platform-subpaths.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Decision record for growing @azes/ui-web into the MUI platform with subpath exports
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-010: `@azes/ui-web` is the MUI platform, organized as subpaths

## Status

Accepted (2026-10-04). Extends [ADR-009](ADR-009-mui-web-theme.md).

## Context

The target architecture names a package `@azes/ui-mui` holding theme, layouts, navigation,
settings, forms, data grid, charts and icons. `@azes/ui-web` is already the MUI 9 package and
is used by six web apps, the ESLint boundaries, the architecture audit and the Cursor rules.

## Options

1. Rename `ui-web` to `ui-mui` (mechanical change across apps, lint, audit, rules, docs).
2. Create `@azes/ui-mui` next to `ui-web` and deprecate `ui-web` later (two packages for one job).
3. Keep `@azes/ui-web` and grow it in place with subpath exports.

## Decision

Option 3. "ui-mui" is a documentation concept. New capabilities are subpaths:
`@azes/ui-web/settings`, `/navigation`, `/layout`, `/icons`, `/data-grid`, `/charts`, `/forms`.
Core never imports a subpath; leaf subpaths import only core.

## Consequences

- No churn in product apps; `AzesThemeProvider` keeps working.
- Heavy dependencies (MUI X, react-hook-form) are reachable only through their subpaths.
- The architecture audit gains a `ui-web-subpaths` check.
