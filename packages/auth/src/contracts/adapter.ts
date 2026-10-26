/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/contracts/adapter.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Platform-agnostic AuthAdapter contract
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthSession } from './session.js';

export type AuthExpireListener = () => void | Promise<void>;

/**
 * Platform auth adapter. Web and native implement this; apps never import a
 * concrete IdP SDK through this surface.
 */
export type AuthAdapter = {
  getToken: () => Promise<string | null>;
  setSession: (session: AuthSession) => Promise<void>;
  clearSession: () => Promise<void>;
  /** Returns true when a new access token was obtained. */
  refresh: () => Promise<boolean>;
  onExpire: (listener: AuthExpireListener) => () => void;
  getSession: () => Promise<AuthSession | null>;
};
