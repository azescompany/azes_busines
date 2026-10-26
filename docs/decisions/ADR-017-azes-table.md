<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-017-azes-table.md
║ Author: AZES_COMPANY
║ Created: 2026-10-09
║ Updated: 2026-10-09
║ Purpose: Decision to ship AzesTable (TanStack + MUI Table) as default grid
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-017: AzesTable (TanStack Table + MUI Table) as the default data table

## Status

Accepted (2026-10-09).

## Context

Admin list pages (Users, Ads) need sticky trailing actions, natural height with page-size
growth, and full design control over hover/selected/header chrome. MUI X Data Grid (MIT)
virtualizes columns, which complicates sticky trailing columns without Pro pinning
(ADR-013). Bundle cost of `@mui/x-data-grid` is also higher than a headless table + MUI
`Table*` for ≤50-row pages.

## Decision

1. Ship **`AzesTable`** on `@azes/ui-web/table` using **TanStack Table v8** + MUI Table
   primitives, themed via `theme.azes.table` and `tableStyles.ts`.
2. Keep **`AzesDataGrid`** / `@azes/ui-web/data-grid` / `@mui/x-data-grid` unchanged for
   legacy demos (Design Lab, azes-ui). Do not delete or refactor the DataGrid package for
   this ADR.
3. ESLint in product apps: ban `@azes/ui-web/data-grid` and direct `@tanstack/react-table`
   imports; message points to `@azes/ui-web/table`. Exceptions: Design Lab page and
   `apps/azes-ui` showcase.
4. No row virtualization package for now (page sizes ≤ 50).

## Consequences

- Sticky actions are reliable CSS on a real `<table>`.
- Apps re-export types/helpers from `@azes/ui-web/table` only.
- Core `@azes/ui-web` entry must not import the table subpath (TanStack stays out of the
  core chunk).
- New product tables use AzesTable; DataGrid remains a documented legacy path (13-mui-x,
  21-table).
