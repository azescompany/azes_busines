/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/requireAuth.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-27
 * ║ Purpose: Bearer JWT gate + live menu-aware permission checks (M1.6)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Context, MiddlewareHandler } from 'hono';

import type { ApiEnv } from '../env.js';
import { requireJwtAccessSecret } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { effectiveCan, type ResolveAccessContext } from '../access/effectiveAccess.js';
import type { MenuRepository } from '../menu/repository.js';
import type { EntitlementRepository } from '../access/entitlementRepository.js';
import { isModuleWritePermission, moduleCodeForPermission } from '../access/entitlementPolicy.js';
import { resolveModuleEntitlement } from '../access/entitlementRepository.js';
import { claimHasPermission, isPlatformStaff, type Permission } from './permissions.js';
import { trustedRequestContext, type TrustedRequestContext } from './requestContext.js';
import { verifyAccessToken, type AccessTokenClaims } from './tokens.js';

export type AuthUser = AccessTokenClaims;

export type AuthVariables = {
  authUser: AuthUser;
  /** Injected by app middleware — live RBAC (TAGET M1.6). */
  menuRepo?: MenuRepository | null;
  /** Phase 04 — org module entitlement + subscription snapshot. */
  entitlementRepo?: EntitlementRepository | null;
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

/**
 * Trusted identity from verified JWT only (`sub` / `sid` / `orgId` / `roles`).
 * Do not substitute client body fields for these values.
 */
export function getTrustedRequestContext(c: Context<AuthedEnv>): TrustedRequestContext {
  return trustedRequestContext(getAuthUser(c));
}

export function getMenuRepo(c: Context<AuthedEnv>): MenuRepository | null | undefined {
  return c.get('menuRepo');
}

export function getEntitlementRepo(
  c: Context<AuthedEnv>,
): EntitlementRepository | null | undefined {
  return c.get('entitlementRepo');
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
 * Live authz: resolve permissions from unified Effective Access Resolver (Phase 06).
 * Falls back to role-map `claimHasPermission` (ignores JWT `permissions[]`) when
 * menuRepo was never attached to the context.
 *
 * Module-bound permissions also require org entitlement + subscription policy
 * when `entitlementRepo` is attached.
 *
 * Resolver mode controlled by ACCESS_RESOLVER_MODE (legacy|unified, default unified).
 */
export function requirePermission(permission: Permission): MiddlewareHandler<AuthedEnv> {
  return async (c, next) => {
    const user = getAuthUser(c);
    const menuRepo = getMenuRepo(c);
    const entitlementRepo = getEntitlementRepo(c);
    const accessCtx: ResolveAccessContext = {
      orgId: user.orgId,
      userId: user.sub,
      menuRepo,
      entitlementRepo,
      bypassEntitlementFilter: claimHasPermission(user, 'org.manage_all'),
    };
    const allowed = await effectiveCan(user.roles, permission, accessCtx);
    if (!allowed) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    const moduleCode = moduleCodeForPermission(permission);
    if (moduleCode && entitlementRepo && user.orgId) {
      const isPlatform = claimHasPermission(user, 'org.manage_all');
      const decision = await resolveModuleEntitlement(entitlementRepo, user.orgId, moduleCode, {
        write: isModuleWritePermission(permission),
      });
      if (isPlatform && decision.subscriptionMode !== 'blocked') {
        await next();
        return;
      }
      if (!decision.allowed) {
        throw new ApiHttpError(403, 'FORBIDDEN', decision.reason ?? 'Module entitlement denied');
      }
    }

    await next();
  };
}

/** LMS content staff: instructor / orgAdmin / superAdmin (via course.write). */
export function isStaff(user: AuthUser): boolean {
  return isPlatformStaff(user.roles);
}
