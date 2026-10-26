/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/buttons.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-15
 * ║ Purpose: Button overrides — contained labels always white on brand.dark fill
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import type { Components, Theme } from '@mui/material/styles';

import { buttonStyleOverrides, type AzesDensity } from '../density';

const { size } = primitives;

function primaryFocusRing(theme: Theme): string {
  const primary = theme.vars?.palette.primary.main ?? theme.palette.primary.main;
  return `0 0 0 3px color-mix(in srgb, ${primary} 35%, transparent)`;
}

/**
 * Dark-scheme brand `main` is intentionally light (accent). Contained fills use
 * `.dark` so the label can stay white instead of black contrastText.
 */
function containedBrandFill(
  theme: Theme,
  channel: 'primary' | 'secondary',
): { color: string; backgroundColor: string; '&:hover': { backgroundColor: string } } {
  const fill = theme.vars.palette[channel].dark;
  const black = theme.vars.palette.common.black;
  return {
    color: theme.vars.palette.common.white,
    backgroundColor: fill,
    '&:hover': {
      backgroundColor: `color-mix(in srgb, ${fill} 86%, ${black})`,
    },
  };
}

export function buttonComponents(density: AzesDensity = 'comfortable'): Components<Theme> {
  const button = buttonStyleOverrides[density];

  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: button.root,
        sizeSmall: button.sizeSmall,
        sizeMedium: button.sizeMedium,
        sizeLarge: button.sizeLarge,
        // White labels + `.dark` fill (MUI v9 has no `containedPrimary` override slot).
        contained: ({ theme }) => ({
          color: theme.vars.palette.common.white,
          '&.MuiButton-colorPrimary': containedBrandFill(theme, 'primary'),
          '&.MuiButton-colorSecondary': containedBrandFill(theme, 'secondary'),
        }),
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:focus-visible': {
            outline: 'none',
            boxShadow: primaryFocusRing(theme),
          },
        }),
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.radiusMd,
          // Do not animate `transform` globally — absolute-positioned controls (e.g. nav
          // mini toggle) rely on their own translate and would jump on click.
          transition: theme.transitions.create(['background-color', 'box-shadow', 'color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 12%, transparent)`,
          },
        }),
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeSmall: {
          fontSize: size.iconSm,
        },
        fontSizeMedium: {
          fontSize: size.iconMd,
        },
        fontSizeLarge: {
          fontSize: size.iconLg,
        },
      },
    },
  };
}
