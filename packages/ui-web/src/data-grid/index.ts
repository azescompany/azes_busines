/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/data-grid/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-09
 * ║ Purpose: Public entry point for @azes/ui-web/data-grid (MUI X community)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '../theme/mui-augment';

export {
  AZES_DATA_GRID_PAGE_SIZES,
  AZES_STICKY_END_CLASS,
  AzesDataGrid,
  type AzesDataGridProps,
} from './AzesDataGrid';
export type { GridColDef, GridRowsProp, GridValidRowModel } from '@mui/x-data-grid';
