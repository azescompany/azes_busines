/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/persistence/memoryStorage.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: In-memory persistence adapter (tests / non-browser)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { PersistenceAdapter } from './types';

export function createMemoryStorageAdapter(
  initial: Record<string, string> = {},
): PersistenceAdapter {
  const store = new Map<string, string>(Object.entries(initial));

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}
