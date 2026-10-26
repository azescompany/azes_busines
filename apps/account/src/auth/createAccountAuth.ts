/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/auth/createAccountAuth.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Web auth client for account — JWT cookies + AZES refresh
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

import { persistLogoutReason } from './logoutReason.js';
import { accountWebTokenCookieOptions } from './webTokenCookieOptions.js';

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

export function createAccountAuthClient(): AuthClient {
  const adapter = createWebAuthAdapter({
    subjectStorage: typeof sessionStorage === 'undefined' ? undefined : sessionStorage,
    refreshSession,
    tokenCookies: accountWebTokenCookieOptions(),
  });
  const client = createAuthClient(adapter);
  connectAuthToApi(client, {
    setAccessTokenGetter,
    clearAccessTokenGetter,
    setAccessTokenRefreshHandler,
  });

  setAuthSessionInvalidatedHandler(async ({ message, status }) => {
    persistLogoutReason(message, status === 403 ? 'sessionOtherDevice' : 'sessionUnauthorized');
    await bestEffortLogout(client);
    await client.clearSession();
    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  });

  // Pluggable payment hook — admin/product may navigate later; no payment UI here.
  setPaymentRequiredHandler(null);

  return client;
}
