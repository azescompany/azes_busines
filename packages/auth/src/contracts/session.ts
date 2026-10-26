/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/contracts/session.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Session model — tokens stay in adapters, not Redux
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthTokens } from './tokens.js';

/** Non-secret subject marker (not an API entity cache). */
export type AuthSubject = {
  id: string;
};

/** Non-secret identity fields decoded from the access JWT (never tokens). */
export type AuthProfile = {
  fullName?: string;
  organizationId?: string;
  roleId?: string;
  role?: string;
};

export type AuthSession = {
  tokens: AuthTokens;
  subject?: AuthSubject;
  profile?: AuthProfile;
};

/**
 * Safe view for UI / client metadata. Never includes access or refresh tokens.
 * Apps may mirror this into `@azes/state` later — never mirror `AuthTokens`.
 */
export type AuthSessionSnapshot = {
  isAuthenticated: boolean;
  subjectId: string | null;
  expiresAt: number | null;
  fullName?: string | null;
  roleId?: string | null;
  role?: string | null;
  organizationId?: string | null;
};
