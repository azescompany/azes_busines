/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/inputs.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-02
 * ║ Purpose: TextField, Select, choice controls, Slider, ToggleButton and Autocomplete overrides
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Components, Theme } from '@mui/material/styles';

import { DEFAULT_AZES_DENSITY, type AzesDensity } from '../density';

function primaryFocusRing(theme: Theme): string {
  const primary = theme.vars?.palette.primary.main ?? theme.palette.primary.main;
  return `0 0 0 3px color-mix(in srgb, ${primary} 35%, transparent)`;
}

export function inputComponents(density: AzesDensity = DEFAULT_AZES_DENSITY): Components<Theme> {
  const compact = density === 'compact';

  return {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        ...(compact ? { size: 'small' as const, margin: 'dense' as const } : {}),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusMd,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.text.secondary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.error.main,
          },
          '&.Mui-disabled': {
            backgroundColor: theme.vars.palette.action.disabledBackground,
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
        }),
      },
    },
    MuiFormControl: {
      defaultProps: {
        ...(compact ? { margin: 'dense' as const, size: 'small' as const } : {}),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          marginLeft: 0,
          '&.Mui-error': {
            color: theme.vars.palette.error.main,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused': {
            color: theme.vars.palette.primary.main,
          },
          '&.Mui-error': {
            color: theme.vars.palette.error.main,
          },
        }),
      },
    },
    MuiSelect: {
      defaultProps: {
        ...(compact ? { size: 'small' as const } : {}),
      },
    },
    MuiCheckbox: {
      defaultProps: {
        color: 'primary',
        ...(compact ? { size: 'small' as const } : {}),
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '&:focus-visible': {
            outline: 'none',
            boxShadow: primaryFocusRing(theme),
          },
        }),
      },
    },
    MuiRadio: {
      defaultProps: {
        color: 'primary',
        ...(compact ? { size: 'small' as const } : {}),
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '&:focus-visible': {
            outline: 'none',
            boxShadow: primaryFocusRing(theme),
          },
        }),
      },
    },
    MuiSwitch: {
      defaultProps: {
        color: 'primary',
        ...(compact ? { size: 'small' as const } : {}),
      },
    },
    MuiSlider: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.primary.main,
        }),
        thumb: ({ theme }) => ({
          '&:focus-visible': {
            boxShadow: primaryFocusRing(theme),
          },
        }),
      },
    },
    MuiToggleButton: {
      defaultProps: {
        ...(compact ? { size: 'small' as const } : {}),
      },
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          borderRadius: theme.shape.radiusMd,
          borderColor: theme.vars.palette.divider,
          '&.Mui-selected': {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 16%, transparent)`,
            color: theme.vars.palette.primary.main,
            borderColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, transparent)`,
            '&:hover': {
              backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 24%, transparent)`,
            },
          },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusMd,
        }),
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        ...(compact ? { size: 'small' as const } : {}),
      },
      styleOverrides: {
        popper: ({ theme }) => ({
          zIndex: theme.zIndex.modal,
        }),
        option: ({ theme }) => ({
          ...(compact
            ? {
                minHeight: theme.spacing(8),
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
              }
            : {}),
          '&[aria-selected="true"]': {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 12%, transparent)`,
          },
        }),
      },
    },
  };
}
