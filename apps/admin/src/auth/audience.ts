/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/audience.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: demo | tenant audience — UX only (not a DB endUser role)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Soft audience for AppShell — not a membership / OpenAPI role. */
export type AppAudience = 'demo' | 'tenant';

const PLATFORM_ROLES = new Set(['superAdmin', 'generalAdmin']);

export function resolveAudience(isAuthenticated: boolean): AppAudience {
  return isAuthenticated ? 'tenant' : 'demo';
}

/**
 * Platform operators see full MODULE_REGISTRY in tenant launcher.
 * Source: GET /me.roles (and optional primary `role`) — not JWT alone.
 */
export function isPlatformOperator(
  roles: readonly string[] | undefined,
  primaryRole?: string | null,
): boolean {
  if (primaryRole && PLATFORM_ROLES.has(primaryRole)) return true;
  if (!roles || roles.length === 0) return false;
  return roles.some((r) => PLATFORM_ROLES.has(r));
}
