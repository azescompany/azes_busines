/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/delegation.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Delegation ceiling — grant ⊆ actor grantable set
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { ApiHttpError } from '../errors.js';

/** Roles that must never be assigned via ordinary org / catalog APIs. */
export const PROTECTED_PLATFORM_ROLES = new Set(['superadmin']);

export function isProtectedPlatformRoleName(name: string): boolean {
  return PROTECTED_PLATFORM_ROLES.has(name.trim().toLowerCase());
}

export function assertNotProtectedPlatformRole(name: string): void {
  if (isProtectedPlatformRoleName(name)) {
    throw new ApiHttpError(
      400,
      'VALIDATION_ERROR',
      'Cannot create or assign protected platform role via ordinary API',
    );
  }
}

/**
 * Ensure every granted permission is within the actor's effective set.
 * `org.manage_all` bypasses the ceiling (platform operator).
 */
export function assertGrantWithinCeiling(params: {
  actorPermissions: readonly string[];
  grantedPermissions: readonly string[];
  actorHasManageAll: boolean;
}): void {
  if (params.actorHasManageAll) return;
  const allowed = new Set(params.actorPermissions);
  const excess = params.grantedPermissions.filter((p) => !allowed.has(p));
  if (excess.length > 0) {
    throw new ApiHttpError(
      403,
      'FORBIDDEN',
      `Delegation ceiling exceeded: cannot grant ${excess.slice(0, 5).join(', ')}`,
    );
  }
}

export function assertMenusWithinCeiling(params: {
  actorMenuIds: readonly string[];
  grantedMenuIds: readonly string[];
  actorHasManageAll: boolean;
}): void {
  if (params.actorHasManageAll) return;
  const allowed = new Set(params.actorMenuIds);
  const excess = params.grantedMenuIds.filter((id) => !allowed.has(id));
  if (excess.length > 0) {
    throw new ApiHttpError(
      403,
      'FORBIDDEN',
      `Delegation ceiling exceeded: cannot grant menus ${excess.slice(0, 5).join(', ')}`,
    );
  }
}

/** LMS channel roles (AC-D07) — must not be treated as ERP admin grants. */
export const LMS_GRANT_ROLES = new Set(['instructor', 'student', 'guest']);

export function isLmsGrantRole(role: string): boolean {
  return LMS_GRANT_ROLES.has(role);
}
