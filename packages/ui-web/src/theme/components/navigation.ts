/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/navigation.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-02
 * ║ Purpose: AppBar, Drawer, Tabs and Breadcrumbs theme overrides
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Components, Theme } from '@mui/material/styles';

export function navigationComponents(): Components<Theme> {
  return {
    MuiAppBar: {
      defaultProps: {
        color: 'default',
        elevation: 0,
        component: 'header',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.vars.palette.background.paper,
          color: theme.vars.palette.text.primary,
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        }),
        colorTransparent: {
          backgroundColor: 'transparent',
          borderBottomColor: 'transparent',
        },
      },
    },
    MuiDrawer: {
      defaultProps: {
        ModalProps: {
          keepMounted: true,
        },
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: 'none',
          borderRight: `1px solid ${theme.vars.palette.divider}`,
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          backgroundColor: theme.vars.palette.primary.main,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.secondary,
        }),
      },
    },
  };
}
