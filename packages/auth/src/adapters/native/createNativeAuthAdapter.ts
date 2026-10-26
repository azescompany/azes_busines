/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/adapters/native/createNativeAuthAdapter.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Native auth adapter using injected secure storage
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthAdapter, AuthExpireListener } from '../../contracts/adapter.js';
import type { AuthSession } from '../../contracts/session.js';
import type { AuthSecureStorage } from '../../contracts/storage.js';
import { parseSession, serializeSession } from '../shared/sessionJson.js';

export type NativeAuthAdapterOptions = {
  /** Required: Keychain/Keystore (or test double). Not provided by this package. */
  secureStorage: AuthSecureStorage;
  storageKey?: string;
  refreshSession?: (current: AuthSession) => Promise<AuthSession | null>;
  /**
   * Optional deep-link / lifecycle hooks — apps wire Expo Linking / AppState.
   * This package only exposes the boundary; it does not depend on React Native.
   */
  onDeepLink?: (url: string) => void | Promise<void>;
  onAppForeground?: () => void | Promise<void>;
};

const DEFAULT_STORAGE_KEY = 'azes.auth.session';

/**
 * Native adapter: persists the full session blob via injected secure storage.
 * Does not ship expo-secure-store or Keychain bindings — inject at app bootstrap.
 */
export function createNativeAuthAdapter(options: NativeAuthAdapterOptions): AuthAdapter {
  const { secureStorage, storageKey = DEFAULT_STORAGE_KEY, refreshSession } = options;

  let memory: AuthSession | null = null;
  let hydrated = false;
  const expireListeners = new Set<AuthExpireListener>();

  const ensureHydrated = async (): Promise<void> => {
    if (hydrated) {
      return;
    }
    const raw = await secureStorage.getItem(storageKey);
    memory = parseSession(raw);
    hydrated = true;
  };

  const write = async (next: AuthSession | null): Promise<void> => {
    memory = next;
    hydrated = true;
    if (next == null) {
      await secureStorage.removeItem(storageKey);
      return;
    }
    await secureStorage.setItem(storageKey, serializeSession(next));
  };

  const notifyExpired = async (): Promise<void> => {
    for (const listener of expireListeners) {
      await listener();
    }
  };

  const adapter: AuthAdapter = {
    getToken: async () => {
      await ensureHydrated();
      return memory?.tokens.accessToken ?? null;
    },

    getSession: async () => {
      await ensureHydrated();
      return memory;
    },

    setSession: async (next) => {
      await write(next);
    },

    clearSession: async () => {
      await write(null);
    },

    refresh: async () => {
      await ensureHydrated();
      if (!memory || !refreshSession) {
        await notifyExpired();
        return false;
      }
      const next = await refreshSession(memory);
      if (!next) {
        await write(null);
        await notifyExpired();
        return false;
      }
      await write(next);
      return true;
    },

    onExpire: (listener) => {
      expireListeners.add(listener);
      return () => {
        expireListeners.delete(listener);
      };
    },
  };

  return adapter;
}

/** Invokes optional deep-link handler from adapter options (app-driven). */
export async function notifyNativeAuthDeepLink(
  options: Pick<NativeAuthAdapterOptions, 'onDeepLink'>,
  url: string,
): Promise<void> {
  await options.onDeepLink?.(url);
}

/** Invokes optional foreground handler for token refresh scheduling. */
export async function notifyNativeAuthForeground(
  options: Pick<NativeAuthAdapterOptions, 'onAppForeground'>,
): Promise<void> {
  await options.onAppForeground?.();
}
