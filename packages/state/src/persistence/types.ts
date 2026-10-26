/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/persistence/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Storage adapter contract for optional client persistence
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type PersistenceAdapter = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

export const PREFERENCES_PERSIST_KEY = 'azes.state.preferences';
