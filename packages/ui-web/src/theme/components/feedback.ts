/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/feedback.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-10
 * ║ Purpose: Alert, Snackbar, Dialog, Menu, Popover, Tooltip, Progress, Skeleton and Backdrop overrides
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Components, Theme } from '@mui/material/styles';

import { getBackdropSx } from '../../backdrop/backdropStyles';

export function feedbackComponents(): Components<Theme> {
  return {
    MuiAlert: {
      defaultProps: {
        variant: 'standard',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusMd,
        }),
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.radiusLg,
          backgroundImage: 'none',
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingInline: theme.spacing(3),
          paddingBlock: theme.spacing(2),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingInline: theme.spacing(3),
          paddingBottom: theme.spacing(2),
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingInline: theme.spacing(3),
          paddingBottom: theme.spacing(2),
          gap: theme.spacing(1),
        }),
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiLinearProgress: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },
      styleOverrides: {
        root: {
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            backgroundImage: 'none',
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const invisible = Boolean(ownerState.invisible);
          const base = getBackdropSx(theme, { invisible }) as Record<string, unknown>;
          if (invisible) return base;
          return {
            ...base,
            // Menu/Popover always add this class; clear glass if ownerState lags.
            '&.MuiBackdrop-invisible': {
              backgroundColor: 'transparent',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
            },
          };
        },
        invisible: {
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterDelay: 300,
        leaveDelay: 100,
        arrow: false,
      },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.vars.palette.text.primary,
          color: theme.vars.palette.background.default,
          borderRadius: theme.shape.radiusSm,
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.fontWeightMedium,
          paddingBlock: theme.spacing(0.75),
          paddingInline: theme.spacing(1.5),
        }),
      },
    },
    MuiMenu: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.radiusLg,
          border: `1px solid ${theme.vars.palette.divider}`,
          backgroundImage: 'none',
          backgroundColor: theme.vars.palette.background.paper,
          color: theme.vars.palette.text.primary,
          boxShadow: `0 16px 40px color-mix(in srgb, ${theme.vars.palette.common.black} 14%, transparent), 0 2px 8px color-mix(in srgb, ${theme.vars.palette.primary.main} 8%, transparent)`,
          overflow: 'hidden',
          backgroundClip: 'padding-box',
        }),
        list: ({ theme }) => ({
          paddingBlock: theme.spacing(1),
          paddingInline: theme.spacing(1),
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusMd,
          gap: theme.spacing(2),
          marginBlock: theme.spacing(0.5),
          minHeight: theme.spacing(9),
          transition: theme.transitions.create(['background-color', 'color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 10%, transparent)`,
          },
          '&.Mui-selected': {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 16%, transparent)`,
            color: theme.vars.palette.text.primary,
            '&:hover': {
              backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 22%, transparent)`,
            },
          },
          '&.Mui-focusVisible': {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 12%, transparent)`,
          },
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.radiusLg,
          border: `1px solid ${theme.vars.palette.divider}`,
          backgroundImage: 'none',
          backgroundColor: theme.vars.palette.background.paper,
          boxShadow: `0 16px 40px color-mix(in srgb, ${theme.vars.palette.common.black} 14%, transparent)`,
        }),
      },
    },
    MuiCollapse: {
      defaultProps: {
        timeout: 'auto',
      },
    },
  };
}
