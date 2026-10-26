/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/compositions/PageSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Generic content-area page skeleton (route Suspense)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { AzesSkeletonGroup } from '../AzesSkeletonGroup/AzesSkeletonGroup';
import { FiltersBarSkeleton } from './FiltersBarSkeleton';
import { PageHeaderSkeleton } from './PageHeaderSkeleton';
import { TableSkeleton } from './TableSkeleton';

export type PageSkeletonProps = {
  label?: ReactNode;
};

export function PageSkeleton({ label }: PageSkeletonProps) {
  return (
    <AzesSkeletonGroup loading label={label}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', py: 1 }}>
        <PageHeaderSkeleton actions={2} />
        <FiltersBarSkeleton />
        <TableSkeleton />
      </Box>
    </AzesSkeletonGroup>
  );
}
