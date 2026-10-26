/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/react/AuthProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-14
 * ║ Purpose: React context for AuthClient (Next.js client boundary)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { AuthClient } from '../client/createAuthClient.js';
import type { AuthSessionSnapshot } from '../contracts/session.js';

const emptySnapshot: AuthSessionSnapshot = {
  isAuthenticated: false,
  subjectId: null,
  expiresAt: null,
};

type AuthContextValue = {
  client: AuthClient;
  snapshot: AuthSessionSnapshot;
  /**
   * False until the first `getSessionSnapshot()` resolves.
   * Guards must not treat `!isAuthenticated` as logged-out while this is false
   * (avoids Account↔Admin redirect loops on first paint).
   */
  isSessionReady: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  client: AuthClient;
  children: ReactNode;
};

export function AuthProvider({ client, children }: AuthProviderProps) {
  const [snapshot, setSnapshot] = useState<AuthSessionSnapshot>(emptySnapshot);
  const [isSessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;

    void client.getSessionSnapshot().then((next) => {
      if (active) {
        setSnapshot(next);
        setSessionReady(true);
      }
    });

    const unsubscribe = client.subscribe((next) => {
      setSnapshot(next);
      setSessionReady(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [client]);

  return (
    <AuthContext.Provider value={{ client, snapshot, isSessionReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthClient(): AuthClient {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthClient must be used within AuthProvider');
  }
  return ctx.client;
}

/** Safe session metadata only — never returns tokens. */
export function useAuthSession(): AuthSessionSnapshot {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthProvider');
  }
  return ctx.snapshot;
}

/**
 * True after the provider has loaded the real session once.
 * Use in route guards before redirecting on `!isAuthenticated`.
 */
export function useAuthSessionReady(): boolean {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthSessionReady must be used within AuthProvider');
  }
  return ctx.isSessionReady;
}
