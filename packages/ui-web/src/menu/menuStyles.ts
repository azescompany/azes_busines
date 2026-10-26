/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/menu/menuStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Token-driven sx helpers for AzesMenu paper and items
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

import type { AzesMenuWidth } from './types';

export type MenuStyleOptions = {
  width?: AzesMenuWidth;
  maxHeight?: number | string;
  matchTriggerWidth?: boolean;
  triggerWidth?: number;
};

export function resolveMenuWidthPx(theme: Theme, width: AzesMenuWidth): number | 'auto' {
  const tokens = theme.azes.menu;
  switch (width) {
    case 'sm':
      return tokens.widthSm;
    case 'md':
      return tokens.widthMd;
    case 'auto':
    default:
      return 'auto';
  }
}

export function getMenuPaperSx(theme: Theme, options: MenuStyleOptions = {}): SxProps<Theme> {
  const tokens = theme.azes.menu;
  const width = options.width ?? 'auto';
  const resolved = resolveMenuWidthPx(theme, width);
  const maxHeight = options.maxHeight ?? tokens.maxHeight;

  return {
    mt: 1,
    // Must be a CSS length string — bare numbers in `sx` are multiplied by shape.borderRadius.
    borderRadius: `${tokens.paperRadius}px`,
    border: `1px solid ${theme.vars.palette.border.default}`,
    backgroundImage: 'none',
    backgroundColor: theme.vars.palette.background.paper,
    boxShadow: tokens.shadow,
    overflow: 'hidden',
    maxHeight,
    ...(options.matchTriggerWidth && options.triggerWidth
      ? { minWidth: options.triggerWidth }
      : resolved === 'auto'
        ? { minWidth: tokens.widthSm }
        : { width: resolved, minWidth: resolved }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  };
}

export function getMenuListSx(_theme: Theme): SxProps<Theme> {
  return {
    py: 1,
    px: 1,
    outline: 'none',
    maxHeight: 'inherit',
    overflowY: 'auto',
  };
}

export function getMenuItemSx(
  theme: Theme,
  options: { danger?: boolean; selected?: boolean } = {},
): SxProps<Theme> {
  const tokens = theme.azes.menu;
  const danger = Boolean(options.danger);

  return {
    borderRadius: `${tokens.itemRadius}px`,
    minHeight: tokens.itemMinHeight,
    gap: theme.spacing(1.5),
    px: 1.5,
    py: 0.75,
    alignItems: 'center',
    typography: 'body2',
    color: danger ? theme.vars.palette.error.main : theme.vars.palette.text.primary,
    transition: theme.transitions.create(['background-color', 'color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '&:hover': {
      backgroundColor: danger
        ? `color-mix(in srgb, ${theme.vars.palette.error.main} ${tokens.dangerHoverMixPercent}%, transparent)`
        : `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tokens.hoverMixPercent}%, transparent)`,
    },
    '&.Mui-focusVisible': {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tokens.focusMixPercent}%, transparent)`,
      outline: `1px solid ${theme.vars.palette.border.focus}`,
      outlineOffset: -1,
    },
    '&.Mui-selected, &[aria-checked="true"]': {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tokens.selectedMixPercent}%, transparent)`,
      color: theme.vars.palette.primary.main,
      '&:hover': {
        backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tokens.selectedMixPercent + 4}%, transparent)`,
      },
    },
    '&.Mui-disabled': {
      color: theme.vars.palette.text.disabled,
      opacity: 1,
    },
  };
}

export function getMenuHeaderSx(theme: Theme): SxProps<Theme> {
  return {
    px: 1.5,
    py: 1.25,
    mb: 0.5,
    borderBottom: `1px solid ${theme.vars.palette.border.default}`,
    // Typography left to the consumer (account name vs section caption).
    color: theme.vars.palette.text.primary,
  };
}

export function getMenuSectionHeaderSx(theme: Theme): SxProps<Theme> {
  return {
    px: 1.5,
    pt: 1.25,
    pb: 0.5,
    typography: 'caption',
    color: theme.vars.palette.text.secondary,
    pointerEvents: 'none',
  };
}

export function getMenuDividerSx(theme: Theme): SxProps<Theme> {
  return {
    my: 0.75,
    borderColor: theme.vars.palette.border.default,
  };
}
