/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/appsTriggerSx.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-06
 * ║ Purpose: Adobe-style Apps waffle control for toolbar and header
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { CSSObject, Theme } from '@mui/material/styles';

/** Adobe-like Apps waffle — flat icon; colors follow navigation surface tokens. */
export function appsTriggerSx(theme: Theme, surface: 'toolbar' | 'header' = 'header'): CSSObject {
  const onToolbar = surface === 'toolbar';
  return {
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: `${theme.shape.radiusSm}px`,
    color: 'var(--azes-nav-text-strong)',
    backgroundColor: 'transparent',
    borderWidth: onToolbar ? 0 : 1,
    borderStyle: 'solid',
    borderColor: onToolbar
      ? 'transparent'
      : 'color-mix(in srgb, var(--azes-nav-text-strong) 28%, transparent)',
    boxShadow: 'none',
    transition: theme.transitions.create(['background-color', 'border-color', 'opacity'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      backgroundColor: 'var(--azes-nav-hover)',
      boxShadow: 'none',
      transform: 'none',
    },
    '&:active, &:focus, &.Mui-focusVisible': {
      boxShadow: 'none',
      transform: 'none',
    },
    '& .MuiSvgIcon-root': {
      fontSize: 22,
      color: 'currentColor',
    },
  };
}
