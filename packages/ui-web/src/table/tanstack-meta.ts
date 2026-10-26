/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/tanstack-meta.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-10
 * ║ Purpose: Typed ColumnMeta for AzesTable (TanStack Table v8)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {};

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    /** Marks trailing sticky actions column (also `id === 'actions'`). */
    isActions?: boolean;
    /** Optional: hide below `md` via CSS. */
    hideOnMobile?: boolean;
    /** Skeleton cell shape when the table is in first-load loading. */
    skeleton?: 'text' | 'avatar' | 'chip' | 'image' | 'actions';
  }
}
