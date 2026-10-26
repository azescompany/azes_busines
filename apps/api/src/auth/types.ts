/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Auth domain types for Phase 2B
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type UserStatus = 'active' | 'disabled' | 'pending';

export type AuthUser = {
  id: string;
  usernameNormalized: string;
  passwordHash: string;
  status: UserStatus;
  /** Null for platform `superAdmin`. */
  orgId: string | null;
};

export type RefreshSessionRow = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: number;
  revokedAt: number | null;
  replacedById: string | null;
  createdAt: number;
  userAgent: string | null;
};

export type TokenPairResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

/** Access JWT TTL (seconds) — matches PHASE-2B-AUTH-CONTRACT. */
export const ACCESS_TOKEN_TTL_SEC = 900;

/** Refresh session TTL (seconds) — 30 days. */
export const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24 * 30;
