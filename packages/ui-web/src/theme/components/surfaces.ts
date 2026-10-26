/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/surfaces.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-09
 * ║ Purpose: Paper/Card surface overrides — no elevation overlay, tinted levels
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Components, Theme } from '@mui/material/styles';

export function surfaceComponents(): Components<Theme> {
  return {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
        }),
        elevation1: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level1,
          backgroundImage: 'none',
        }),
        elevation2: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level2,
          backgroundImage: 'none',
        }),
        elevation3: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level3,
          backgroundImage: 'none',
        }),
        elevation4: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level3,
          backgroundImage: 'none',
        }),
        elevation6: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level3,
          backgroundImage: 'none',
        }),
        elevation8: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level3,
          backgroundImage: 'none',
        }),
        elevation12: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level3,
          backgroundImage: 'none',
        }),
        elevation16: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level3,
          backgroundImage: 'none',
        }),
        elevation24: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface.level3,
          backgroundImage: 'none',
        }),
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusLg,
          backgroundImage: 'none',
        }),
      },
    },
  };
}
