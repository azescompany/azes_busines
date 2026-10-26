/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/compositions/TableSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Layout-matched table skeleton (header + deterministic rows)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import type { ColumnDef } from '@tanstack/react-table';

import { calcTableMinHeightPx } from '../../table/tableStyles';
import { AzesSkeleton } from '../AzesSkeleton/AzesSkeleton';
import type { AzesSkeletonShape } from '../skeletonStyles';

export type TableSkeletonColumn = {
  id: string;
  skeleton?: 'text' | 'avatar' | 'chip' | 'image' | 'actions';
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  stickyEnd?: boolean;
};

export type TableSkeletonProps = {
  /** Prefer real column defs — meta.skeleton / isActions are read. */
  columns?: ColumnDef<unknown, unknown>[] | TableSkeletonColumn[];
  rows?: number;
};

/** Deterministic cell width % from row/col (no Math.random). */
export function skeletonCellWidthPercent(row: number, col: number): number {
  const n = ((row * 17 + col * 31) % 41) / 41;
  return 55 + Math.round(n * 40);
}

function normalizeColumns(
  columns?: ColumnDef<unknown, unknown>[] | TableSkeletonColumn[],
): TableSkeletonColumn[] {
  if (!columns?.length) {
    return [
      { id: 'c0', skeleton: 'text' },
      { id: 'c1', skeleton: 'text' },
      { id: 'c2', skeleton: 'chip' },
      { id: 'actions', skeleton: 'actions', stickyEnd: true },
    ];
  }
  return columns.map((col, index) => {
    if ('accessorKey' in col || 'accessorFn' in col || 'cell' in col || 'header' in col) {
      const def = col as ColumnDef<unknown, unknown>;
      const meta = def.meta;
      const id = def.id ?? String(index);
      const isActions = Boolean(meta?.isActions) || id === 'actions';
      return {
        id,
        skeleton: meta?.skeleton ?? (isActions ? 'actions' : 'text'),
        width: meta?.width,
        align: meta?.align,
        stickyEnd: isActions,
      };
    }
    return col as TableSkeletonColumn;
  });
}

function cellShape(kind: TableSkeletonColumn['skeleton']): AzesSkeletonShape {
  switch (kind) {
    case 'avatar':
      return 'avatar';
    case 'chip':
      return 'chip';
    case 'image':
      return 'image';
    case 'actions':
      return 'circle';
    default:
      return 'text';
  }
}

export function TableSkeleton({ columns, rows }: TableSkeletonProps) {
  const theme = useTheme();
  const cols = normalizeColumns(columns);
  const rowCount = rows ?? theme.azes.table.minVisibleRows;
  const minHeight = calcTableMinHeightPx(theme, rowCount);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: `${minHeight}px`,
        border: `1px solid ${theme.vars.palette.border.default}`,
        borderRadius: `${theme.shape.radiusMd}px`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: cols.map((c) => c.width ?? '1fr').join(' '),
          gap: 2,
          px: 2,
          alignItems: 'center',
          height: `${theme.azes.table.headerHeight}px`,
          borderBottom: `1px solid ${theme.vars.palette.border.default}`,
          bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 3%, ${theme.vars.palette.background.paper})`,
        }}
      >
        {cols.map((col, i) => (
          <AzesSkeleton key={`h-${col.id}`} shape="text" width="70%" index={i} />
        ))}
      </Box>
      {Array.from({ length: rowCount }, (_, row) => (
        <Box
          key={`r-${row}`}
          sx={{
            display: 'grid',
            gridTemplateColumns: cols.map((c) => c.width ?? '1fr').join(' '),
            gap: 2,
            px: 2,
            alignItems: 'center',
            height: `${theme.azes.table.rowHeight}px`,
            borderBottom: row === rowCount - 1 ? 'none' : `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          {cols.map((col, colIndex) => {
            if (col.skeleton === 'actions') {
              return (
                <Box key={col.id} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <AzesSkeleton shape="circle" index={row * cols.length + colIndex} />
                  <AzesSkeleton shape="circle" index={row * cols.length + colIndex + 1} />
                </Box>
              );
            }
            const shape = cellShape(col.skeleton);
            const width =
              shape === 'text' || shape === 'chip'
                ? `${skeletonCellWidthPercent(row, colIndex)}%`
                : undefined;
            return (
              <Box
                key={col.id}
                sx={{
                  display: 'flex',
                  justifyContent:
                    col.align === 'right'
                      ? 'flex-end'
                      : col.align === 'center'
                        ? 'center'
                        : 'flex-start',
                }}
              >
                <AzesSkeleton shape={shape} width={width} index={row * cols.length + colIndex} />
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
