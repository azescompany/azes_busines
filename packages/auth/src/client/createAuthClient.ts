/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/client/createAuthClient.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Auth client facade over AuthAdapter (login/logout abstraction)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthAdapter } from '../contracts/adapter.js';
import type { AuthSession, AuthSessionSnapshot } from '../contracts/session.js';

export type AuthSessionListener = (snapshot: AuthSessionSnapshot) => void;

export type AuthClient = {
  getAccessToken: () => Promise<string | null>;
  getSessionSnapshot: () => Promise<AuthSessionSnapshot>;
  /** Establish a session after backend login succeeds (apps pass tokens from API). */
  establishSession: (session: AuthSession) => Promise<void>;
  /** Logout / cleanup — clears adapter session and notifies listeners. */
  clearSession: () => Promise<void>;
  refresh: () => Promise<boolean>;
  subscribe: (listener: AuthSessionListener) => () => void;
  /** Underlying adapter (for advanced wiring). Prefer client methods in apps. */
  adapter: AuthAdapter;
};

function hasSessionCredentials(session: AuthSession | null): boolean {
  return Boolean(session?.tokens.accessToken?.trim() || session?.tokens.refreshToken?.trim());
}

function toSnapshot(session: AuthSession | null): AuthSessionSnapshot {
  return {
    isAuthenticated: hasSessionCredentials(session),
    subjectId: session?.subject?.id ?? null,
    expiresAt: session?.tokens.expiresAt ?? null,
    fullName: session?.profile?.fullName ?? null,
    roleId: session?.profile?.roleId ?? null,
    role: session?.profile?.role ?? null,
    organizationId: session?.profile?.organizationId ?? null,
  };
}

export function createAuthClient(adapter: AuthAdapter): AuthClient {
  const listeners = new Set<AuthSessionListener>();

  const emit = async (): Promise<void> => {
    const session = await adapter.getSession();
    const snapshot = toSnapshot(session);
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  adapter.onExpire(() => {
    void emit();
  });

  return {
    adapter,

    getAccessToken: () => adapter.getToken(),

    getSessionSnapshot: async () => toSnapshot(await adapter.getSession()),

    establishSession: async (session) => {
      await adapter.setSession(session);
      await emit();
    },

    clearSession: async () => {
      await adapter.clearSession();
      await emit();
    },

    refresh: async () => {
      const ok = await adapter.refresh();
      await emit();
      return ok;
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
