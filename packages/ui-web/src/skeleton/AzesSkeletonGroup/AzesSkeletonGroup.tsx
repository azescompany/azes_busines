/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/AzesSkeletonGroup/AzesSkeletonGroup.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-12
 * ║ Purpose: Skeleton group — Caspian wave overlay + a11y status
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use client';

import Box from '@mui/material/Box';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';

import { getSkeletonGroupSx, type AzesSkeletonMotion } from '../skeletonStyles';

export type AzesSkeletonGroupProps = {
  loading?: boolean;
  /** Visually hidden status text (i18n). */
  label?: ReactNode;
  variant?: AzesSkeletonMotion;
  sx?: SxProps<Theme>;
  children: ReactNode;
};

export function AzesSkeletonGroup({
  loading = true,
  label,
  variant = 'wave',
  sx,
  children,
}: AzesSkeletonGroupProps) {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });
  const motion: AzesSkeletonMotion = reduceMotion ? 'static' : variant;

  if (!loading) {
    return <>{children}</>;
  }

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-azes-skeleton-group=""
      data-azes-skeleton-motion={motion}
      sx={{
        ...(getSkeletonGroupSx(theme, motion) as object),
        ...(sx as object),
      }}
    >
      {label != null ? (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {label}
        </Box>
      ) : null}
      {children}
    </Box>
  );
}
