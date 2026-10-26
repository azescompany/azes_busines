/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/contracts/tokens.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Token model for auth adapters (never log these values)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  /** Epoch milliseconds when the access token is considered expired. */
  expiresAt?: number;
};
