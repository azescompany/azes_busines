/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/cookies/webTokenCookies.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-09
 * ║ Purpose: Legacy-compatible JWT + device cookies for cross-app web SSO
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthSession } from '../contracts/session.js';
import { sessionFromTokens } from '../session/sessionFromTokens.js';

/** Matches legacy Caspian Key / HouseKey cookie names (JS-readable, not HttpOnly). */
export const WEB_TOKEN_COOKIE_NAMES = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  /** Duplicate of access token — used as refresh body `token`. */
  token: 'token',
} as const;

/**
 * Cross-port login device bind (Account ↔ Admin). Same path/domain rules as JWT cookies
 * so localhost ports share it; Admin must seed mutator DeviceId from this value.
 */
export const WEB_DEVICE_ID_COOKIE = 'azes_device_id';

export type WebTokenCookieOptions = {
  path: string;
  domain?: string;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  accessMaxAgeDays: number;
  refreshMaxAgeDays: number;
};

export type WebTokenCookieStore = {
  read: (name: string) => string | undefined;
  write: (
    name: string,
    value: string,
    maxAgeSeconds: number,
    options: WebTokenCookieOptions,
  ) => void;
  remove: (name: string, options: WebTokenCookieOptions) => void;
};

const DAY_SECONDS = 86_400;

function daysToSeconds(days: number): number {
  return Math.max(0, Math.floor(days * DAY_SECONDS));
}

function encodeCookieValue(value: string): string {
  return encodeURIComponent(value);
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cookieAttributeParts(options: WebTokenCookieOptions, maxAgeSeconds: number): string {
  const parts = [
    `Path=${options.path}`,
    `Max-Age=${maxAgeSeconds}`,
    `SameSite=${options.sameSite}`,
  ];
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  if (options.secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/** Browser document.cookie adapter (testable via injectable store). */
export function createDocumentCookieStore(): WebTokenCookieStore | null {
  if (typeof document === 'undefined') {
    return null;
  }
  return {
    read(name: string): string | undefined {
      const prefix = `${name}=`;
      const segments = document.cookie.split(';');
      for (const segment of segments) {
        const trimmed = segment.trim();
        if (trimmed.startsWith(prefix)) {
          return decodeCookieValue(trimmed.slice(prefix.length));
        }
      }
      return undefined;
    },
    write(
      name: string,
      value: string,
      maxAgeSeconds: number,
      options: WebTokenCookieOptions,
    ): void {
      document.cookie = `${name}=${encodeCookieValue(value)}; ${cookieAttributeParts(
        options,
        maxAgeSeconds,
      )}`;
    },
    remove(name: string, options: WebTokenCookieOptions): void {
      document.cookie = `${name}=; ${cookieAttributeParts(options, 0)}`;
    },
  };
}

/** Defaults aligned with legacy account app (7d access, 30d refresh). */
export function resolveDefaultWebTokenCookieOptions(
  overrides: Partial<WebTokenCookieOptions> = {},
): WebTokenCookieOptions {
  const secure =
    overrides.secure ??
    (typeof globalThis.location !== 'undefined' && globalThis.location.protocol === 'https:');
  return {
    path: '/',
    sameSite: 'Strict',
    accessMaxAgeDays: 7,
    refreshMaxAgeDays: 30,
    secure,
    ...overrides,
  };
}

export function readWebTokenCookies(store: WebTokenCookieStore): {
  accessToken?: string;
  refreshToken?: string;
} {
  // Bearer source only — never treat `token` as access (that cookie is refresh-body only).
  const accessToken = store.read(WEB_TOKEN_COOKIE_NAMES.accessToken)?.trim() || undefined;
  const refreshToken = store.read(WEB_TOKEN_COOKIE_NAMES.refreshToken)?.trim() || undefined;
  return {
    ...(accessToken ? { accessToken } : {}),
    ...(refreshToken ? { refreshToken } : {}),
  };
}

/**
 * Refresh request body field `token` — only the `token` cookie (legacy old access JWT).
 * Never returns an empty string.
 */
export function readAccessTokenCookieForRefresh(
  store: WebTokenCookieStore | null = createDocumentCookieStore(),
): string | undefined {
  if (!store) return undefined;
  const fromToken = store.read(WEB_TOKEN_COOKIE_NAMES.token)?.trim();
  return fromToken || undefined;
}

export function writeWebTokenCookies(
  store: WebTokenCookieStore,
  tokens: { accessToken: string; refreshToken?: string | null },
  options: WebTokenCookieOptions,
): void {
  const access = tokens.accessToken.trim();
  if (!access) {
    return;
  }
  const accessMaxAge = daysToSeconds(options.accessMaxAgeDays);
  // Same value in both cookies (legacy + refresh body `token` source).
  store.write(WEB_TOKEN_COOKIE_NAMES.accessToken, access, accessMaxAge, options);
  store.write(WEB_TOKEN_COOKIE_NAMES.token, access, accessMaxAge, options);

  const refresh = tokens.refreshToken?.trim();
  if (refresh) {
    store.write(
      WEB_TOKEN_COOKIE_NAMES.refreshToken,
      refresh,
      daysToSeconds(options.refreshMaxAgeDays),
      options,
    );
  }
}

export function writeDeviceIdCookie(
  store: WebTokenCookieStore,
  deviceId: string,
  options: WebTokenCookieOptions,
): void {
  const trimmed = deviceId.trim();
  if (!trimmed) return;
  // Align TTL with refresh so the bind survives access-token rotation.
  store.write(WEB_DEVICE_ID_COOKIE, trimmed, daysToSeconds(options.refreshMaxAgeDays), options);
}

export function readDeviceIdCookie(
  store: WebTokenCookieStore | null = createDocumentCookieStore(),
): string | undefined {
  if (!store) return undefined;
  const value = store.read(WEB_DEVICE_ID_COOKIE)?.trim();
  return value || undefined;
}

export function clearDeviceIdCookie(
  store: WebTokenCookieStore,
  options: WebTokenCookieOptions,
): void {
  store.remove(WEB_DEVICE_ID_COOKIE, options);
}

export function clearWebTokenCookies(
  store: WebTokenCookieStore,
  options: WebTokenCookieOptions,
): void {
  for (const name of Object.values(WEB_TOKEN_COOKIE_NAMES)) {
    store.remove(name, options);
  }
  clearDeviceIdCookie(store, options);
  // Clear chunk leftovers from the previous oversized-JWT experiment.
  store.remove('accessToken.__chunks', options);
  for (let i = 0; i < 32; i += 1) {
    store.remove(`accessToken.${i}`, options);
  }
}

/** Hydrate adapter session from cookies (access and/or refresh only). */
export function sessionFromWebTokenCookies(store: WebTokenCookieStore): AuthSession | null {
  const { accessToken, refreshToken } = readWebTokenCookies(store);
  if (accessToken) {
    return sessionFromTokens(accessToken, refreshToken);
  }
  if (refreshToken) {
    return {
      tokens: {
        accessToken: '',
        refreshToken,
      },
    };
  }
  return null;
}

export function persistSessionToWebTokenCookies(
  store: WebTokenCookieStore,
  session: AuthSession | null,
  options: WebTokenCookieOptions,
): void {
  const access = session?.tokens.accessToken?.trim();
  const refresh = session?.tokens.refreshToken?.trim();
  if (!access && !refresh) {
    clearWebTokenCookies(store, options);
    return;
  }
  if (!access) {
    // Drop Bearer cookie only — keep `token` for refresh body + refreshToken cookie.
    store.remove(WEB_TOKEN_COOKIE_NAMES.accessToken, options);
    if (refresh) {
      store.write(
        WEB_TOKEN_COOKIE_NAMES.refreshToken,
        refresh,
        daysToSeconds(options.refreshMaxAgeDays),
        options,
      );
    }
    return;
  }
  writeWebTokenCookies(
    store,
    {
      accessToken: access,
      refreshToken: refresh,
    },
    options,
  );
}
