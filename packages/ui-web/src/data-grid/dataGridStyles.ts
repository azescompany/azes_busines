/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/data-grid/dataGridStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Theme-driven sx for AzesDataGrid (clean table + sticky actions)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

export const AZES_STICKY_END_CLASS = 'azes-sticky-end';

export type DataGridStyleOptions = {
  stickyActions: boolean;
  minHeightPx: number;
  maxHeight?: number | string;
  autoHeight: boolean;
  fillParent: boolean;
};

function opaqueHoverFill(theme: Theme, mixPercent: number): string {
  const tint = `color-mix(in srgb, ${theme.vars.palette.primary.main} ${mixPercent}%, transparent)`;
  return `linear-gradient(${tint}, ${tint})`;
}

/** Build DataGrid sx from theme tokens. Caller merges user `sx` after this. */
export function getDataGridSx(theme: Theme, options: DataGridStyleOptions): SxProps<Theme> {
  const dg = theme.azes.dataGrid;
  const paper = theme.vars.palette.background.paper;
  const muted = theme.vars.palette.background.muted ?? theme.vars.palette.background.default;
  const sticky = options.stickyActions;
  const isRtl = theme.direction === 'rtl';
  const stickyEdge = isRtl ? 'left' : 'right';
  const stickyShadow = isRtl
    ? `4px 0 12px color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, transparent)`
    : `-4px 0 12px color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, transparent)`;

  return {
    borderColor: theme.vars.palette.border.default,
    borderRadius: `${theme.shape.radiusLg}px`,
    backgroundColor: paper,
    minHeight: options.minHeightPx,
    ...(options.maxHeight != null
      ? { maxHeight: options.maxHeight, overflow: options.autoHeight ? 'auto' : undefined }
      : {}),
    ...(options.fillParent ? { height: '100%' } : {}),
    '--DataGrid-containerBackground': muted,
    '--DataGrid-rowBorderColor': theme.vars.palette.border.default,
    typography: 'body2',
    color: theme.vars.palette.text.primary,

    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: muted,
      borderBottom: `1px solid ${theme.vars.palette.border.default}`,
      minHeight: `${dg.headerHeight}px !important`,
      maxHeight: `${dg.headerHeight}px !important`,
    },
    '& .MuiDataGrid-columnHeader': {
      paddingInline: dg.cellPaddingX,
      '&:focus-visible': {
        outline: `2px solid ${theme.vars.palette.border.focus}`,
        outlineOffset: -2,
      },
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      ...theme.typography.subtitle2,
      color: theme.vars.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
      letterSpacing: theme.typography.body2.letterSpacing,
      textTransform: 'none',
    },
    '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-columnHeaderTitle': {
      color: theme.vars.palette.primary.main,
    },
    '& .MuiDataGrid-sortIcon': {
      opacity: 0,
      transition: theme.transitions.create('opacity', {
        duration: theme.transitions.duration.shorter,
      }),
      color: theme.vars.palette.text.secondary,
    },
    '& .MuiDataGrid-columnHeader:hover .MuiDataGrid-sortIcon, & .MuiDataGrid-columnHeader--sorted .MuiDataGrid-sortIcon':
      {
        opacity: 1,
      },
    '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-sortIcon': {
      color: theme.vars.palette.primary.main,
    },
    '& .MuiDataGrid-columnHeader--sortable': {
      cursor: 'pointer',
    },
    '& .MuiDataGrid-iconSeparator': {
      opacity: 0,
      visibility: 'hidden',
    },
    '& .MuiDataGrid-columnHeader:hover .MuiDataGrid-iconSeparator, & .MuiDataGrid-columnHeader--resizable:hover .MuiDataGrid-iconSeparator':
      {
        opacity: 0.4,
        visibility: 'visible',
        color: theme.vars.palette.border.strong,
      },
    '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-sortIndex': {
      ...theme.typography.caption,
      color: theme.vars.palette.primary.main,
    },

    '& .MuiDataGrid-row': {
      '&:hover': {
        backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${dg.hoverMixPercent}%, transparent)`,
      },
      '&.Mui-selected': {
        backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${dg.selectedMixPercent}%, transparent)`,
        '&:hover': {
          backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} ${dg.selectedMixPercent + 4}%, transparent)`,
        },
      },
    },
    '& .MuiDataGrid-cell': {
      borderBottom: `1px solid ${theme.vars.palette.border.default}`,
      borderRight: 'none',
      paddingInline: dg.cellPaddingX,
      ...theme.typography.body2,
      '&:focus-visible': {
        outline: `2px solid ${theme.vars.palette.border.focus}`,
        outlineOffset: -2,
      },
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: `1px solid ${theme.vars.palette.border.default}`,
      backgroundColor: paper,
      minHeight: dg.footerHeight,
      ...theme.typography.caption,
      color: theme.vars.palette.text.secondary,
    },
    '& .MuiTablePagination-root': {
      color: theme.vars.palette.text.secondary,
    },
    '& .MuiDataGrid-overlayWrapper': {
      minHeight: options.minHeightPx - dg.footerHeight,
    },
    '& .MuiDataGrid-overlay': {
      backgroundColor: `color-mix(in srgb, ${paper} 88%, transparent)`,
      ...theme.typography.body2,
      color: theme.vars.palette.text.secondary,
    },
    '& .MuiLinearProgress-root': {
      height: 2,
    },

    ...(sticky
      ? {
          [`& .MuiDataGrid-columnHeader.${AZES_STICKY_END_CLASS}, & .MuiDataGrid-cell.${AZES_STICKY_END_CLASS}`]:
            {
              position: 'sticky',
              [stickyEdge]: 0,
              zIndex: 3,
              backgroundColor: paper,
              backgroundImage: 'none',
              boxShadow: stickyShadow,
            },
          [`& .MuiDataGrid-columnHeader.${AZES_STICKY_END_CLASS}`]: {
            backgroundColor: muted,
            zIndex: 4,
          },
          [`& .MuiDataGrid-row:hover .MuiDataGrid-cell.${AZES_STICKY_END_CLASS}`]: {
            backgroundColor: paper,
            backgroundImage: opaqueHoverFill(theme, dg.hoverMixPercent),
          },
          [`& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell.${AZES_STICKY_END_CLASS}`]: {
            backgroundColor: paper,
            backgroundImage: opaqueHoverFill(theme, dg.selectedMixPercent),
          },
          [`& .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell.${AZES_STICKY_END_CLASS}`]: {
            backgroundColor: paper,
            backgroundImage: opaqueHoverFill(theme, dg.selectedMixPercent + 4),
          },
        }
      : {}),
  };
}

export function calcDataGridMinHeightPx(theme: Theme, minRows: number): number {
  const dg = theme.azes.dataGrid;
  return dg.headerHeight + minRows * dg.rowHeight + dg.footerHeight;
}
