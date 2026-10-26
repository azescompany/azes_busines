<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/13-mui-x.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-09
║ Purpose: MUI X usage, license tiers, wrappers, theming and lazy loading
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# MUI X

**New product tables:** use [`AzesTable`](21-table.md) (`@azes/ui-web/table`, ADR-017).
`AzesDataGrid` remains for legacy / Design Lab / showcase demos only.

AZES uses the **community (MIT) tier only** (ADR-013). Pro and Premium need a new ADR and a
commercial license.

| Package               | Tier used | AZES needs                                                  | Pro/Premium features we do not use                                   |
| --------------------- | --------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `@mui/x-data-grid`    | MIT       | sorting, filtering, pagination, selection, density, toolbar | column pinning, row grouping, tree data, Excel export, multi-filters |
| `@mui/x-charts`       | MIT       | line, bar, pie, sparkline                                   | zoom, heatmap, funnel                                                |
| `@mui/x-date-pickers` | MIT       | not used yet                                                | date range pickers                                                   |
| `@mui/x-tree-view`    | MIT       | not used yet                                                | drag and drop reordering                                             |

Date pickers and tree view are added only when a product needs them. Date pickers would add
`dayjs` as the adapter (smallest option; the repo has no date library today).

## Wrappers

- `AzesDataGrid` (`@azes/ui-web/data-grid`): MIT `DataGrid` with AZES defaults:
  - **autoHeight** (default `true`) — height follows header + rows + footer; `minRows`
    (default 5) sets a density-aware floor when empty/loading.
  - **maxHeight** — optional cap; with autoHeight the root scrolls when content exceeds the cap.
  - **sticky actions** (default `true`) — CSS `position: sticky` on `field: 'actions'`,
    `type: 'actions'`, or class `azes-sticky-end`. **Not** Pro column pinning (ADR-013).
    Horizontal virtualization uses a large `columnBufferPx` so the trailing column stays mounted.
  - Density from `theme.azes.density` / `theme.azes.dataGrid` row+header heights.
  - Theme chrome via `getDataGridSx` (tinted header, soft hover/selected, focus rings, sort icons).
  - `disableRowSelectionOnClick`, `pageSizeOptions [10, 25, 50]`, required `aria-label`.
  - Opt out of autoHeight with `autoHeight={false}` for parent-fill (`height: 100%`).
- `AzesLineChart`, `AzesBarChart`, `AzesPieChart` (`@azes/ui-web/charts`): series colors from
  `azesChartPalette(theme)` (primary, secondary, then status colors), a required `title` for
  screen readers, and token heights.

## Lazy loading

- Each wrapper lives in its own subpath and bundle entry.
- Apps load them where they are used, ideally with `React.lazy(() => import('...'))` at route
  level. `azes-ui` loads Data grid and Charts sections lazily; the initial chunk must not
  contain MUI X (16).

## Theming

MUI X reads the same theme. Colors come from `theme.vars`, so dark mode and brand tinted
surfaces work. Typography and row metrics live on `theme.azes.dataGrid` — no hardcoded `px`
font sizes in the wrapper. No separate MUI X theme augmentation is added to core, so core
never depends on MUI X.

## Performance

- Data grid: keep `rows` and `columns` memoized. With autoHeight, row virtualization is
  limited; admin page sizes stay ≤ 50. Prefer `maxHeight` on large pages instead of disabling
  autoHeight unless a fill-shell layout is required.
- Charts: keep datasets small (aggregate on the server); avoid animating on every render.
