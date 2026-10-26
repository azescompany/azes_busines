/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/storage/memorySecureStorage.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: In-memory secure-storage stand-in for tests only
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthSecureStorage } from '../contracts/storage.js';

/**
 * NOT a production Keychain/Keystore. Use only in unit tests or ephemeral
 * non-production harnesses. Apps must inject a real secure store on native.
 */
export function createMemorySecureStorage(initial: Record<string, string> = {}): AuthSecureStorage {
  const store = new Map<string, string>(Object.entries(initial));

  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
  };
}
