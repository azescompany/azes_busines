/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-12
 * ║ Purpose: Public entry for @azes/ui-web/skeleton
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use client';

export { AzesSkeleton, type AzesSkeletonProps } from './AzesSkeleton/AzesSkeleton';
export {
  AzesSkeletonGroup,
  type AzesSkeletonGroupProps,
} from './AzesSkeletonGroup/AzesSkeletonGroup';
export {
  defaultSkeletonSize,
  getSkeletonBlockSx,
  getSkeletonGroupSx,
  resolveSkeletonRadiusPx,
  type AzesSkeletonMotion,
  type AzesSkeletonRadius,
  type AzesSkeletonShape,
} from './skeletonStyles';
export {
  PageHeaderSkeleton,
  type PageHeaderSkeletonProps,
} from './compositions/PageHeaderSkeleton';
export {
  FiltersBarSkeleton,
  type FiltersBarSkeletonProps,
} from './compositions/FiltersBarSkeleton';
export {
  TableSkeleton,
  skeletonCellWidthPercent,
  type TableSkeletonColumn,
  type TableSkeletonProps,
} from './compositions/TableSkeleton';
export { FormSkeleton, type FormSkeletonProps } from './compositions/FormSkeleton';
export { DetailsSkeleton } from './compositions/DetailsSkeleton';
export { PageSkeleton, type PageSkeletonProps } from './compositions/PageSkeleton';
