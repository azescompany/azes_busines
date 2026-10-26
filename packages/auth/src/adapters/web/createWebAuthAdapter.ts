/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/adapters/web/createWebAuthAdapter.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-10
 * ║ Purpose: Web auth adapter — cookies: accessToken=Bearer, token=refresh body
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  createDocumentCookieStore,
  persistSessionToWebTokenCookies,
  resolveDefaultWebTokenCookieOptions,
  sessionFromWebTokenCookies,
  WEB_TOKEN_COOKIE_NAMES,
  type WebTokenCookieOptions,
  type WebTokenCookieStore,
} from '../../cookies/webTokenCookies.js';
import type { AuthAdapter, AuthExpireListener } from '../../contracts/adapter.js';
import type { AuthSession } from '../../contracts/session.js';
import { sessionFromTokens } from '../../session/sessionFromTokens.js';
import { clearLegacyWebTokenVault } from '../../storage/clearLegacyWebTokenVault.js';

export type WebAuthAdapterOptions = {
  /**
   * Optional non-secret subject id persistence (sessionStorage).
   * Tokens stay in memory + cookies only — never sessionStorage/IndexedDB.
   */
  subjectStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  subjectStorageKey?: string;
  /**
   * App-provided refresh that talks to the backend (via `@azes/api` later).
   * Returns a new session or null when refresh fails.
   */
  refreshSession?: (current: AuthSession) => Promise<AuthSession | null>;
  /**
   * Shared JWT cookies (`accessToken`, `token`, `refreshToken`) for cross-port SSO.
   * Pass `false` to disable (tests).
   */
  tokenCookies?: Partial<WebTokenCookieOptions> | false;
  tokenCookieStore?: WebTokenCookieStore | null;
};

const DEFAULT_SUBJECT_KEY = 'azes.auth.subjectId';

/**
 * Web adapter: cookie roles
 * - `accessToken` → Bearer (if present, no proactive refresh)
 * - `token` → refresh-token request body only (never Bearer)
 * - `refreshToken` → refresh-token request
 * HTTP policy: 401 → refresh; 403 → session invalidated (other device).
 */
export function createWebAuthAdapter(options: WebAuthAdapterOptions = {}): AuthAdapter {
  const {
    subjectStorage,
    subjectStorageKey = DEFAULT_SUBJECT_KEY,
    refreshSession,
    tokenCookies,
    tokenCookieStore,
  } = options;

  const cookieOptions =
    tokenCookies === false ? null : resolveDefaultWebTokenCookieOptions(tokenCookies ?? {});
  const cookieStore =
    cookieOptions === null ? null : (tokenCookieStore ?? createDocumentCookieStore());

  let session: AuthSession | null =
    cookieStore && cookieOptions ? sessionFromWebTokenCookies(cookieStore) : null;
  const expireListeners = new Set<AuthExpireListener>();

  const syncCookies = (next: AuthSession | null): void => {
    if (!cookieStore || !cookieOptions) {
      return;
    }
    persistSessionToWebTokenCookies(cookieStore, next, cookieOptions);
  };

  const persistSubject = (next: AuthSession | null): void => {
    if (!subjectStorage) {
      return;
    }
    if (next?.subject?.id) {
      subjectStorage.setItem(subjectStorageKey, next.subject.id);
    } else {
      subjectStorage.removeItem(subjectStorageKey);
    }
  };

  const notifyExpired = async (): Promise<void> => {
    for (const listener of expireListeners) {
      await listener();
    }
  };

  /** Live `accessToken` cookie is Bearer source of truth (manual delete must clear memory). */
  const resolveBearerAccessToken = (): string | null => {
    if (cookieStore) {
      const cookieAccess = cookieStore.read(WEB_TOKEN_COOKIE_NAMES.accessToken)?.trim();
      if (cookieAccess) {
        if (session) {
          session = {
            ...session,
            tokens: { ...session.tokens, accessToken: cookieAccess },
          };
        } else {
          // Cross-port navigation: memory may be empty while localhost cookies exist.
          const refresh = cookieStore.read(WEB_TOKEN_COOKIE_NAMES.refreshToken)?.trim();
          session = sessionFromTokens(cookieAccess, refresh);
        }
        return cookieAccess;
      }
      // Cookie missing (oversized JWT write fail, race) — keep in-memory handoff token.
      // Manual cookie delete is handled via clearSession / Auth Lab, not silent wipe here.
      return session?.tokens.accessToken?.trim() || null;
    }
    return session?.tokens.accessToken?.trim() || null;
  };

  /** Re-read cookies when in-memory session is empty (Account 5173 ↔ Admin 5174). */
  const hydrateSessionFromCookies = (): void => {
    if (session || !cookieStore) return;
    session = sessionFromWebTokenCookies(cookieStore);
  };

  const syncRefreshTokenFromCookies = (): void => {
    if (!cookieStore) return;
    const refresh = cookieStore.read(WEB_TOKEN_COOKIE_NAMES.refreshToken)?.trim();
    if (!refresh) return;
    if (!session) {
      session = { tokens: { accessToken: '', refreshToken: refresh } };
      return;
    }
    session = {
      ...session,
      tokens: { ...session.tokens, refreshToken: refresh },
    };
  };

  return {
    getToken: async () => {
      hydrateSessionFromCookies();
      return resolveBearerAccessToken();
    },

    getSession: async () => {
      hydrateSessionFromCookies();
      resolveBearerAccessToken();
      syncRefreshTokenFromCookies();
      return session;
    },

    setSession: async (next) => {
      session = next;
      persistSubject(next);
      syncCookies(next);
      void clearLegacyWebTokenVault();
    },

    clearSession: async () => {
      session = null;
      persistSubject(null);
      syncCookies(null);
      void clearLegacyWebTokenVault();
    },

    refresh: async () => {
      hydrateSessionFromCookies();
      resolveBearerAccessToken();
      syncRefreshTokenFromCookies();
      if (!session?.tokens.refreshToken?.trim() || !refreshSession) {
        await notifyExpired();
        return false;
      }
      const next = await refreshSession(session);
      if (!next) {
        session = null;
        persistSubject(null);
        syncCookies(null);
        void clearLegacyWebTokenVault();
        await notifyExpired();
        return false;
      }
      session = next;
      persistSubject(next);
      syncCookies(next);
      return true;
    },

    onExpire: (listener) => {
      expireListeners.add(listener);
      return () => {
        expireListeners.delete(listener);
      };
    },
  };
}
