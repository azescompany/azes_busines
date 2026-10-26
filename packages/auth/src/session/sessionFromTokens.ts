/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/session/sessionFromTokens.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Build AuthSession from access/refresh tokens via JWT claims
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthSession } from '../contracts/session.js';
import {
  decodeAccessToken,
  getAccessTokenExpiryMs,
  toAuthSubjectFromClaims,
} from '../jwt/decodeAccessToken.js';

/**
 * Decode the access JWT into subject + safe profile. Tokens stay on `session.tokens`
 * (adapter memory). HttpOnly cookie sessions are a future backend change.
 */
export function sessionFromTokens(accessToken: string, refreshToken?: string | null): AuthSession {
  const claims = decodeAccessToken(accessToken);
  const expiresAt = getAccessTokenExpiryMs(accessToken) ?? undefined;
  const subject = claims ? toAuthSubjectFromClaims(claims) : undefined;

  return {
    tokens: {
      accessToken,
      ...(refreshToken ? { refreshToken } : {}),
      ...(expiresAt !== undefined ? { expiresAt } : {}),
    },
    ...(subject ? { subject } : {}),
    ...(claims
      ? {
          profile: {
            fullName: claims.FullName,
            organizationId: claims.OrganizationId,
            roleId: claims.RoleId,
            role: claims.role,
          },
        }
      : {}),
  };
}
