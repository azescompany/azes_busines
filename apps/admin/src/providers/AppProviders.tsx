/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/providers/AppProviders.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Query, auth, i18n, theme + Account SSO handoff boot
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { apiQueryDefaultOptions, configureApi } from '@azes/api';
import { AuthProvider, useAuthClient, useAuthSessionReady } from '@azes/auth';
import { I18nextProvider, useTranslation } from '@azes/i18n';
import { Box, Stack, Text } from '@azes/ui-web';
import { AzesUiProvider, configureAzesPrefsCookie } from '@azes/ui-web/settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { consumeAuthHandoff, hasPendingAuthHandoff } from '../auth/consumeHandoff.js';
import { createAdminAuthClient } from '../auth/createAdminAuth.js';
import { adminEnv } from '../config/env.js';
import { ADMIN_NAMESPACE, createAdminI18n } from '../i18n/createAdminI18n.js';

configureAzesPrefsCookie({
  ...(adminEnv.authCookieDomain ? { domain: adminEnv.authCookieDomain } : {}),
});

configureApi({ baseUrl: adminEnv.apiBaseUrl });

export type AppProvidersProps = {
  children: ReactNode;
};

type I18nInstance = Awaited<ReturnType<typeof createAdminI18n>>;

function BootShell({ label }: { label: string }) {
  return (
    <Box p={6} style={{ minHeight: '100vh' }}>
      <Stack gap={2}>
        <Text size="lg" weight="bold">
          AZES Admin
        </Text>
        <Text tone="muted">{label}</Text>
      </Stack>
    </Box>
  );
}

function HandoffBoot({ children }: { children: ReactNode }) {
  const client = useAuthClient();
  const sessionReady = useAuthSessionReady();
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const [handoffDone, setHandoffDone] = useState(() => !hasPendingAuthHandoff());

  useEffect(() => {
    if (handoffDone) return;
    let cancelled = false;
    void consumeAuthHandoff(client).finally(() => {
      if (!cancelled) setHandoffDone(true);
    });
    return () => {
      cancelled = true;
    };
  }, [client, handoffDone]);

  if (!sessionReady || !handoffDone) {
    return <BootShell label={t('shell.signingIn')} />;
  }

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: apiQueryDefaultOptions }),
    [],
  );
  const authClient = useMemo(() => createAdminAuthClient(), []);
  const [i18n, setI18n] = useState<I18nInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createAdminI18n().then((instance) => {
      if (!cancelled) setI18n(instance);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!i18n) {
    return (
      <AzesUiProvider>
        <BootShell label="…" />
      </AzesUiProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider client={authClient}>
        <I18nextProvider i18n={i18n}>
          <AzesUiProvider>
            <HandoffBoot>{children}</HandoffBoot>
          </AzesUiProvider>
        </I18nextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
