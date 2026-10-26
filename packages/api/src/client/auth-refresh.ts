/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/auth-refresh.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Pluggable single-flight access-token refresh for 401 retry
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type AccessTokenRefreshHandler = () => Promise<boolean>;

let accessTokenRefreshHandler: AccessTokenRefreshHandler | null = null;
let inFlight: Promise<boolean> | null = null;

/** Register auth refresh. Return true when a new token is available. */
export function setAccessTokenRefreshHandler(handler: AccessTokenRefreshHandler | null): void {
  accessTokenRefreshHandler = handler;
}

/**
 * Single-flight refresh: parallel 401s share one handler invocation.
 * Refresh HTTP itself must use `skipAuthRefresh: true` (see refreshAccessTokens).
 */
export async function tryRefreshAccessToken(): Promise<boolean> {
  if (!accessTokenRefreshHandler) {
    return false;
  }
  if (!inFlight) {
    inFlight = accessTokenRefreshHandler().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
