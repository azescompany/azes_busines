/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/client/connectApi.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Wire AuthClient to @azes/api token/refresh hooks (injected)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthClient } from './createAuthClient.js';

/**
 * Minimal API surface required for auth wiring. Apps pass functions from
 * `@azes/api` so this package does not depend on `@azes/api` (no cycles).
 */
export type AuthApiBridge = {
  setAccessTokenGetter: (
    getter: () => string | null | undefined | Promise<string | null | undefined>,
  ) => void;
  clearAccessTokenGetter: () => void;
  setAccessTokenRefreshHandler?: (handler: (() => Promise<boolean>) | null) => void;
};

export type AuthApiConnection = {
  disconnect: () => void;
};

/**
 * Registers the auth client as the HTTP bearer-token source (and optional 401 refresh).
 */
export function connectAuthToApi(client: AuthClient, api: AuthApiBridge): AuthApiConnection {
  api.setAccessTokenGetter(() => client.getAccessToken());
  api.setAccessTokenRefreshHandler?.(() => client.refresh());

  return {
    disconnect: () => {
      api.clearAccessTokenGetter();
      api.setAccessTokenRefreshHandler?.(null);
    },
  };
}
