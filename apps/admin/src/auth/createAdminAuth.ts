/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/createAdminAuth.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Web auth client for admin — JWT cookies + AZES refresh
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  clearAccessTokenGetter,
  getOrCreateDeviceMeta,
  refreshAccessTokens,
  setAccessTokenGetter,
  setAccessTokenRefreshHandler,
  setAuthSessionInvalidatedHandler,
  setPaymentRequiredHandler,
} from '@azes/api';
import { postApiV1AuthLogout } from '@azes/api/azes/auth';
import {
  connectAuthToApi,
  createAuthClient,
  createWebAuthAdapter,
  sessionFromTokens,
  type AuthClient,
  type AuthSession,
} from '@azes/auth';

import { adminEnv } from '../config/env.js';
import { adminWebTokenCookieOptions } from './webTokenCookieOptions.js';

async function refreshSession(current: AuthSession): Promise<AuthSession | null> {
  const refreshToken = current.tokens.refreshToken?.trim();
  if (!refreshToken) return null;

  try {
    const { deviceId } = await getOrCreateDeviceMeta();
    const next = await refreshAccessTokens({
      refreshToken,
      deviceId,
    });
    if (!next.accessToken) return null;
    return sessionFromTokens(next.accessToken, next.refreshToken ?? refreshToken);
  } catch {
    return null;
  }
}

async function bestEffortLogout(client: AuthClient): Promise<void> {
  try {
    const session = await client.adapter.getSession();
    const refreshToken = session?.tokens.refreshToken?.trim();
    if (refreshToken) {
      await postApiV1AuthLogout({ refreshToken });
    }
  } catch {
    // Best-effort — local clear still proceeds
  }
}

function redirectToAccountLogin(): void {
  if (typeof window === 'undefined') return;
  const returnUrl = encodeURIComponent(window.location.href.split('#')[0] ?? window.location.origin);
  window.location.assign(`${adminEnv.accountAppUrl}/?returnUrl=${returnUrl}`);
}

export function createAdminAuthClient(): AuthClient {
  const adapter = createWebAuthAdapter({
    subjectStorage: typeof sessionStorage === 'undefined' ? undefined : sessionStorage,
    refreshSession,
    tokenCookies: adminWebTokenCookieOptions(),
  });
  const client = createAuthClient(adapter);
  connectAuthToApi(client, {
    setAccessTokenGetter,
    clearAccessTokenGetter,
    setAccessTokenRefreshHandler,
  });

  setAuthSessionInvalidatedHandler(async () => {
    await bestEffortLogout(client);
    await client.clearSession();
    redirectToAccountLogin();
  });

  setPaymentRequiredHandler(null);

  return client;
}
