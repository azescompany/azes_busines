/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/cookies/webTokenCookies.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-09
 * ║ Purpose: Unit tests for web JWT + device cookie read/write/clear
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import {
  clearWebTokenCookies,
  readAccessTokenCookieForRefresh,
  readDeviceIdCookie,
  readWebTokenCookies,
  sessionFromWebTokenCookies,
  WEB_DEVICE_ID_COOKIE,
  WEB_TOKEN_COOKIE_NAMES,
  writeDeviceIdCookie,
  writeWebTokenCookies,
  type WebTokenCookieOptions,
  type WebTokenCookieStore,
} from './webTokenCookies.js';

function createMemoryCookieStore(): WebTokenCookieStore & { jar: Map<string, string> } {
  const jar = new Map<string, string>();
  return {
    jar,
    read(name) {
      return jar.get(name);
    },
    write(name, value) {
      jar.set(name, value);
    },
    remove(name) {
      jar.delete(name);
    },
  };
}

const options: WebTokenCookieOptions = {
  path: '/',
  secure: false,
  sameSite: 'Strict',
  accessMaxAgeDays: 7,
  refreshMaxAgeDays: 30,
};

describe('webTokenCookies', () => {
  it('writes the same access value to accessToken and token cookies', () => {
    const store = createMemoryCookieStore();
    writeWebTokenCookies(store, { accessToken: 'a1', refreshToken: 'r1' }, options);
    expect(readWebTokenCookies(store)).toEqual({ accessToken: 'a1', refreshToken: 'r1' });
    expect(store.jar.get(WEB_TOKEN_COOKIE_NAMES.token)).toBe('a1');
    expect(store.jar.get(WEB_TOKEN_COOKIE_NAMES.accessToken)).toBe('a1');
  });

  it('does not treat token cookie as Bearer access', () => {
    const store = createMemoryCookieStore();
    store.jar.set(WEB_TOKEN_COOKIE_NAMES.token, 'only-token-cookie');
    store.jar.set(WEB_TOKEN_COOKIE_NAMES.refreshToken, 'r1');
    expect(readWebTokenCookies(store)).toEqual({ refreshToken: 'r1' });
    const session = sessionFromWebTokenCookies(store);
    expect(session?.tokens.accessToken).toBe('');
    expect(session?.tokens.refreshToken).toBe('r1');
  });

  it('reads refresh body token only from the token cookie', () => {
    const store = createMemoryCookieStore();
    store.jar.set(WEB_TOKEN_COOKIE_NAMES.accessToken, 'from-access');
    store.jar.set(WEB_TOKEN_COOKIE_NAMES.token, 'from-token');
    expect(readAccessTokenCookieForRefresh(store)).toBe('from-token');

    store.jar.delete(WEB_TOKEN_COOKIE_NAMES.token);
    expect(readAccessTokenCookieForRefresh(store)).toBeUndefined();
  });

  it('writes and reads the cross-port device id cookie', () => {
    const store = createMemoryCookieStore();
    writeDeviceIdCookie(store, '  device-abc  ', options);
    expect(store.jar.get(WEB_DEVICE_ID_COOKIE)).toBe('device-abc');
    expect(readDeviceIdCookie(store)).toBe('device-abc');
  });

  it('clears device id together with JWT cookies on logout', () => {
    const store = createMemoryCookieStore();
    writeWebTokenCookies(store, { accessToken: 'a1', refreshToken: 'r1' }, options);
    writeDeviceIdCookie(store, 'device-abc', options);
    clearWebTokenCookies(store, options);
    expect(store.jar.has(WEB_DEVICE_ID_COOKIE)).toBe(false);
    expect(store.jar.has(WEB_TOKEN_COOKIE_NAMES.accessToken)).toBe(false);
    expect(store.jar.has(WEB_TOKEN_COOKIE_NAMES.refreshToken)).toBe(false);
  });
});
