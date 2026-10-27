/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/EmptyState.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Diagonal-pattern empty / forbidden state
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Stack, Text, useTheme } from '@azes/ui-web';
import type { ReactNode } from 'react';

export type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const theme = useTheme();
  const stripe = `color-mix(in srgb, ${theme.palette.primary.main} 4%, transparent)`;

  return (
    <MuiBox
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 3,
        py: 6,
        textAlign: 'center',
        backgroundImage: `repeating-linear-gradient(45deg, ${stripe} 0, ${stripe} 1px, transparent 0, transparent 12px)`,
      }}
    >
      <Stack gap={2} align="center">
        {icon ? (
          <MuiBox sx={{ color: 'primary.main', display: 'inline-flex', fontSize: 40 }}>
            {icon}
          </MuiBox>
        ) : null}
        <Text size="lg" weight="bold">
          {title}
        </Text>
        {description ? (
          <Text tone="muted" size="sm">
            {description}
          </Text>
        ) : null}
        {action}
      </Stack>
    </MuiBox>
  );
}
