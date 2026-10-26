/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/createActionsColumn.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Helper for trailing sticky actions ColumnDef
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ColumnDef } from '@tanstack/react-table';

export type CreateActionsColumnOptions<TData> = {
  cell: ColumnDef<TData, unknown>['cell'];
  header?: ColumnDef<TData, unknown>['header'];
  width?: number;
  id?: string;
};

/**
 * Trailing actions column: sticky end, no sort/resize/hide.
 * Action IconButtons inside `cell` must include `aria-label`.
 */
export function createActionsColumn<TData>(
  options: CreateActionsColumnOptions<TData>,
): ColumnDef<TData, unknown> {
  const width = options.width ?? 96;
  return {
    id: options.id ?? 'actions',
    header: options.header ?? '',
    cell: options.cell,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    meta: {
      isActions: true,
      width,
      align: 'right',
    },
    size: width,
  };
}

export function isActionsColumn<TData>(column: {
  id: string;
  columnDef: ColumnDef<TData, unknown>;
}): boolean {
  if (column.id === 'actions') return true;
  return column.columnDef.meta?.isActions === true;
}
