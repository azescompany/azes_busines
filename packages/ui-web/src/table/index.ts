/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public entry point for @azes/ui-web/table
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '../theme/mui-augment';
import './tanstack-meta';

export {
  AZES_TABLE_PAGE_SIZES,
  AzesTable,
  type AzesTableLabels,
  type AzesTablePaginationModel,
  type AzesTableProps,
  type AzesTableSlots,
} from './AzesTable';
export { AzesEmptyState, type AzesEmptyStateProps } from './AzesEmptyState';
export {
  AzesTableLabelsProvider,
  DEFAULT_AZES_TABLE_LABELS,
  resolveAzesTableLabels,
  useOptionalAzesTableLabels,
  type AzesTableLabelsProviderProps,
} from './AzesTableLabelsContext';
export {
  createActionsColumn,
  isActionsColumn,
  type CreateActionsColumnOptions,
} from './createActionsColumn';
export {
  AZES_TABLE_STICKY_END_CLASS,
  AZES_TABLE_STICKY_START_CLASS,
  calcTableMinHeightPx,
  getTableSx,
} from './tableStyles';

export {
  createColumnHelper,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
