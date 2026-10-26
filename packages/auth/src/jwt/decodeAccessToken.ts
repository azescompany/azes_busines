/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/jwt/decodeAccessToken.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-20
 * ║ Purpose: Decode Caspian/HouseKey + Academy access JWT claims (no verification)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthSubject } from '../contracts/session.js';

/** Legacy JwtPayload field names from the Caspian/HouseKey backend + standard JWT. */
export type AzesJwtClaims = {
  AuthenticationType?: string;
  UserId?: string;
  /** Standard JWT subject (Academy / apps/api access tokens). */
  sub?: string;
  OrganizationId?: string;
  FullName?: string;
  SecurityStamp?: string;
  /** Role source of truth: "1" Admin, "2" SuperAdmin, "3" User, "4" Evaluation. */
  RoleId?: string;
  /** Display / secondary label only — do not use for authorization flags. */
  role?: string;
  nbf?: number;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
};

export type AzesRoleFlags = {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isUser: boolean;
  isEvaluation: boolean;
};

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const padded = `${base64}${pad}`;

  if (typeof atob === 'function') {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }

  // Node / non-DOM test environments without atob.
  const bufferCtor = (
    globalThis as {
      Buffer?: { from: (s: string, enc: string) => { toString: (enc: string) => string } };
    }
  ).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(padded, 'base64').toString('utf8');
  }

  throw new Error('No base64 decoder available');
}

/** Parse the JWT payload without verifying the signature. Invalid input → null. */
export function decodeAccessToken(token: string): AzesJwtClaims | null {
  if (!token || typeof token !== 'string') {
    return null;
  }
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) {
    return null;
  }
  try {
    const json = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(json) as AzesJwtClaims;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Access-token expiry as epoch milliseconds, or null when `exp` is absent/invalid. */
export function getAccessTokenExpiryMs(token: string): number | null {
  const claims = decodeAccessToken(token);
  if (!claims || typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) {
    return null;
  }
  return claims.exp * 1000;
}

export function toAuthSubjectFromClaims(claims: AzesJwtClaims): AuthSubject | undefined {
  // Caspian legacy claim first; Academy (`apps/api`) uses standard `sub`.
  if (typeof claims.UserId === 'string' && claims.UserId.trim()) {
    return { id: claims.UserId.trim() };
  }
  if (typeof claims.sub === 'string' && claims.sub.trim()) {
    return { id: claims.sub.trim() };
  }
  return undefined;
}

/** Role flags from RoleId only (legacy Redux source of truth — not the `role` string). */
export function roleFlagsFromClaims(claims: AzesJwtClaims): AzesRoleFlags {
  const roleId = claims.RoleId;
  return {
    isAdmin: roleId === '1',
    isSuperAdmin: roleId === '2',
    isUser: roleId === '3',
    isEvaluation: roleId === '4',
  };
}
