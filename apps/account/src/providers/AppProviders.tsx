/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/providers/AppProviders.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-20
 * ║ Purpose: Query, auth, account i18n, store, theme + device fingerprint seed
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { apiQueryDefaultOptions, configureApi, seedDeviceId } from '@azes/api';
import { AuthProvider } from '@azes/auth';
import { I18nextProvider } from '@azes/i18n';
import { AzesStoreProvider, createAzesStore } from '@azes/state';
import { AzesUiProvider, configureAzesPrefsCookie } from '@azes/ui-web/settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { createAccountAuthClient } from '../auth/createAccountAuth.js';
import { accountEnv } from '../config/env.js';
import { createAccountI18n } from '../i18n/createAccountI18n.js';
import { CaspianKeyLoader } from '../loading/index.js';

configureAzesPrefsCookie({
  ...(accountEnv.authCookieDomain ? { domain: accountEnv.authCookieDomain } : {}),
});

type I18nInstance = Awaited<ReturnType<typeof createAccountI18n>>;

export type AppProvidersProps = {
  children: ReactNode;
};

configureApi({ baseUrl: accountEnv.apiBaseUrl });
// Incomplete override (id without UA) is the classic localhost→prod login 400.
// Refuse to seed a half fingerprint; fall through to atomic getOrCreateDeviceMeta.
if (accountEnv.deviceIdOverride && accountEnv.deviceUserAgentOverride) {
  seedDeviceId(accountEnv.deviceIdOverride, {
    userAgent: accountEnv.deviceUserAgentOverride,
    platform: accountEnv.devicePlatformOverride,
    language: accountEnv.deviceLanguageOverride,
  });
} else if (accountEnv.deviceIdOverride && typeof console !== 'undefined') {
  console.warn(
    '[account] VITE_DEVICE_ID set without VITE_DEVICE_USER_AGENT — ignored. ' +
      'Copy the full login body fingerprint (deviceId + userAgent + platform + language).',
  );
}
export function AppProviders({ children }: AppProvidersProps) {
  const store = useMemo(() => createAzesStore(), []);
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: apiQueryDefaultOptions }),
    [],
  );
  const authClient = useMemo(() => createAccountAuthClient(), []);
  const [i18n, setI18n] = useState<I18nInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createAccountI18n().then((instance) => {
      if (!cancelled) {
        setI18n(instance);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!i18n) {
    // Read shared prefs cookie so boot matches admin (dark / primary) before i18n.
    return (
      <AzesUiProvider>
        <CaspianKeyLoader
          brandLabel="AZES Academy"
          label="Loading…"
          subtitle="Preparing AZES Academy"
        />
      </AzesUiProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider client={authClient}>
        <AzesStoreProvider store={store}>
          <I18nextProvider i18n={i18n}>
            <AzesUiProvider>{children}</AzesUiProvider>
          </I18nextProvider>
        </AzesStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
