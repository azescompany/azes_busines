/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/AzesTable.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-10
 * ║ Purpose: TanStack Table + MUI Table — sticky actions, server page
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import { AzesSkeleton } from '../skeleton/AzesSkeleton/AzesSkeleton';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { AzesEmptyState } from './AzesEmptyState';
import { resolveAzesTableLabels, useOptionalAzesTableLabels } from './AzesTableLabelsContext';
import { isActionsColumn } from './createActionsColumn';
import {
  AZES_TABLE_STICKY_END_CLASS,
  AZES_TABLE_STICKY_START_CLASS,
  calcTableMinHeightPx,
  getTableSx,
} from './tableStyles';
import './tanstack-meta';

export const AZES_TABLE_PAGE_SIZES = [10, 25, 50] as const;

/** App-facing pagination (aligned with prior DataGrid `page` / `pageSize`). */
export type AzesTablePaginationModel = {
  page: number;
  pageSize: number;
};

export type AzesTableLabels = {
  rowsPerPage: string;
  displayedRows: (from: number, to: number, count: number) => string;
  previousPage: string;
  nextPage: string;
  /**
   * Empty Paper title. Falls back to `empty` when omitted.
   * Prefer a short global title (“No data found”) + feature `empty` as description.
   */
  emptyTitle?: string;
  /** Empty Paper description (or sole message when `emptyTitle` omitted). */
  empty?: string;
  selectAll?: string;
  selectRow?: string;
};

export type AzesTableSlots = {
  toolbar?: ReactNode;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
};

export type AzesTableProps<TData> = {
  'aria-label': string;
  /** Memoize in the caller. */
  data: TData[];
  /** Memoize in the caller. Prefer typed `ColumnDef<TData>[]` (no cast). */
  columns: ColumnDef<TData, unknown>[];
  getRowId?: (row: TData, index: number) => string;
  density?: 'compact' | 'standard';
  loading?: boolean;
  error?: ReactNode | boolean;
  emptyState?: ReactNode;
  paginationMode?: 'client' | 'server';
  /** Required when `paginationMode="server"`. */
  rowCount?: number;
  paginationModel?: AzesTablePaginationModel;
  onPaginationModelChange?: (model: AzesTablePaginationModel) => void;
  pageSizeOptions?: number[];
  hidePagination?: boolean;
  sortingMode?: 'client' | 'server';
  sortModel?: SortingState;
  onSortModelChange?: OnChangeFn<SortingState>;
  enableMultiSort?: boolean;
  checkboxSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /**
   * Optional visual highlight (same style as selected) without enabling checkbox selection.
   * Useful while an accordion edit form targets a row.
   */
  highlightedRowId?: string | null;
  /**
   * @deprecated Ignored. AzesTable never scrolls on the Y axis — height follows rows;
   * the page/scoop scrollport owns vertical scrolling. Horizontal overflow remains.
   */
  maxHeight?: number | string;
  minRows?: number;
  stickyActions?: boolean;
  /** Sticky leading checkbox column. Default false. */
  stickyStart?: boolean;
  onRowClick?: (row: TData, event: MouseEvent<HTMLTableRowElement>) => void;
  sx?: SxProps<Theme>;
  slots?: AzesTableSlots;
  /**
   * Per-table label overrides. Merged over `AzesUiProvider` `tableLabels`
   * (and English package defaults). Empty Paper uses provider `emptyTitle` /
   * `empty` when omitted here — apps should set those once globally.
   */
  labels?: Partial<AzesTableLabels>;
};

function joinClass(...parts: Array<string | false | undefined | null>): string | undefined {
  const next = parts.filter(Boolean).join(' ');
  return next || undefined;
}

function cellStyleFromMeta(meta: ColumnDef<unknown, unknown>['meta'] | undefined): CSSProperties {
  if (!meta) return {};
  return {
    width: meta.width,
    minWidth: meta.minWidth,
    maxWidth: meta.maxWidth,
    textAlign: meta.align,
  };
}

function useScrollOverflowFlags(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [scrolledEnd, setScrolledEnd] = useState(true);
  const [scrolledStart, setScrolledStart] = useState(true);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const max = el.scrollWidth - el.clientWidth;
    const hasOverflow = max > 1;
    const atEnd = !hasOverflow || el.scrollLeft >= max - 1;
    const atStart = !hasOverflow || el.scrollLeft <= 1;
    setOverflow((prev) => (prev === hasOverflow ? prev : hasOverflow));
    setScrolledEnd((prev) => (prev === atEnd ? prev : atEnd));
    setScrolledStart((prev) => (prev === atStart ? prev : atStart));
  }, [enabled]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ResizeObserverCtor = typeof ResizeObserver === 'undefined' ? undefined : ResizeObserver;
    const ro = ResizeObserverCtor ? new ResizeObserverCtor(sync) : undefined;
    if (ro) {
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }
    return () => {
      el.removeEventListener('scroll', sync);
      ro?.disconnect();
    };
  }, [enabled, sync]);

  return { ref, overflow, scrolledEnd, scrolledStart, sync };
}

export function AzesTable<TData>({
  'aria-label': ariaLabel,
  data,
  columns,
  getRowId,
  density: densityProp,
  loading = false,
  error,
  emptyState,
  paginationMode = 'client',
  rowCount,
  paginationModel: paginationModelProp,
  onPaginationModelChange,
  pageSizeOptions = [...AZES_TABLE_PAGE_SIZES],
  hidePagination = false,
  sortingMode = 'client',
  sortModel: sortModelProp,
  onSortModelChange,
  enableMultiSort = false,
  checkboxSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  highlightedRowId = null,
  maxHeight: _maxHeight,
  minRows,
  stickyActions = true,
  stickyStart = false,
  onRowClick,
  sx,
  slots,
  labels: labelsProp,
}: AzesTableProps<TData>) {
  const theme = useTheme();
  const providerLabels = useOptionalAzesTableLabels();
  const labels = useMemo(
    () => resolveAzesTableLabels(labelsProp, providerLabels),
    [labelsProp, providerLabels],
  );
  const density = densityProp ?? (theme.azes.density === 'compact' ? 'compact' : 'standard');
  const floorRows = minRows ?? theme.azes.table.minVisibleRows;
  const minHeightPx = calcTableMinHeightPx(theme, floorRows);
  const manualPagination = paginationMode === 'server';
  const manualSorting = sortingMode === 'server';

  const [uncontrolledPagination, setUncontrolledPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: AZES_TABLE_PAGE_SIZES[0],
  });
  const [uncontrolledSorting, setUncontrolledSorting] = useState<SortingState>([]);
  const [uncontrolledSelection, setUncontrolledSelection] = useState<RowSelectionState>({});

  const pagination: PaginationState = paginationModelProp
    ? { pageIndex: paginationModelProp.page, pageSize: paginationModelProp.pageSize }
    : uncontrolledPagination;

  const sorting = sortModelProp ?? uncontrolledSorting;
  const rowSelection = rowSelectionProp ?? uncontrolledSelection;

  const setPagination: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    if (onPaginationModelChange) {
      onPaginationModelChange({ page: next.pageIndex, pageSize: next.pageSize });
    } else {
      setUncontrolledPagination(next);
    }
  };

  const setSorting: OnChangeFn<SortingState> = (updater) => {
    if (onSortModelChange) {
      onSortModelChange(updater);
      return;
    }
    setUncontrolledSorting(updater);
  };

  const setRowSelection: OnChangeFn<RowSelectionState> = (updater) => {
    if (onRowSelectionChange) {
      onRowSelectionChange(updater);
      return;
    }
    setUncontrolledSelection(updater);
  };

  const resolvedColumns = useMemo(() => {
    const cols = [...columns];
    if (!checkboxSelection) return cols;
    const selectCol: ColumnDef<TData, unknown> = {
      id: '__select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          size="small"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          slotProps={{ input: { 'aria-label': labels.selectAll ?? 'Select all' } }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="small"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          slotProps={{ input: { 'aria-label': labels.selectRow ?? 'Select row' } }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      meta: { width: 48, align: 'center' },
      size: 48,
    };
    return [selectCol, ...cols];
  }, [checkboxSelection, columns, labels.selectAll, labels.selectRow]);

  const pageCount =
    manualPagination && typeof rowCount === 'number'
      ? Math.max(1, Math.ceil(rowCount / Math.max(1, pagination.pageSize)))
      : undefined;

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    getRowId: getRowId
      ? (row, index) => getRowId(row, index)
      : (row, index) => {
          const r = row as { id?: string | number };
          return r.id != null ? String(r.id) : String(index);
        },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: checkboxSelection,
    enableMultiSort,
    manualPagination,
    manualSorting,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: manualPagination || hidePagination ? undefined : getPaginationRowModel(),
  });

  const scroll = useScrollOverflowFlags(stickyActions || stickyStart);
  const rows = table.getRowModel().rows;
  const showEmpty = !loading && !error && rows.length === 0;
  const totalCount = manualPagination ? (rowCount ?? 0) : data.length;

  const rootSx = useMemo(
    () =>
      getTableSx(theme, {
        stickyActions,
        stickyStart: stickyStart && checkboxSelection,
        minHeightPx,
        density,
      }),
    [theme, stickyActions, stickyStart, checkboxSelection, minHeightPx, density],
  );

  const emptyTitle = labels.emptyTitle ?? labels.empty;
  const emptyDescription =
    labels.emptyTitle && labels.empty && labels.empty !== labels.emptyTitle
      ? labels.empty
      : undefined;

  return (
    <Box
      sx={[rootSx, ...(Array.isArray(sx) ? sx : [sx])]}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      role="region"
    >
      {slots?.toolbar}
      {loading ? <LinearProgress className="azes-table-progress" /> : null}

      {showEmpty ? (
        <Box className="azes-table-empty">
          {slots?.emptyState ?? emptyState ?? (
            <AzesEmptyState
              title={emptyTitle ?? ''}
              description={emptyDescription}
              minHeight={minHeightPx}
            />
          )}
        </Box>
      ) : null}

      {!showEmpty ? (
        <TableContainer
          className="azes-table-scroll"
          ref={scroll.ref}
          data-overflow={scroll.overflow ? 'true' : 'false'}
          data-scrolled-end={scroll.scrolledEnd ? 'true' : 'false'}
          data-scrolled-start={scroll.scrolledStart ? 'true' : 'false'}
        >
          <Table className="azes-table-root" size={density === 'compact' ? 'small' : 'medium'}>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const actions = isActionsColumn(header.column);
                    const select = header.column.id === '__select';
                    const meta = header.column.columnDef.meta;
                    const sorted = header.column.getIsSorted();
                    const canSort = header.column.getCanSort();
                    const ariaSort =
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';
                    return (
                      <TableCell
                        key={header.id}
                        component="th"
                        scope="col"
                        className={joinClass(
                          'azes-table-head-cell',
                          actions && stickyActions && AZES_TABLE_STICKY_END_CLASS,
                          select && stickyStart && AZES_TABLE_STICKY_START_CLASS,
                          select && 'azes-table-checkbox-cell',
                          meta?.hideOnMobile && 'azes-table-hide-mobile',
                        )}
                        style={cellStyleFromMeta(meta)}
                        aria-sort={canSort ? ariaSort : undefined}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <ButtonBase
                            className={joinClass(
                              'azes-table-sort-button',
                              sorted && 'azes-table-sort-active',
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            disableRipple
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === 'asc' ? (
                              <ArrowUpwardOutlinedIcon className="azes-table-sort-icon" />
                            ) : sorted === 'desc' ? (
                              <ArrowDownwardOutlinedIcon className="azes-table-sort-icon" />
                            ) : (
                              <UnfoldMoreOutlinedIcon className="azes-table-sort-icon" />
                            )}
                            {enableMultiSort && typeof sorted === 'string' ? (
                              <span className="azes-table-sort-badge">
                                {header.column.getSortIndex() + 1}
                              </span>
                            ) : null}
                          </ButtonBase>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {loading && rows.length === 0
                ? Array.from({ length: floorRows }, (_, i) => (
                    <TableRow key={`sk-${i}`} className="azes-table-row">
                      {table.getVisibleLeafColumns().map((col, colIndex) => {
                        const meta = col.columnDef.meta;
                        const kind =
                          meta?.skeleton ??
                          (isActionsColumn(col) || meta?.isActions ? 'actions' : 'text');
                        return (
                          <TableCell
                            key={col.id}
                            className={joinClass(
                              'azes-table-body-cell',
                              isActionsColumn(col) && stickyActions && AZES_TABLE_STICKY_END_CLASS,
                              col.id === '__select' && stickyStart && AZES_TABLE_STICKY_START_CLASS,
                            )}
                          >
                            {kind === 'actions' ? (
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <AzesSkeleton shape="circle" index={i * 10 + colIndex} />
                                <AzesSkeleton shape="circle" index={i * 10 + colIndex + 1} />
                              </Box>
                            ) : (
                              <AzesSkeleton
                                shape={
                                  kind === 'avatar'
                                    ? 'avatar'
                                    : kind === 'chip'
                                      ? 'chip'
                                      : kind === 'image'
                                        ? 'image'
                                        : 'text'
                                }
                                width={
                                  kind === 'text'
                                    ? `${55 + ((i * 17 + colIndex * 31) % 41)}%`
                                    : undefined
                                }
                                index={i * 10 + colIndex}
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                : null}

              {!loading && error
                ? null
                : rows.map((row) => {
                    const selected = row.getIsSelected();
                    const highlighted =
                      highlightedRowId != null && highlightedRowId !== ''
                        ? row.id === highlightedRowId
                        : false;
                    const emphasize = selected || highlighted;
                    return (
                      <TableRow
                        key={row.id}
                        className={joinClass(
                          'azes-table-row',
                          emphasize && 'azes-table-row-selected',
                        )}
                        hover
                        selected={emphasize}
                        onClick={
                          onRowClick
                            ? (event) => {
                                onRowClick(row.original, event);
                              }
                            : undefined
                        }
                        sx={onRowClick ? { cursor: 'pointer' } : undefined}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const actions = isActionsColumn(cell.column);
                          const select = cell.column.id === '__select';
                          const meta = cell.column.columnDef.meta;
                          return (
                            <TableCell
                              key={cell.id}
                              className={joinClass(
                                'azes-table-body-cell',
                                actions && stickyActions && AZES_TABLE_STICKY_END_CLASS,
                                select && stickyStart && AZES_TABLE_STICKY_START_CLASS,
                                select && 'azes-table-checkbox-cell',
                                meta?.hideOnMobile && 'azes-table-hide-mobile',
                              )}
                              style={cellStyleFromMeta(meta)}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>

          {error && !loading ? (
            <Box className="azes-table-overlay" role="alert">
              {typeof error === 'boolean' ? null : error}
            </Box>
          ) : null}

          {loading && rows.length === 0 && slots?.loadingState ? (
            <Box className="azes-table-overlay">{slots.loadingState}</Box>
          ) : null}
        </TableContainer>
      ) : null}

      {!hidePagination && !showEmpty ? (
        <TablePagination
          className="azes-table-footer"
          component="div"
          count={totalCount}
          page={pagination.pageIndex}
          onPageChange={(_, page) => {
            setPagination((prev) => ({ ...prev, pageIndex: page }));
          }}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(event) => {
            const pageSize = Number(event.target.value);
            setPagination({ pageIndex: 0, pageSize });
          }}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage={labels.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) => labels.displayedRows(from, to, count)}
          slotProps={{
            actions: {
              previousButton: { 'aria-label': labels.previousPage },
              nextButton: { 'aria-label': labels.nextPage },
            },
          }}
        />
      ) : null}
    </Box>
  );
}
