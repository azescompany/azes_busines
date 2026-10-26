/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesContentRail.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-14
 * ║ Updated: 2026-10-14
 * ║ Purpose: Settings-aware content column (Fixed maxWidth / Fluid full)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use client';

import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import type { ReactNode } from 'react';

import { useOptionalAzesSettings } from '../settings/AzesSettingsProvider';
import type { AzesContainer } from '../settings/types';

export type AzesContentRailProps = {
  children: ReactNode;
  /** Override settings container for this rail. */
  container?: AzesContainer;
  /** Skip horizontal gutters (section already padded / full-bleed media). */
  disableGutters?: boolean;
  sx?: BoxProps['sx'];
};

/**
 * Inner content column for marketing / full-bleed pages.
 * Header, section backgrounds, and footer stay edge-to-edge; rails respect
 * settings `container: 'fixed' | 'fluid'`.
 */
export function AzesContentRail({
  children,
  container: containerProp,
  disableGutters = false,
  sx,
}: AzesContentRailProps) {
  const settingsContainer = useOptionalAzesSettings((s) => s.container);
  const container = containerProp ?? settingsContainer ?? 'fluid';
  const fixed = container === 'fixed';

  return (
    <Box
      data-azes-content-rail=""
      data-azes-container={container}
      sx={[
        (theme) => ({
          width: '100%',
          maxWidth: fixed ? theme.azes.layout.contentMaxWidth : 'none',
          marginInline: fixed ? 'auto' : 0,
          boxSizing: 'border-box',
          paddingInline: disableGutters
            ? 0
            : { xs: theme.spacing(2), md: theme.spacing(3), lg: theme.spacing(4) },
          transition: theme.transitions.create(['max-width', 'padding'], { duration: 200 }),
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
