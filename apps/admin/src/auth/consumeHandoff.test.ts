/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/consumeHandoff.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Unit tests for Account → Admin `#azes_auth` consume
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it, vi } from 'vitest';

import {
  AUTH_HANDOFF_KEY,
  AUTH_HANDOFF_MAX_AGE_MS,
  consumeAuthHandoff,
  hasPendingAuthHandoff,
  parseAuthHandoffHash,
  type AzesAuthHandoffPayload,
} from './consumeHandoff.js';

function encodePayload(payload: AzesAuthHandoffPayload): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

const validPayload: AzesAuthHandoffPayload = {
  v: 1,
  issuedAt: Date.now(),
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  deviceId: 'device-1',
  userAgent: 'VitestUA',
  platform: 'Win32',
  language: 'en-US',
};

describe('hasPendingAuthHandoff / parseAuthHandoffHash', () => {
  it('detects and parses a valid handoff hash', () => {
    const hash = `#${AUTH_HANDOFF_KEY}=${encodePayload(validPayload)}`;
    expect(hasPendingAuthHandoff(hash)).toBe(true);
    expect(parseAuthHandoffHash(hash)).toEqual(validPayload);
  });

  it('rejects incomplete fingerprints', () => {
    const bad = encodePayload({ ...validPayload, userAgent: '' });
    expect(parseAuthHandoffHash(`#${AUTH_HANDOFF_KEY}=${bad}`)).toBeNull();
  });

  it('rejects stale issuedAt', () => {
    const stale = encodePayload({
      ...validPayload,
      issuedAt: Date.now() - AUTH_HANDOFF_MAX_AGE_MS - 1,
    });
    expect(parseAuthHandoffHash(`#${AUTH_HANDOFF_KEY}=${stale}`)).toBeNull();
  });

  it('rejects missing issuedAt', () => {
    const { issuedAt: _omit, ...rest } = validPayload;
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(rest))));
    expect(parseAuthHandoffHash(`#${AUTH_HANDOFF_KEY}=${encoded}`)).toBeNull();
  });

  it('returns missing for empty hash', () => {
    expect(hasPendingAuthHandoff('')).toBe(false);
    expect(parseAuthHandoffHash('')).toBeNull();
  });
});

describe('consumeAuthHandoff', () => {
  it('seeds session and clears the hash', async () => {
    const encoded = encodePayload({ ...validPayload, issuedAt: Date.now() });
    window.history.replaceState(null, '', `/#${AUTH_HANDOFF_KEY}=${encoded}`);

    const establishSession = vi.fn().mockResolvedValue(undefined);
    const result = await consumeAuthHandoff({
      establishSession,
    } as never);

    expect(result).toBe('ok');
    expect(establishSession).toHaveBeenCalledOnce();
    expect(window.location.hash).toBe('');
  });

  it('is a no-op when hash is absent', async () => {
    window.history.replaceState(null, '', '/');
    const establishSession = vi.fn();
    const result = await consumeAuthHandoff({
      establishSession,
    } as never);
    expect(result).toBe('missing');
    expect(establishSession).not.toHaveBeenCalled();
  });
});
