/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/baseline.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-06
 * ║ Purpose: CssBaseline overrides for document reset and motion
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import type { Components, Theme } from '@mui/material/styles';

const { typography } = primitives;

export function baselineComponents(): Components<Theme> {
  return {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        html: {
          boxSizing: 'border-box',
          minHeight: '100%',
        },
        '*, *::before, *::after': {
          boxSizing: 'inherit',
        },
        'html, body, #root': {
          minHeight: '100%',
        },
        body: {
          margin: 0,
          minHeight: '100%',
          backgroundColor: theme.vars.palette.background.default,
          color: theme.vars.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          fontSize: typography.fontSize.md,
          lineHeight: typography.lineHeight.normal,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          scrollbarColor: `${theme.vars.palette.divider} ${theme.vars.palette.background.default}`,
        },
        '::selection': {
          backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 28%, transparent)`,
          color: theme.vars.palette.text.primary,
        },
        a: {
          color: theme.vars.palette.text.link,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      }),
    },
  };
}
