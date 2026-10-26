/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/density.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-06
 * ║ Purpose: Comfortable and compact density metrics and component defaults
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import type { Components, Theme } from '@mui/material/styles';

const { radius, size, spacing, typography } = primitives;

export type AzesDensity = 'comfortable' | 'compact';

export const DEFAULT_AZES_DENSITY: AzesDensity = 'comfortable';

type ButtonSizeStyles = {
  root: {
    borderRadius: string;
    textTransform: 'none';
    fontWeight: number;
  };
  sizeSmall: {
    minHeight: string;
    paddingLeft: string;
    paddingRight: string;
    fontSize: string;
  };
  sizeMedium: {
    minHeight: string;
    paddingLeft: string;
    paddingRight: string;
    fontSize: string;
  };
  sizeLarge: {
    minHeight: string;
    paddingLeft: string;
    paddingRight: string;
    fontSize: string;
  };
};

const sharedButtonRoot = {
  borderRadius: radius.md,
  textTransform: 'none' as const,
  fontWeight: Number(typography.fontWeight.semibold),
};

export const buttonStyleOverrides: Record<AzesDensity, ButtonSizeStyles> = {
  comfortable: {
    root: sharedButtonRoot,
    sizeSmall: {
      minHeight: size.controlSm,
      paddingLeft: spacing[3],
      paddingRight: spacing[3],
      fontSize: typography.fontSize.sm,
    },
    sizeMedium: {
      minHeight: size.controlMd,
      paddingLeft: spacing[4],
      paddingRight: spacing[4],
      fontSize: typography.fontSize.md,
    },
    sizeLarge: {
      minHeight: size.controlLg,
      paddingLeft: spacing[5],
      paddingRight: spacing[5],
      fontSize: typography.fontSize.lg,
    },
  },
  compact: {
    root: sharedButtonRoot,
    sizeSmall: {
      // Keep ≥36px touch target (40px on coarse pointers via media below).
      minHeight: '36px',
      paddingLeft: spacing[2],
      paddingRight: spacing[2],
      fontSize: typography.fontSize.sm,
    },
    sizeMedium: {
      minHeight: '36px',
      paddingLeft: spacing[3],
      paddingRight: spacing[3],
      fontSize: typography.fontSize.sm,
    },
    sizeLarge: {
      minHeight: size.controlMd,
      paddingLeft: spacing[4],
      paddingRight: spacing[4],
      fontSize: typography.fontSize.md,
    },
  },
};

/** @deprecated Use buttonStyleOverrides.comfortable */
export const comfortableButton = buttonStyleOverrides.comfortable;

export function densityComponentDefaults(density: AzesDensity): Components<Theme> {
  if (density === 'comfortable') {
    return {};
  }

  return {
    // TextField / Select / FormControl / Autocomplete / choice controls: owned by inputs.ts
    // so defaultProps (variant + compact size) merge in one place.
    MuiList: {
      defaultProps: {
        dense: true,
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiListItemButton: {
      defaultProps: {
        dense: true,
      },
    },
    MuiMenuItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingBlock: 6,
        },
        sizeSmall: {
          paddingBlock: 4,
        },
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          minWidth: 36,
          minHeight: 36,
          '@media (pointer: coarse)': {
            minWidth: 40,
            minHeight: 40,
          },
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          paddingBlock: 6,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 12,
          '&:last-child': { paddingBottom: 12 },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 16,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingBlock: 12,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: 12,
        },
      },
    },
  };
}
