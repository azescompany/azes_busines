/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/requestContext.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Trusted request identity from verified JWT (AC-D05)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AccessTokenClaims } from './tokens.js';

/**
 * Identity + session context taken only from a verified access JWT.
 * Never populate these fields from client JSON body / query / headers
 * other than `Authorization: Bearer`.
 */
export type TrustedRequestContext = {
  /** JWT `sub` — authenticated user id. */
  userId: string;
  /** JWT `sid` — refresh-session id (revocation / logout). */
  sessionId: string;
  /** JWT `orgId` — active org pointer at token issue time (`null` = platform). */
  orgId: string | null;
  /** JWT `roles` — bootstrap / static fallback only; not sole proof of rights. */
  roles: string[];
};

/**
 * Map verified access claims → trusted request context.
 * Does not re-fetch the user row; callers that need live status use `/me` / session checks.
 */
export function trustedRequestContext(claims: AccessTokenClaims): TrustedRequestContext {
  return {
    userId: claims.sub,
    sessionId: claims.sid,
    orgId: claims.orgId ?? null,
    roles: claims.roles,
  };
}
