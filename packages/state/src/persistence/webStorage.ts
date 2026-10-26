/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/persistence/webStorage.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: localStorage persistence adapter for web apps
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { PersistenceAdapter } from './types';

export function createWebStorageAdapter(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = globalThis.localStorage,
): PersistenceAdapter {
  return {
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => {
      storage.setItem(key, value);
    },
    removeItem: (key) => {
      storage.removeItem(key);
    },
  };
}
