/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/data-grid/AzesDataGrid.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-09
 * ║ Purpose: MIT DataGrid — autoHeight, sticky actions, theme-driven chrome
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import { useTheme } from '@mui/material/styles';
import {
  DataGrid,
  type DataGridProps,
  type GridBaseIconProps,
  type GridColDef,
  type GridColumnUnsortedIconProps,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import { useMemo, type ReactNode } from 'react';

import { AZES_STICKY_END_CLASS, calcDataGridMinHeightPx, getDataGridSx } from './dataGridStyles';

export const AZES_DATA_GRID_PAGE_SIZES = [10, 25, 50] as const;

/** Map DataGrid icon-slot props onto MUI SvgIcon (avoid `color: string` clash). */
function renderSortIcon(
  Icon: typeof ArrowUpwardOutlinedIcon,
  { className, fontSize = 'inherit', style, titleAccess }: GridBaseIconProps,
): ReactNode {
  return <Icon className={className} fontSize={fontSize} style={style} titleAccess={titleAccess} />;
}

function ColumnSortedAscendingIcon(props: GridBaseIconProps): ReactNode {
  return renderSortIcon(ArrowUpwardOutlinedIcon, props);
}

function ColumnSortedDescendingIcon(props: GridBaseIconProps): ReactNode {
  return renderSortIcon(ArrowDownwardOutlinedIcon, props);
}

function ColumnUnsortedIcon({
  sortingOrder: _sortingOrder,
  ...props
}: GridColumnUnsortedIconProps): ReactNode {
  return renderSortIcon(UnfoldMoreOutlinedIcon, props);
}

export type AzesDataGridProps<R extends GridValidRowModel = GridValidRowModel> = Omit<
  DataGridProps<R>,
  'aria-label'
> & {
  /** Required: grids must have an accessible name. */
  'aria-label': string;
  /**
   * When true (default), height follows rows (+ footer). Set false for parent-fill
   * (`height: 100%`) — legacy list-shell layout.
   */
  autoHeight?: boolean;
  /** Empty/loading floor in row units (density-aware). Default 5. */
  minRows?: number;
  /**
   * Cap growth while `autoHeight` stays on — CSS `maxHeight` + overflow on the root.
   * With `autoHeight={false}`, sets a fixed `height` instead of filling the parent.
   */
  maxHeight?: number | string;
  /** Pin `actions` / sticky-end columns to the trailing edge via CSS. Default true. */
  stickyActions?: boolean;
};

function joinClass(...parts: Array<string | undefined>): string | undefined {
  const next = parts.filter(Boolean).join(' ');
  return next || undefined;
}

function isActionsColumn<R extends GridValidRowModel>(col: GridColDef<R>): boolean {
  if (col.field === 'actions') return true;
  if (col.type === 'actions') return true;
  const header = col.headerClassName;
  const cell = col.cellClassName;
  if (typeof header === 'string' && header.includes(AZES_STICKY_END_CLASS)) return true;
  if (typeof cell === 'string' && cell.includes(AZES_STICKY_END_CLASS)) return true;
  return false;
}

function enrichColumns<R extends GridValidRowModel>(
  columns: readonly GridColDef<R>[] | undefined,
  stickyActions: boolean,
): GridColDef<R>[] {
  if (!columns) return [];
  return columns.map((col) => {
    if (!stickyActions || !isActionsColumn(col)) {
      return col;
    }
    return {
      ...col,
      width: col.width ?? 96,
      minWidth: col.minWidth ?? 88,
      sortable: col.sortable ?? false,
      filterable: col.filterable ?? false,
      disableColumnMenu: col.disableColumnMenu ?? true,
      resizable: col.resizable ?? false,
      headerClassName: joinClass(
        typeof col.headerClassName === 'string' ? col.headerClassName : undefined,
        AZES_STICKY_END_CLASS,
      ),
      cellClassName: joinClass(
        typeof col.cellClassName === 'string' ? col.cellClassName : undefined,
        AZES_STICKY_END_CLASS,
      ),
    };
  });
}

export function AzesDataGrid<R extends GridValidRowModel = GridValidRowModel>({
  density,
  pageSizeOptions = [...AZES_DATA_GRID_PAGE_SIZES],
  initialState,
  sx,
  columns,
  autoHeight = true,
  minRows,
  maxHeight,
  stickyActions = true,
  slots,
  slotProps,
  style,
  ...props
}: AzesDataGridProps<R>) {
  const theme = useTheme();
  const resolvedDensity = density ?? (theme.azes.density === 'compact' ? 'compact' : 'standard');
  const floorRows = minRows ?? theme.azes.dataGrid.minVisibleRows;
  const minHeightPx = calcDataGridMinHeightPx(theme, floorRows);

  // Fill parent only when autoHeight is off and no maxHeight cap.
  const fillParent = !autoHeight && maxHeight == null;
  const fixedHeight = !autoHeight && maxHeight != null ? maxHeight : undefined;

  const enrichedColumns = useMemo(
    () => enrichColumns(columns, stickyActions),
    [columns, stickyActions],
  );

  const gridSx = useMemo(
    () =>
      getDataGridSx(theme, {
        stickyActions,
        minHeightPx,
        maxHeight,
        autoHeight,
        fillParent,
      }),
    [theme, stickyActions, minHeightPx, maxHeight, autoHeight, fillParent],
  );

  return (
    <DataGrid<R>
      density={resolvedDensity}
      disableRowSelectionOnClick
      pageSizeOptions={pageSizeOptions}
      columns={enrichedColumns}
      autoHeight={autoHeight}
      // Keep the trailing actions column mounted while scrolling horizontally (MIT, no Pro pinning).
      // Admin page sizes are ≤ 50 rows — buffer cost is acceptable vs sticky breakage.
      columnBufferPx={480}
      rowHeight={theme.azes.dataGrid.rowHeight}
      columnHeaderHeight={theme.azes.dataGrid.headerHeight}
      initialState={{
        ...initialState,
        pagination: {
          ...initialState?.pagination,
          paginationModel: {
            pageSize: AZES_DATA_GRID_PAGE_SIZES[0],
            page: 0,
            ...initialState?.pagination?.paginationModel,
          },
        },
      }}
      slots={{
        columnSortedAscendingIcon: ColumnSortedAscendingIcon,
        columnSortedDescendingIcon: ColumnSortedDescendingIcon,
        columnUnsortedIcon: ColumnUnsortedIcon,
        ...slots,
      }}
      slotProps={{
        ...slotProps,
        loadingOverlay: {
          variant: 'linear-progress',
          noRowsVariant: 'linear-progress',
          ...slotProps?.loadingOverlay,
        },
      }}
      sx={[gridSx, ...(Array.isArray(sx) ? sx : [sx])]}
      style={{
        ...style,
        ...(fixedHeight != null ? { height: fixedHeight, width: style?.width ?? '100%' } : {}),
      }}
      {...props}
    />
  );
}

export { AZES_STICKY_END_CLASS };
