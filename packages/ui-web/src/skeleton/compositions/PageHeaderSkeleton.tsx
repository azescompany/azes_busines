/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/compositions/PageHeaderSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Page title + actions skeleton row
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { AzesSkeleton } from '../AzesSkeleton/AzesSkeleton';

export type PageHeaderSkeletonProps = {
  actions?: number;
};

export function PageHeaderSkeleton({ actions = 1 }: PageHeaderSkeletonProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
        mb: 2,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AzesSkeleton shape="text" width="42%" height={theme.spacing(3.5)} index={0} />
        <Box sx={{ mt: 1 }}>
          <AzesSkeleton shape="text" width="28%" index={1} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        {Array.from({ length: actions }, (_, i) => (
          <AzesSkeleton key={i} shape="button" index={2 + i} />
        ))}
      </Box>
    </Box>
  );
}
