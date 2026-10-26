/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Accordion/AzesFormGrid.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Responsive field grid for accordion search/crud panels
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type AzesFormGridProps = {
  children: ReactNode;
  /** Desktop column count. Tablet uses min(2, columns), mobile always 1. */
  columns?: 1 | 2 | 3 | 4;
  sx?: SxProps<Theme>;
};

export function AzesFormGrid({ children, columns = 3, sx }: AzesFormGridProps) {
  const tablet = Math.min(2, columns) as 1 | 2;

  return (
    <Box
      sx={[
        (theme) => ({
          display: 'grid',
          gap: theme.spacing(2),
          gridTemplateColumns: '1fr',
          [theme.breakpoints.up('sm')]: {
            gridTemplateColumns: `repeat(${tablet}, minmax(0, 1fr))`,
          },
          [theme.breakpoints.up('md')]: {
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
