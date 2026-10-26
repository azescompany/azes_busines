/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/backdrop/backdropStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Shared glass / plain sx for MuiBackdrop + AzesBackdrop
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

export type BackdropStyleOptions = {
  /** When true, no glass — transparent click-catcher (Menu/Popover/Select). */
  invisible?: boolean;
  /** Force plain dim without blur (AzesBackdrop variant="plain"). */
  plain?: boolean;
};

function tintPercent(theme: Theme): number {
  const mode = theme.palette.mode;
  const tokens = theme.azes.backdrop;
  return mode === 'dark' ? tokens.tintDark : tokens.tintLight;
}

function glassBackground(theme: Theme, opaqueBoost = 0): string {
  const tint = tintPercent(theme) + opaqueBoost;
  const primary = theme.vars.palette.primary.main;
  const base = theme.vars.palette.background.default;
  const tinted = `color-mix(in srgb, ${primary} ${tint}%, ${base})`;
  // Keep the page faintly visible behind the glass.
  const alpha = theme.palette.mode === 'dark' ? 72 : 62;
  return `color-mix(in srgb, ${tinted} ${alpha}%, transparent)`;
}

/**
 * Glass styles for visible backdrops. Invisible backdrops stay transparent
 * (Menu / Popover / Select click-away layers).
 */
export function getBackdropSx(theme: Theme, options: BackdropStyleOptions = {}): SxProps<Theme> {
  if (options.invisible) {
    return {
      backgroundColor: 'transparent',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    };
  }

  if (options.plain) {
    return {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.common.black} 48%, transparent)`,
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    };
  }

  const tokens = theme.azes.backdrop;
  const blur = `${tokens.blur}px`;
  const nestedBlur = `${tokens.nestedBlur}px`;
  const saturate = String(tokens.saturate);
  const filter = `blur(${blur}) saturate(${saturate})`;
  const nestedFilter = `blur(${nestedBlur}) saturate(${saturate})`;

  return {
    backgroundColor: glassBackground(theme),
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    transition: theme.transitions.create('opacity', {
      duration: tokens.duration,
    }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '@media (prefers-reduced-transparency: reduce)': {
      backgroundColor: glassBackground(theme, tokens.opaqueBoost),
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
    '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
      backgroundColor: glassBackground(theme, tokens.opaqueBoost),
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
    // Second modal layer: soften stacked blur.
    '.MuiModal-root ~ .MuiModal-root &': {
      backdropFilter: nestedFilter,
      WebkitBackdropFilter: nestedFilter,
    },
  };
}
