/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/PageHeader.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Premium page header with diagonal primary wash
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Stack, Text, useTheme } from '@azes/ui-web';
import type { ReactNode } from 'react';

export type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  startAdornment?: ReactNode;
};

export function PageHeader({ title, subtitle, actions, startAdornment }: PageHeaderProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const wash = `linear-gradient(135deg, color-mix(in srgb, ${primary} 10%, transparent) 0%, color-mix(in srgb, ${primary} 2%, transparent) 55%, transparent 100%)`;

  return (
    <MuiBox
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 2.5 },
        background: wash,
        transition: theme.transitions.create(['background-color', 'border-color'], {
          duration: 180,
        }),
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
    >
      <MuiBox
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" gap={2} align="center">
          {startAdornment}
          <Stack gap={1}>
            <Text size="2xl" weight="bold">
              {title}
            </Text>
            {subtitle ? (
              <Text tone="muted" size="sm">
                {subtitle}
              </Text>
            ) : null}
          </Stack>
        </Stack>
        {actions ? (
          <MuiBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {actions}
          </MuiBox>
        ) : null}
      </MuiBox>
    </MuiBox>
  );
}
