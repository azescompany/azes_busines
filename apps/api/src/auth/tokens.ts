/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/tokens.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-27
 * ║ Purpose: Access JWT (jose HS256) + refresh secret hashing
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

import { ACCESS_TOKEN_TTL_SEC } from './types.js';

const REFRESH_BYTES = 32;

/**
 * Access JWT claims (AC-D05).
 *
 * Authoritative for request identity: `sub`, `sid`, `orgId`, `roles`.
 * `permissions[]` is optional **compat** emission (login/refresh still fill it) —
 * server authz must use live `effectiveCan` / role map, not this claim.
 */
export type AccessTokenClaims = {
  sub: string;
  sid: string;
  roles: string[];
  /** Null for platform `superAdmin`. */
  orgId: string | null;
  /**
   * Compat / deprecate-window claim (menu UNION snapshot at issue time).
   * Non-authoritative — do not use for deny/allow decisions.
   */
  permissions?: string[];
};

function encoder() {
  return new TextEncoder();
}

function secretKey(secret: string): Uint8Array {
  return encoder().encode(secret);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createRefreshSecret(): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(REFRESH_BYTES)));
}

export async function hashRefreshToken(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder().encode(secret));
  return bytesToBase64Url(new Uint8Array(digest));
}

export async function signAccessToken(
  claims: AccessTokenClaims,
  jwtSecret: string,
  expiresInSec: number = ACCESS_TOKEN_TTL_SEC,
): Promise<string> {
  return new SignJWT({
    roles: claims.roles,
    sid: claims.sid,
    orgId: claims.orgId,
    // Emit when caller provided the array (incl. empty) — compat / deprecate window.
    ...(claims.permissions !== undefined ? { permissions: claims.permissions } : {}),
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresInSec}s`)
    .sign(secretKey(jwtSecret));
}

export async function verifyAccessToken(
  token: string,
  jwtSecret: string,
): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, secretKey(jwtSecret), {
    algorithms: ['HS256'],
  });
  return parseAccessClaims(payload);
}

function parseAccessClaims(payload: JWTPayload): AccessTokenClaims {
  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const sid = typeof payload.sid === 'string' ? payload.sid : '';
  const roles = Array.isArray(payload.roles)
    ? payload.roles.filter((r): r is string => typeof r === 'string')
    : [];
  const orgId =
    typeof payload.orgId === 'string' ? payload.orgId : payload.orgId === null ? null : null;
  const permissions = Array.isArray(payload.permissions)
    ? payload.permissions.filter((p): p is string => typeof p === 'string')
    : undefined;
  if (!sub || !sid) {
    throw new Error('Invalid access token claims');
  }
  return { sub, sid, roles, orgId, permissions };
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}
