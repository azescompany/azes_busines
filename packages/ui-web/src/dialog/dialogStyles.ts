/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/dialogStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Token-driven sx helpers for the global AzesDialog host
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

import { getBackdropSx } from '../backdrop/backdropStyles';
import type { AzesDialogVariant } from './types';

export type DialogPaletteTone = 'primary' | 'error' | 'info' | 'success' | 'warning';

export function resolveDialogTone(variant: AzesDialogVariant): DialogPaletteTone | null {
  switch (variant) {
    case 'confirm':
      return 'primary';
    case 'danger':
    case 'error':
      return 'error';
    case 'info':
      return 'info';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'custom':
      return null;
    default:
      return 'primary';
  }
}

function toneMain(theme: Theme, tone: DialogPaletteTone): string {
  return theme.vars.palette[tone].main;
}

export type DialogPaperStyleOptions = {
  paddingless?: boolean;
  hideFooter?: boolean;
  fullScreen?: boolean;
};

export function getDialogPaperSx(
  theme: Theme,
  options: DialogPaperStyleOptions = {},
): SxProps<Theme> {
  const tokens = theme.azes.dialog;
  return {
    borderRadius: options.fullScreen ? 0 : theme.azesRadius.lg,
    backgroundColor: theme.vars.palette.background.paper,
    border: options.fullScreen ? 'none' : `1px solid ${theme.vars.palette.border.default}`,
    boxShadow: theme.azes.customShadows.dialog,
    backgroundImage: 'none',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '& .MuiDialogContent-root': {
      paddingBlock: options.paddingless ? 0 : theme.spacing(tokens.paddingBlock),
      paddingInline: options.paddingless ? 0 : theme.spacing(tokens.paddingInline),
    },
    ...(options.hideFooter
      ? {}
      : {
          '& .MuiDialogActions-root': {
            paddingBlock: theme.spacing(tokens.paddingBlock),
            paddingInline: theme.spacing(tokens.paddingInline),
            paddingTop: 0,
            gap: theme.spacing(1),
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            [theme.breakpoints.down('sm')]: {
              flexDirection: 'column-reverse',
              alignItems: 'stretch',
              '& > :not(style)': {
                width: '100%',
                margin: 0,
              },
            },
          },
        }),
  };
}

/** @deprecated Prefer theme `MuiBackdrop` glass. Kept for callers that still import it. */
export function getDialogBackdropSx(theme: Theme): SxProps<Theme> {
  return getBackdropSx(theme);
}

export function getDialogIconSx(theme: Theme, tone: DialogPaletteTone): SxProps<Theme> {
  const tokens = theme.azes.dialog;
  const color = toneMain(theme, tone);
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: tokens.iconPadding,
    borderRadius: theme.azesRadius.full,
    color,
    backgroundColor: `color-mix(in srgb, ${color} ${tokens.iconMixPercent}%, transparent)`,
    mb: theme.spacing(tokens.contentGap),
    '& .MuiSvgIcon-root': {
      fontSize: tokens.iconSize,
    },
  };
}

export function getDialogContentStackSx(theme: Theme): SxProps<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(theme.azes.dialog.contentGap / 2),
  };
}

export function getDialogTitleSx(theme: Theme): SxProps<Theme> {
  return {
    typography: theme.azes.dialog.titleTypography,
    color: theme.vars.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
    p: 0,
  };
}

export function getDialogDescriptionSx(theme: Theme): SxProps<Theme> {
  return {
    typography: theme.azes.dialog.descriptionTypography,
    color: theme.vars.palette.text.secondary,
    m: 0,
  };
}
