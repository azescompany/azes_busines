/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/contracts/storage.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Secure storage adapter boundary for native token persistence
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Platform secure storage contract (Keychain/Keystore, Expo SecureStore, etc.).
 * Apps inject a real implementation; this package does not ship a fake
 * "production" secure store.
 */
export type AuthSecureStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};
