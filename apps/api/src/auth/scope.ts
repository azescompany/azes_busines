/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/scope.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Org / ownership scope helpers (cross-org guard)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { ApiHttpError } from '../errors.js';
import { claimHasPermission, normalizeRoles } from './permissions.js';
import type { AccessTokenClaims } from './tokens.js';

export function assertSameOrg(
  user: AccessTokenClaims,
  resourceOrgId: string | null | undefined,
): void {
  if (claimHasPermission(user, 'org.manage_all')) return;
  if (!user.orgId || !resourceOrgId || user.orgId !== resourceOrgId) {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Cross-organization access denied');
  }
}

/** Course write: superAdmin | same-org orgAdmin | owner instructor. */
export function assertCanEditCourse(
  user: AccessTokenClaims,
  course: { ownerId: string; orgId?: string | null },
): void {
  if (!claimHasPermission(user, 'course.write')) {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
  }
  if (claimHasPermission(user, 'org.manage_all')) return;
  const roles = normalizeRoles(user.roles);
  if (roles.includes('orgAdmin')) {
    assertSameOrg(user, course.orgId);
    return;
  }
  if (course.ownerId === user.sub) {
    if (course.orgId && user.orgId && course.orgId !== user.orgId) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Cross-organization access denied');
    }
    return;
  }
  throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
}

export function assertCanWriteTrack(
  user: AccessTokenClaims,
  track: { createdBy: string; orgId: string },
): void {
  if (!claimHasPermission(user, 'track.write')) {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
  }
  if (claimHasPermission(user, 'org.manage_all')) return;
  const roles = normalizeRoles(user.roles);
  if (roles.includes('orgAdmin')) {
    assertSameOrg(user, track.orgId);
    return;
  }
  if (track.createdBy === user.sub) {
    assertSameOrg(user, track.orgId);
    return;
  }
  throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
}
