/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/AzesSkeleton/AzesSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Token-driven skeleton block primitive (no MUI Skeleton)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';

import {
  getSkeletonBlockSx,
  type AzesSkeletonRadius,
  type AzesSkeletonShape,
} from '../skeletonStyles';

export type AzesSkeletonProps = {
  shape?: AzesSkeletonShape;
  width?: number | string;
  height?: number | string;
  /** Multi-line text; last line ≈ 60% width. */
  lines?: number;
  radius?: AzesSkeletonRadius;
  /** Stagger index for group fade-in. */
  index?: number;
  sx?: SxProps<Theme>;
};

export function AzesSkeleton({
  shape = 'text',
  width,
  height,
  lines = 1,
  radius,
  index = 0,
  sx,
}: AzesSkeletonProps) {
  const theme = useTheme();

  if (shape === 'text' && lines > 1) {
    return (
      <Box
        aria-hidden
        data-skeleton=""
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: width ?? '100%',
          ...(sx as object),
        }}
      >
        {Array.from({ length: lines }, (_, line) => (
          <Box
            key={line}
            aria-hidden
            data-skeleton=""
            sx={getSkeletonBlockSx(theme, {
              shape: 'text',
              width: line === lines - 1 ? '60%' : '100%',
              height,
              radius,
              index: index + line,
            })}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      aria-hidden
      data-skeleton=""
      sx={{
        ...(getSkeletonBlockSx(theme, { shape, width, height, radius, index }) as object),
        ...(sx as object),
      }}
    />
  );
}
