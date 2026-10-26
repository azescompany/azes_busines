/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/data-display.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: Chip, Link, List, Table, Avatar, Badge, Accordion and Pagination overrides
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Components, Theme } from '@mui/material/styles';

import { DEFAULT_AZES_DENSITY, type AzesDensity } from '../density';

function primaryMix(theme: Theme, amount: number): string {
  return `color-mix(in srgb, ${theme.vars.palette.primary.main} ${amount}%, transparent)`;
}

export function dataDisplayComponents(
  density: AzesDensity = DEFAULT_AZES_DENSITY,
): Components<Theme> {
  const compact = density === 'compact';

  return {
    MuiChip: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusFull,
          transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
          color: theme.vars.palette.text.secondary,
          backgroundColor: theme.vars.palette.background.paper,
          '& .MuiChip-label': {
            color: 'inherit',
          },
          '&:hover': {
            backgroundColor: theme.vars.palette.action.hover,
          },
        }),
        filled: ({ theme }) => ({
          backgroundColor: theme.vars.palette.action.selected,
          color: theme.vars.palette.text.primary,
        }),
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.link,
        }),
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusMd,
          fontWeight: theme.typography.fontWeightBold,
        }),
        colorDefault: ({ theme }) => ({
          backgroundColor: theme.vars.palette.secondary.main,
          color: theme.vars.palette.secondary.contrastText,
        }),
      },
    },
    MuiAvatarGroup: {
      styleOverrides: {
        avatar: ({ theme }) => ({
          borderColor: theme.vars.palette.background.paper,
        }),
      },
    },
    MuiBadge: {
      defaultProps: {
        color: 'error',
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusMd,
          '&:hover': {
            backgroundColor: primaryMix(theme, 8),
          },
          '&.Mui-selected': {
            backgroundColor: primaryMix(theme, 16),
            '&:hover': {
              backgroundColor: primaryMix(theme, 24),
            },
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.vars.palette.primary.main} 35%, transparent)`,
          },
        }),
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('md')]: {
            overflowX: 'auto',
          },
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-head': {
            fontWeight: theme.typography.fontWeightBold,
            color: theme.vars.palette.text.primary,
            borderBottom: `1px solid ${theme.vars.palette.divider}`,
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottomColor: theme.vars.palette.divider,
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-selected': {
            backgroundColor: primaryMix(theme, 12),
            '&:hover': {
              backgroundColor: primaryMix(theme, 16),
            },
          },
          '&.MuiTableRow-hover:hover': {
            backgroundColor: primaryMix(theme, 6),
          },
        }),
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        elevation: 0,
        square: false,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.vars.palette.divider}`,
          borderRadius: `${theme.shape.radiusMd} !important`,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        }),
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: compact ? theme.spacing(10) : theme.spacing(12),
          paddingInline: theme.spacing(2),
        }),
        content: {
          margin: 0,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingInline: theme.spacing(2),
          paddingBottom: theme.spacing(2),
          color: theme.vars.palette.text.secondary,
        }),
      },
    },
    MuiPagination: {
      defaultProps: {
        color: 'primary',
        ...(compact ? { size: 'small' as const } : {}),
      },
    },
    MuiTablePagination: {
      defaultProps: {
        ...(compact ? { size: 'small' as const } : {}),
      },
    },
  };
}
