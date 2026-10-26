/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/compositions/FormSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Form grid skeleton matching AzesFormGrid density
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';

import { AzesSkeleton } from '../AzesSkeleton/AzesSkeleton';

export type FormSkeletonProps = {
  fields?: number;
  columns?: 1 | 2;
};

export function FormSkeleton({ fields = 6, columns = 2 }: FormSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, 1fr)` },
          gap: 2,
        }}
      >
        {Array.from({ length: fields }, (_, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <AzesSkeleton shape="text" width="36%" index={i * 2} />
            <AzesSkeleton shape="rect" index={i * 2 + 1} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 1 }}>
        <AzesSkeleton shape="button" index={fields * 2} />
        <AzesSkeleton shape="button" index={fields * 2 + 1} />
      </Box>
    </Box>
  );
}
