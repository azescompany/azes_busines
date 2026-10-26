/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Accordion/accordionStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Theme-driven sx builders for AzesAccordion
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { SxProps, Theme } from '@mui/material/styles';

export type AccordionStyleOptions = {
  mode: 'search' | 'crud';
  intent?: 'create' | 'edit';
  open: boolean;
};

/** Root shell sx. Caller merges user `sx` after this. */
export function getAccordionSx(theme: Theme, options: AccordionStyleOptions): SxProps<Theme> {
  const editIntent = options.mode === 'crud' && options.intent === 'edit';

  return {
    position: 'relative',
    width: '100%',
    minWidth: 0,
    border: `1px solid ${theme.vars.palette.border.default}`,
    borderRadius: `${theme.shape.radiusLg}px`,
    backgroundColor: theme.vars.palette.background.paper,
    overflow: 'hidden',
    ...(editIntent
      ? {
          '&::before': {
            content: '""',
            position: 'absolute',
            insetBlock: 0,
            insetInlineStart: 0,
            width: theme.spacing(0.375),
            backgroundColor: theme.vars.palette.primary.main,
            zIndex: 1,
          },
        }
      : {}),
  };
}

export function getAccordionHeaderSx(theme: Theme): SxProps<Theme> {
  const tokens = theme.azes.accordion;
  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    minHeight: tokens.headerMinHeight,
    width: '100%',
    margin: 0,
    paddingInline: theme.spacing(2),
    paddingBlock: theme.spacing(1),
    border: 'none',
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: theme.vars.palette.text.primary,
    textAlign: 'start',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    transition: theme.transitions.create(['background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tokens.headerHoverMixPercent}%, transparent)`,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.vars.palette.border.focus}`,
      outlineOffset: -2,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  };
}

export function getAccordionBodySx(theme: Theme): SxProps<Theme> {
  const tokens = theme.azes.accordion;
  return {
    borderTop: `1px solid ${theme.vars.palette.border.default}`,
    paddingBlock: theme.spacing(tokens.contentPaddingBlock),
    paddingInline: theme.spacing(tokens.contentPaddingInline),
  };
}

export function getAccordionFooterSx(theme: Theme): SxProps<Theme> {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginBlockStart: theme.spacing(2),
    paddingBlockStart: theme.spacing(2),
    borderTop: `1px solid ${theme.vars.palette.border.default}`,
    '& .MuiButton-root': {
      [theme.breakpoints.down('sm')]: {
        flex: '1 1 auto',
      },
    },
  };
}

export function getAccordionChipSx(theme: Theme): SxProps<Theme> {
  const tokens = theme.azes.accordion;
  return {
    backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tokens.chipMixPercent}%, ${theme.vars.palette.background.paper})`,
    color: theme.vars.palette.primary.main,
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeightMedium,
    height: theme.spacing(3),
    '& .MuiChip-deleteIcon': {
      color: theme.vars.palette.primary.main,
      fontSize: theme.typography.body2.fontSize,
      opacity: 0.8,
      '&:hover': { opacity: 1, color: theme.vars.palette.primary.main },
    },
  };
}
