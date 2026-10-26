/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/AzesEmptyState.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Large Paper empty surface for tables / list regions
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type AzesEmptyStateProps = {
  /** Primary line (i18n). */
  title: string;
  /** Supporting line (i18n). */
  description?: string;
  /** Optional leading mark; defaults to inbox glyph. */
  icon?: ReactNode;
  /** Optional CTA under the copy. */
  action?: ReactNode;
  /** Match table floor height when used as AzesTable empty. */
  minHeight?: number | string;
  sx?: SxProps<Theme>;
};

/** Full-width Paper empty surface — not an in-cell / overlay scrap. */
export function AzesEmptyState({
  title,
  description,
  icon,
  action,
  minHeight,
  sx,
}: AzesEmptyStateProps) {
  const theme = useTheme();
  const mark = icon ?? <InboxOutlinedIcon fontSize="inherit" aria-hidden />;

  return (
    <Paper
      variant="outlined"
      role="status"
      data-azes-empty-state=""
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          width: '100%',
          minHeight: minHeight ?? theme.spacing(28),
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 7 },
          textAlign: 'center',
          borderRadius: `${theme.shape.radiusLg}px`,
          borderStyle: 'dashed',
          borderColor: theme.vars.palette.border.default,
          backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 4%, ${theme.vars.palette.background.paper})`,
          ...theme.applyStyles('dark', {
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 8%, ${theme.vars.palette.background.paper})`,
          }),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        aria-hidden
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: theme.spacing(8),
          height: theme.spacing(8),
          borderRadius: '50%',
          fontSize: theme.spacing(4),
          color: theme.vars.palette.primary.main,
          backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 14%, ${theme.vars.palette.background.paper})`,
          ...theme.applyStyles('dark', {
            color: theme.vars.palette.primary.light,
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 22%, ${theme.vars.palette.background.paper})`,
          }),
        }}
      >
        {mark}
      </Box>
      <Box sx={{ maxWidth: theme.spacing(56) }}>
        <Typography variant="h6" component="p" sx={{ fontWeight: 700, mb: description ? 1 : 0 }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ mt: 1 }}>{action}</Box> : null}
    </Paper>
  );
}
