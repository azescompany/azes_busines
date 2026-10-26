/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/components/HomePage.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shell Home page for @azes/account (no business logic)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Box, Stack, Text } from '@azes/ui-web';
import { useTranslation } from '@azes/i18n';

import { appMeta } from '../config/appMeta.js';

export function HomePage() {
  const { t } = useTranslation('common');

  return (
    <Box p={6} style={{ minHeight: '100vh' }}>
      <Stack gap={4}>
        <Text size="2xl" weight="bold">
          AZES {appMeta.name}
        </Text>
        <Text tone="muted">
          Platform: {appMeta.platform} · Environment: {appMeta.env}
        </Text>
        <Text size="sm" tone="muted">
          {t('save')} · Application shell — ready for future features.
        </Text>
      </Stack>
    </Box>
  );
}
