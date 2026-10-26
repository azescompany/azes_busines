<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/21-table.md
║ Author: AZES_COMPANY
║ Created: 2026-10-09
║ Updated: 2026-10-10
║ Purpose: AzesTable API, sticky actions, tokens, a11y, vs DataGrid
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesTable

Entry: `@azes/ui-web/table` (lazy subpath). Headless logic: **TanStack Table v8**. Markup:
MUI `Table*` primitives. Decision: [ADR-017](../decisions/ADR-017-azes-table.md).

**New product tables must use `AzesTable`.** `AzesDataGrid` (`@azes/ui-web/data-grid`) remains
for legacy / Design Lab / showcase demos only (see [13-mui-x.md](13-mui-x.md)).

## When to use which

| Need                                                      | Use                             |
| --------------------------------------------------------- | ------------------------------- |
| Admin list pages, sticky trailing actions, natural height | `AzesTable`                     |
| Existing DataGrid demos / MUI X-only experiments          | `AzesDataGrid`                  |
| Pro features (true column pinning, Excel export, …)       | Not shipped — new ADR + license |

## Import rules

```ts
import {
  AzesTable,
  createActionsColumn,
  type ColumnDef,
  type AzesTableLabels,
} from '@azes/ui-web/table';
```

- Apps must **not** import `@tanstack/react-table` directly (ESLint).
- Apps must **not** import `@azes/ui-web/data-grid` for new work (ESLint; Design Lab /
  `azes-ui` demos excepted).
- Memoize `data` and `columns` in the caller.

## API (essentials)

- Required: `aria-label`, `data`, `columns`.
- Labels: optional `labels` (partial). Merge order: package defaults ←
  `AzesTableLabelsProvider` (admin: `DialogLabelsBridge` / `table.*` i18n) ← per-table
  `labels`. Empty Paper copy is **global** (`table.emptyTitle` + `table.emptyDescription`) —
  do not wire feature-specific empty strings on each table.
- Pagination: `paginationMode` `client` | `server` (default client); server needs `rowCount`.
  Model: `{ page, pageSize }` (same shape as prior DataGrid pages).
- Sorting: `sortingMode`, controlled `sortModel` / `onSortModelChange` (`SortingState`).
- Selection: `checkboxSelection`; row click does **not** toggle selection.
- Layout: natural height only — **no Y-axis scroll inside the table** (page/scoop scrolls).
  Horizontal `overflow-x` remains for sticky actions. `maxHeight` is deprecated/ignored.
  `minRows` (default 5) for empty/loading floor.
- Empty: when `!loading && data.length === 0`, **replace** the table with
  `AzesEmptyState` (large dashed `Paper`, icon + title + description) — not an in-cell scrap.
  Same lifecycle idea as view skeletons: wait for data → if none, show the Paper.
  Override UI via `emptyState` / `slots.emptyState`. Pagination is hidden while empty.
- Sticky: `stickyActions` default `true` (`id === 'actions'` or `meta.isActions`). Optional
  `stickyStart` for the checkbox column.

```ts
import { AzesEmptyState } from '@azes/ui-web/table';
```

Helper: `createActionsColumn({ cell, header?, width? })` — action `IconButton`s must set
`aria-label`.

## Sticky actions

Ordinary `<table>` cells: `position: sticky; insetInlineEnd: 0`. Opaque paper backgrounds;
hover/selected use `backgroundColor: paper` + `backgroundImage: linear-gradient(color-mix…)`.
Scroll shadow via `data-overflow` / `data-scrolled-end` on the scroll container
(ResizeObserver + scroll listener; state updates only when flags change).

## Tokens

`theme.azes.table`: row/header/footer heights, `minVisibleRows`, `cellPaddingX`, hover/selected
mix percents, typography variant keys (`subtitle2` / `body2` / `caption`). Styles live in
`tableStyles.ts` → `getTableSx`.

## Typography audit

| Surface     | Token / variant                                                     |
| ----------- | ------------------------------------------------------------------- |
| Header      | `theme.typography.subtitle2` + `fontWeightMedium`, `text.secondary` |
| Cell        | `theme.typography.body2`, `text.primary`                            |
| Footer      | `theme.typography.caption`, `text.secondary`                        |
| Sort active | `primary.main` on label + icon                                      |

No hardcoded `px` / hex / rgba in the wrapper.

## Example (server page, Users-shaped)

```tsx
const AzesTable = lazy(() => import('@azes/ui-web/table').then((m) => ({ default: m.AzesTable })));

<AzesTable
  aria-label={t('users.ariaLabel')}
  data={rows}
  columns={columns}
  getRowId={(row) => String(row.id)}
  paginationMode="server"
  rowCount={count}
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
  labels={tableLabels}
/>;
```

Vertical scrolling is owned by the dashboard scoop/page — not by `AzesTable`.
