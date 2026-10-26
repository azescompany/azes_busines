/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/home/components/HomeView/HomeView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Admin Home scoop — brand + welcome (no dashboard clutter)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useAuthSession } from '@azes/auth';
import { useTranslation } from '@azes/i18n';
import { MuiBox, Stack, Text } from '@azes/ui-web';

import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';

export function HomeView() {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const session = useAuthSession();
  const name = session.fullName?.trim();

  return (
    <MuiBox
      sx={{
        maxWidth: { xs: '100%', md: 720 },
        pt: { xs: 0.5, md: 1 },
      }}
    >
      <Stack gap={3}>
        <Text size="2xl" weight="bold">
          {t('home.title')}
        </Text>
        <Text tone="muted" size="md">
          {name ? `${t('home.welcome')}, ${name}` : t('home.subtitle')}
        </Text>
        {name ? (
          <Text tone="muted" size="sm">
            {t('home.subtitle')}
            {session.role ? ` · ${session.role}` : ''}
          </Text>
        ) : null}
      </Stack>
    </MuiBox>
  );
}
