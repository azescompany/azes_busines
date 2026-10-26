/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/compositions/FiltersBarSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Filter accordion trigger + chip placeholders
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';

import { AzesSkeleton } from '../AzesSkeleton/AzesSkeleton';

export type FiltersBarSkeletonProps = {
  chips?: number;
};

export function FiltersBarSkeleton({ chips = 3 }: FiltersBarSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', mb: 2 }}>
      <AzesSkeleton shape="rect" width="100%" index={0} />
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
        {Array.from({ length: chips }, (_, i) => (
          <AzesSkeleton key={i} shape="chip" width={`${28 + ((i * 13) % 20)}%`} index={1 + i} />
        ))}
      </Box>
    </Box>
  );
}
