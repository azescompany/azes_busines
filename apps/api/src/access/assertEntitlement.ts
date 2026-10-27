/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/assertEntitlement.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Middleware / assert helpers for module entitlement
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { MiddlewareHandler } from 'hono';

import { claimHasPermission } from '../auth/permissions.js';
import { getAuthUser, type AuthedEnv } from '../auth/requireAuth.js';
import { ApiHttpError } from '../errors.js';
import { resolveModuleEntitlement, type EntitlementRepository } from './entitlementRepository.js';

export type EntitlementVariables = {
  entitlementRepo?: EntitlementRepository | null;
};

export function getEntitlementRepo(c: {
  get: (k: 'entitlementRepo') => EntitlementRepository | null | undefined;
}): EntitlementRepository | null | undefined {
  return c.get('entitlementRepo');
}

/**
 * Require active org module entitlement (+ subscription policy).
 * `org.manage_all` bypasses module assignment (platform), but still respects
 * subscription **blocked** when acting inside an org (no write/read of tenant modules).
 */
export function requireEntitledModule(
  moduleCode: string,
  opts?: { write?: boolean },
): MiddlewareHandler<AuthedEnv & { Variables: EntitlementVariables & AuthedEnv['Variables'] }> {
  return async (c, next) => {
    const user = getAuthUser(c);
    if (!user.orgId) {
      throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Active organization required');
    }
    const repo = getEntitlementRepo(c);
    if (repo === undefined || repo === null) {
      // Dual-read: no entitlement store attached → skip (legacy / early boot).
      await next();
      return;
    }

    const isPlatform = claimHasPermission(user, 'org.manage_all');
    const decision = await resolveModuleEntitlement(repo, user.orgId, moduleCode, {
      write: opts?.write,
    });

    if (isPlatform && decision.subscriptionMode !== 'blocked') {
      await next();
      return;
    }

    if (!decision.allowed) {
      throw new ApiHttpError(403, 'FORBIDDEN', decision.reason ?? 'Module entitlement denied');
    }
    await next();
  };
}
