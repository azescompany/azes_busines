/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/sidePanelStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Token-driven sx helpers for AzesSidePanel host
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

import type { AzesSidePanelWidth } from './registry';

export function resolveSidePanelWidthPx(theme: Theme, width: AzesSidePanelWidth): number {
  const tokens = theme.azes.sidePanel;
  switch (width) {
    case 'sm':
      return tokens.widthSm;
    case 'lg':
      return tokens.widthLg;
    case 'md':
    default:
      return tokens.widthMd;
  }
}

export function getSidePanelPaperSx(theme: Theme, width: AzesSidePanelWidth): SxProps<Theme> {
  const desktopWidth = resolveSidePanelWidthPx(theme, width);
  return {
    width: { xs: '100%', sm: desktopWidth },
    maxWidth: '100vw',
    backgroundImage: 'none',
    backgroundColor: theme.vars.palette.background.paper,
    borderInlineStart: `1px solid ${theme.vars.palette.border.default}`,
    boxShadow: theme.azes.customShadows.card,
    display: 'flex',
    flexDirection: 'column',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  };
}

export function getSidePanelHeaderSx(theme: Theme): SxProps<Theme> {
  const tokens = theme.azes.sidePanel;
  return {
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    px: tokens.paddingInline,
    py: theme.spacing(2),
    minHeight: tokens.headerMinHeight,
    backgroundColor: theme.vars.palette.background.paper,
    borderBlockEnd: `1px solid ${theme.vars.palette.border.default}`,
  };
}

export function getSidePanelTitleSx(theme: Theme): SxProps<Theme> {
  return {
    m: 0,
    typography: theme.azes.sidePanel.titleTypography,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.vars.palette.text.primary,
  };
}

export function getSidePanelSubtitleSx(theme: Theme): SxProps<Theme> {
  return {
    m: 0,
    mt: 0.25,
    typography: theme.azes.sidePanel.subtitleTypography,
    color: theme.vars.palette.text.secondary,
  };
}

export function getSidePanelBodySx(theme: Theme): SxProps<Theme> {
  const tokens = theme.azes.sidePanel;
  return {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    px: tokens.paddingInline,
    pt: tokens.paddingBlock,
    pb: theme.spacing(10),
    scrollbarWidth: 'thin',
  };
}

export function getSidePanelFooterSx(theme: Theme): SxProps<Theme> {
  const tokens = theme.azes.sidePanel;
  return {
    position: 'sticky',
    insetBlockEnd: 0,
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    px: tokens.paddingInline,
    pt: theme.spacing(2),
    pb: theme.spacing(2.5),
    backgroundColor: theme.vars.palette.background.paper,
    borderBlockStart: `1px solid ${theme.vars.palette.border.default}`,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      alignItems: 'stretch',
      '& > :not(style)': {
        width: '100%',
      },
    },
  };
}
