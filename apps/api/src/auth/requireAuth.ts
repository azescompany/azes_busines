/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/requireAuth.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-26
 * ║ Purpose: Bearer JWT gate + live menu-aware permission checks (M1.6)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Context, MiddlewareHandler } from 'hono';

import type { ApiEnv } from '../env.js';
import { requireJwtAccessSecret } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { effectiveCan } from '../menu/effectiveAccess.js';
import type { MenuRepository } from '../menu/repository.js';
import { claimHasPermission, isPlatformStaff, type Permission } from './permissions.js';
import { verifyAccessToken, type AccessTokenClaims } from './tokens.js';

export type AuthUser = AccessTokenClaims;

export type AuthVariables = {
  authUser: AuthUser;
  /** Injected by app middleware — live RBAC (TAGET M1.6). */
  menuRepo?: MenuRepository | null;
};

export type AuthedEnv = {
  Bindings: ApiEnv;
  Variables: AuthVariables;
};

function bearerFromHeader(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)/i.exec(header.trim());
  return match?.[1] ?? null;
}

/** Require valid access JWT; sets `authUser` on context. */
export function requireAuth(): MiddlewareHandler<AuthedEnv> {
  return async (c, next) => {
    const token = bearerFromHeader(c.req.header('Authorization'));
    if (!token) {
      throw new ApiHttpError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    try {
      const secret = requireJwtAccessSecret(c.env);
      const claims = await verifyAccessToken(token, secret);
      c.set('authUser', claims);
    } catch {
      throw new ApiHttpError(401, 'UNAUTHORIZED', 'Invalid or expired access token');
    }
    await next();
  };
}

export function getAuthUser(c: Context<AuthedEnv>): AuthUser {
  return c.get('authUser');
}

export function getMenuRepo(c: Context<AuthedEnv>): MenuRepository | null | undefined {
  return c.get('menuRepo');
}

/** True if user has any of the named roles (JWT claim; legacy `admin` already normalized). */
export function hasAnyRole(user: AuthUser, allowed: readonly string[]): boolean {
  return user.roles.some((r) => allowed.includes(r));
}

export function requireRoles(...allowed: string[]): MiddlewareHandler<AuthedEnv> {
  return async (c, next) => {
    const user = getAuthUser(c);
    if (!hasAnyRole(user, allowed)) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    await next();
  };
}

/**
 * Live authz: resolve permissions from menuRepo DB UNION when available (M1.6).
 * Falls back to JWT claimHasPermission only when menuRepo is absent.
 */
export function requirePermission(permission: Permission): MiddlewareHandler<AuthedEnv> {
  return async (c, next) => {
    const user = getAuthUser(c);
    const menuRepo = getMenuRepo(c);
    const allowed =
      menuRepo !== undefined
        ? await effectiveCan(user.roles, permission, menuRepo)
        : claimHasPermission(user, permission);
    if (!allowed) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    await next();
  };
}

/** LMS content staff: instructor / orgAdmin / superAdmin (via course.write). */
export function isStaff(user: AuthUser): boolean {
  return isPlatformStaff(user.roles);
}
