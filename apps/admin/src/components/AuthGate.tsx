/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/components/AuthGate.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Require session — else redirect to Account login
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useAuthSession, useAuthSessionReady } from '@azes/auth';
import { useTranslation } from '@azes/i18n';
import { Box, Stack, Text } from '@azes/ui-web';
import { useEffect, type ReactNode } from 'react';

import { adminEnv } from '../config/env.js';
import { ADMIN_NAMESPACE } from '../i18n/createAdminI18n.js';

export type AuthGateProps = {
  children: ReactNode;
};

function redirectToAccountLogin(): void {
  const clean = window.location.href.split('#')[0] ?? window.location.origin;
  const returnUrl = encodeURIComponent(clean);
  window.location.assign(`${adminEnv.accountAppUrl}/?returnUrl=${returnUrl}`);
}

export function AuthGate({ children }: AuthGateProps) {
  const ready = useAuthSessionReady();
  const session = useAuthSession();
  const { t } = useTranslation(ADMIN_NAMESPACE);

  useEffect(() => {
    if (!ready) return;
    if (!session.isAuthenticated) {
      redirectToAccountLogin();
    }
  }, [ready, session.isAuthenticated]);

  if (!ready || !session.isAuthenticated) {
    return (
      <Box p={6} style={{ minHeight: '100vh' }}>
        <Stack gap={2}>
          <Text size="lg" weight="bold">
            AZES Admin
          </Text>
          <Text tone="muted">{t('shell.redirectLogin')}</Text>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}
