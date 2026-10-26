/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/auth/adminHandoff.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-26
 * ║ Purpose: Post-login redirect — full device fingerprint + hash handoff
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  createDocumentCookieStore,
  resolveDefaultWebTokenCookieOptions,
  writeDeviceIdCookie,
} from '@azes/auth';

import { accountEnv } from '../config/env.js';
import { accountWebTokenCookieOptions } from './webTokenCookieOptions.js';

/** Max age for `#azes_auth` payload (M0 hardening — not a signature). */
export const AUTH_HANDOFF_MAX_AGE_MS = 120_000;

export type AzesAuthHandoffPayload = {
  v: 1;
  /** Epoch ms when Account built the handoff — Admin rejects stale payloads. */
  issuedAt: number;
  accessToken: string;
  refreshToken?: string;
  /** Login-bound device id — admin must reuse the same DeviceId headers. */
  deviceId: string;
  /** Full fingerprint registered at login (required for prod API bind). */
  userAgent: string;
  platform: string;
  language: string;
};

export type AdminHandoffTokens = {
  accessToken: string;
  refreshToken?: string | null;
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
};

const HANDOFF_KEY = 'azes_auth';

/** Build the admin URL with a short-lived hash payload. Tokens are not put in the query string. */
export function buildAdminHandoffUrl(
  tokens: AdminHandoffTokens,
  baseUrl: string = accountEnv.adminAppUrl,
): string {
  const payload: AzesAuthHandoffPayload = {
    v: 1,
    issuedAt: Date.now(),
    accessToken: tokens.accessToken,
    deviceId: tokens.deviceId,
    userAgent: tokens.userAgent,
    platform: tokens.platform,
    language: tokens.language,
    ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url = new URL(baseUrl);
  url.hash = `${HANDOFF_KEY}=${encoded}`;
  return url.toString();
}

/**
 * Origins allowed as post-login `returnUrl`
 * (admin + academy + agent-site + marketplace).
 * Default handoff stays `adminAppUrl` — Academy is returnUrl-only.
 */
function allowedHandoffOrigins(): string[] {
  const origins: string[] = [];
  for (const raw of [
    accountEnv.adminAppUrl,
    accountEnv.academyAppUrl,
    accountEnv.agentSiteAppUrl,
    accountEnv.realEstateSiteAppUrl,
  ]) {
    try {
      origins.push(new URL(raw).origin);
    } catch {
      // ignore malformed env
    }
  }
  return origins;
}

/** True when `returnUrl` origin is admin, academy, agent-site, or marketplace. */
export function isAllowedHandoffReturnUrl(returnUrl: string): boolean {
  try {
    return allowedHandoffOrigins().includes(new URL(returnUrl).origin);
  } catch {
    return false;
  }
}

/**
 * Resolve post-login navigation base. Default remains admin (`adminAppUrl`).
 * `returnUrl` is honored only when its origin is allowlisted (incl. Academy).
 */
export function resolvePostLoginHandoffUrl(): string {
  if (typeof window === 'undefined') {
    return accountEnv.adminAppUrl;
  }
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')?.trim();
  if (!returnUrl) {
    return accountEnv.adminAppUrl;
  }
  if (isAllowedHandoffReturnUrl(returnUrl)) {
    return returnUrl;
  }
  return accountEnv.adminAppUrl;
}

/**
 * Persist login deviceId for cross-port mutator, then navigate with hash handoff.
 * Cookies carry JWTs + bare deviceId; hash carries the **full** fingerprint (ports do not
 * share localStorage). Default target is still admin when `returnUrl` is absent/invalid.
 */
export function redirectToAdminAfterLogin(tokens: AdminHandoffTokens): void {
  const store = createDocumentCookieStore();
  const options = resolveDefaultWebTokenCookieOptions(accountWebTokenCookieOptions());
  if (store) {
    writeDeviceIdCookie(store, tokens.deviceId, options);
  }
  window.location.assign(buildAdminHandoffUrl(tokens, resolvePostLoginHandoffUrl()));
}
