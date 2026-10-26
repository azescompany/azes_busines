/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/consumeHandoff.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Consume Account `#azes_auth` hash handoff into Admin session
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { seedDeviceId } from '@azes/api';
import { sessionFromTokens, type AuthClient } from '@azes/auth';

export const AUTH_HANDOFF_KEY = 'azes_auth';

/** Align with Account `AUTH_HANDOFF_MAX_AGE_MS` (M0 — short-lived handoff). */
export const AUTH_HANDOFF_MAX_AGE_MS = 120_000;

export type AzesAuthHandoffPayload = {
  v: 1;
  issuedAt: number;
  accessToken: string;
  refreshToken?: string;
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
};

/** True when the URL hash still carries a pending Account SSO payload. */
export function hasPendingAuthHandoff(hash: string = window.location.hash): boolean {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  return raw.split('&').some((part) => part.startsWith(`${AUTH_HANDOFF_KEY}=`));
}

export function parseAuthHandoffHash(
  hash: string,
  nowMs: number = Date.now(),
): AzesAuthHandoffPayload | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const segment = raw.split('&').find((part) => part.startsWith(`${AUTH_HANDOFF_KEY}=`));
  if (!segment) return null;

  const encoded = segment.slice(`${AUTH_HANDOFF_KEY}=`.length);
  if (!encoded) return null;

  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json) as Partial<AzesAuthHandoffPayload>;
    if (parsed.v !== 1) return null;
    if (typeof parsed.issuedAt !== 'number' || !Number.isFinite(parsed.issuedAt)) return null;
    if (nowMs - parsed.issuedAt > AUTH_HANDOFF_MAX_AGE_MS) return null;
    if (parsed.issuedAt > nowMs + 30_000) return null; // clock skew guard
    if (!parsed.accessToken?.trim() || !parsed.deviceId?.trim()) return null;
    if (!parsed.userAgent?.trim() || !parsed.platform?.trim() || !parsed.language?.trim()) {
      return null;
    }
    return {
      v: 1,
      issuedAt: parsed.issuedAt,
      accessToken: parsed.accessToken.trim(),
      deviceId: parsed.deviceId.trim(),
      userAgent: parsed.userAgent.trim(),
      platform: parsed.platform.trim(),
      language: parsed.language.trim(),
      ...(parsed.refreshToken?.trim() ? { refreshToken: parsed.refreshToken.trim() } : {}),
    };
  } catch {
    return null;
  }
}

function clearHandoffHash(): void {
  if (typeof window === 'undefined') return;
  const { pathname, search } = window.location;
  window.history.replaceState(null, '', `${pathname}${search}`);
}

/**
 * Read `#azes_auth`, seed device fingerprint, establish session, strip hash.
 * Safe to call when no handoff is present (no-op).
 */
export async function consumeAuthHandoff(
  client: AuthClient,
): Promise<'ok' | 'missing' | 'invalid'> {
  if (typeof window === 'undefined') return 'missing';
  if (!hasPendingAuthHandoff()) return 'missing';

  const payload = parseAuthHandoffHash(window.location.hash);
  clearHandoffHash();
  if (!payload) return 'invalid';

  seedDeviceId(payload.deviceId, {
    userAgent: payload.userAgent,
    platform: payload.platform,
    language: payload.language,
  });

  await client.establishSession(
    sessionFromTokens(payload.accessToken, payload.refreshToken ?? null),
  );
  return 'ok';
}
