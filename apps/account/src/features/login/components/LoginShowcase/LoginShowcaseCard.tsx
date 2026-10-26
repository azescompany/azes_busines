/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/components/LoginShowcase/LoginShowcaseCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Shared paper shell for decorative login showcase cards
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, useTheme } from '@azes/ui-web';
import type { ReactNode } from 'react';

import type { ScatterCardId } from '../../loginShellScatter.js';

export type LoginShowcaseCardProps = {
  id: ScatterCardId;
  rotate?: number;
  depth?: number;
  width?: string;
  children: ReactNode;
};

export function LoginShowcaseCard({
  id,
  rotate = 0,
  depth = 1,
  width,
  children,
}: LoginShowcaseCardProps) {
  const theme = useTheme();
  return (
    <MuiBox
      data-azes-card={id}
      data-azes-depth={depth}
      aria-hidden
      sx={{
        position: 'relative',
        width: width ?? '100%',
        borderRadius: `${theme.shape.radiusLg}px`,
        border: `1px solid ${theme.vars.palette.border.default}`,
        bgcolor: theme.vars.palette.background.paper,
        overflow: 'hidden',
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'center center',
        // Static shadow layer — opacity may animate; shadow values do not.
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          boxShadow: theme.azes.customShadows.card,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '& > *': { position: 'relative', zIndex: 1 },
        // Inner highlight
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          boxShadow: `inset 0 1px 0 color-mix(in srgb, ${theme.vars.palette.background.paper} 70%, transparent)`,
          zIndex: 2,
        },
      }}
    >
      {children}
    </MuiBox>
  );
}
