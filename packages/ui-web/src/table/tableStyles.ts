/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/tableStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-10
 * ║ Purpose: Theme-driven sx for AzesTable (sticky actions + chrome)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

export const AZES_TABLE_STICKY_END_CLASS = 'azes-table-sticky-end';
export const AZES_TABLE_STICKY_START_CLASS = 'azes-table-sticky-start';

export type TableStyleOptions = {
  stickyActions: boolean;
  stickyStart: boolean;
  minHeightPx: number;
  density: 'compact' | 'standard';
};

function opaqueHoverFill(theme: Theme, mixPercent: number): string {
  const tint = `color-mix(in srgb, ${theme.vars.palette.primary.main} ${mixPercent}%, transparent)`;
  return `linear-gradient(${tint}, ${tint})`;
}

export function calcTableMinHeightPx(theme: Theme, minRows: number): number {
  const tb = theme.azes.table;
  return tb.headerHeight + minRows * tb.rowHeight + tb.footerHeight;
}

/** Build root sx for AzesTable. Caller merges user `sx` after this. */
export function getTableSx(theme: Theme, options: TableStyleOptions): SxProps<Theme> {
  const tb = theme.azes.table;
  const paper = theme.vars.palette.background.paper;
  const muted = theme.vars.palette.background.muted ?? theme.vars.palette.background.default;
  const stickyEnd = options.stickyActions;
  const stickyStart = options.stickyStart;
  const stickyEndShadow = `-4px 0 12px color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, transparent)`;
  const stickyStartShadow = `4px 0 12px color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, transparent)`;

  return {
    position: 'relative',
    width: '100%',
    minWidth: 0,
    border: `1px solid ${theme.vars.palette.border.default}`,
    borderRadius: `${theme.shape.radiusLg}px`,
    backgroundColor: paper,
    minHeight: options.minHeightPx,
    // Clip horizontal bleed for radius; never create a Y scrollport (page/scoop scrolls).
    overflowX: 'hidden',
    overflowY: 'visible',
    display: 'flex',
    flexDirection: 'column',

    '& .azes-table-progress': {
      position: 'absolute',
      insetInline: 0,
      insetBlockStart: 0,
      zIndex: 5,
      height: 2,
    },

    '& .azes-table-scroll': {
      width: '100%',
      // Horizontal only — sticky actions need X overflow; height follows rows.
      overflowX: 'auto',
      overflowY: 'visible',
    },

    '& .azes-table-root': {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      tableLayout: 'auto',
    },

    '& .azes-table-head-cell': {
      ...theme.typography[tb.headerTypography],
      color: theme.vars.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
      backgroundColor: muted,
      borderBottom: `1px solid ${theme.vars.palette.border.default}`,
      paddingInline: tb.cellPaddingX,
      paddingBlock: theme.spacing(options.density === 'compact' ? 1 : 1.5),
      height: tb.headerHeight,
      whiteSpace: 'nowrap',
      position: 'sticky',
      insetBlockStart: 0,
      zIndex: 2,
      textTransform: 'none',
      '&:focus-visible': {
        outline: `2px solid ${theme.vars.palette.border.focus}`,
        outlineOffset: -2,
      },
    },

    '& .azes-table-sort-button': {
      ...theme.typography[tb.headerTypography],
      color: 'inherit',
      fontWeight: 'inherit',
      textTransform: 'none',
      letterSpacing: 'inherit',
      padding: 0,
      minWidth: 0,
      gap: theme.spacing(0.75),
      justifyContent: 'flex-start',
      '& .azes-table-sort-icon': {
        opacity: 0,
        transition: theme.transitions.create('opacity', {
          duration: theme.transitions.duration.shorter,
        }),
        fontSize: '1.1em',
      },
      '&:hover .azes-table-sort-icon, &:focus-visible .azes-table-sort-icon': {
        opacity: 0.55,
      },
      '&.azes-table-sort-active': {
        color: theme.vars.palette.primary.main,
        '& .azes-table-sort-icon': {
          opacity: 1,
          color: theme.vars.palette.primary.main,
        },
      },
    },

    '& .azes-table-sort-badge': {
      ...theme.typography.caption,
      color: theme.vars.palette.primary.main,
      marginInlineStart: theme.spacing(0.5),
    },

    '& .azes-table-body-cell': {
      ...theme.typography[tb.cellTypography],
      color: theme.vars.palette.text.primary,
      borderBottom: `1px solid ${theme.vars.palette.border.default}`,
      borderRight: 'none',
      paddingInline: tb.cellPaddingX,
      paddingBlock: theme.spacing(options.density === 'compact' ? 1 : 1.5),
      height: tb.rowHeight,
      backgroundColor: paper,
      '&:focus-visible': {
        outline: `2px solid ${theme.vars.palette.border.focus}`,
        outlineOffset: -2,
      },
    },

    '& .azes-table-row:last-of-type .azes-table-body-cell': {
      borderBottom: 'none',
    },

    '& .azes-table-row:hover .azes-table-body-cell': {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tb.hoverMixPercent}%, transparent)`,
    },

    '& .azes-table-row.azes-table-row-selected .azes-table-body-cell': {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tb.selectedMixPercent}%, transparent)`,
    },

    '& .azes-table-row.azes-table-row-selected:hover .azes-table-body-cell': {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${tb.selectedMixPercent + 4}%, transparent)`,
    },

    '& .azes-table-checkbox-cell': {
      width: theme.spacing(6),
      paddingInline: theme.spacing(1),
      textAlign: 'center',
    },

    '& .azes-table-footer': {
      ...theme.typography[tb.footerTypography],
      color: theme.vars.palette.text.secondary,
      borderTop: `1px solid ${theme.vars.palette.border.default}`,
      backgroundColor: paper,
      minHeight: tb.footerHeight,
      flexShrink: 0,
    },

    '& .azes-table-empty': {
      width: '100%',
      minWidth: 0,
      flex: 1,
    },

    '& .azes-table-overlay': {
      ...theme.typography.body2,
      color: theme.vars.palette.text.secondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: options.minHeightPx - tb.footerHeight,
      padding: theme.spacing(4),
      backgroundColor: `color-mix(in srgb, ${paper} 88%, transparent)`,
    },

    ...(stickyEnd
      ? {
          [`& .${AZES_TABLE_STICKY_END_CLASS}`]: {
            position: 'sticky',
            insetInlineEnd: 0,
            zIndex: 3,
            backgroundColor: paper,
            backgroundImage: 'none',
          },
          [`& .azes-table-head-cell.${AZES_TABLE_STICKY_END_CLASS}`]: {
            backgroundColor: muted,
            zIndex: 4,
          },
          [`& .azes-table-row:hover .azes-table-body-cell.${AZES_TABLE_STICKY_END_CLASS}`]: {
            backgroundColor: paper,
            backgroundImage: opaqueHoverFill(theme, tb.hoverMixPercent),
          },
          [`& .azes-table-row.azes-table-row-selected .azes-table-body-cell.${AZES_TABLE_STICKY_END_CLASS}`]:
            {
              backgroundColor: paper,
              backgroundImage: opaqueHoverFill(theme, tb.selectedMixPercent),
            },
          [`& .azes-table-row.azes-table-row-selected:hover .azes-table-body-cell.${AZES_TABLE_STICKY_END_CLASS}`]:
            {
              backgroundColor: paper,
              backgroundImage: opaqueHoverFill(theme, tb.selectedMixPercent + 4),
            },
          '& .azes-table-scroll[data-overflow="true"][data-scrolled-end="false"]': {
            [`& .${AZES_TABLE_STICKY_END_CLASS}`]: {
              boxShadow: stickyEndShadow,
            },
          },
        }
      : {}),

    ...(stickyStart
      ? {
          [`& .${AZES_TABLE_STICKY_START_CLASS}`]: {
            position: 'sticky',
            insetInlineStart: 0,
            zIndex: 3,
            backgroundColor: paper,
            backgroundImage: 'none',
          },
          [`& .azes-table-head-cell.${AZES_TABLE_STICKY_START_CLASS}`]: {
            backgroundColor: muted,
            zIndex: 4,
          },
          [`& .azes-table-row:hover .azes-table-body-cell.${AZES_TABLE_STICKY_START_CLASS}`]: {
            backgroundColor: paper,
            backgroundImage: opaqueHoverFill(theme, tb.hoverMixPercent),
          },
          '& .azes-table-scroll[data-overflow="true"][data-scrolled-start="false"]': {
            [`& .${AZES_TABLE_STICKY_START_CLASS}`]: {
              boxShadow: stickyStartShadow,
            },
          },
        }
      : {}),

    '& .azes-table-hide-mobile': {
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },
  };
}
