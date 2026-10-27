/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/menu/effectiveAccess.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Compatibility wrap → apps/api/src/access/effectiveAccess (Phase 06)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { EntitlementRepository } from '../access/entitlementRepository.js';
import {
  effectiveCan as accessEffectiveCan,
  resolveGrantableMenuIds as accessResolveGrantableMenuIds,
  resolveNavSet,
  resolvePermissionSet,
  type ResolveAccessContext,
} from '../access/effectiveAccess.js';
import type { Permission } from '../auth/permissions.js';
import type { AuthNavItem } from '../auth/navCatalog.js';
import type { MenuRepository } from './repository.js';

/**
 * @deprecated Use ResolveAccessContext from `access/effectiveAccess`.
 * Kept as a thin alias so older imports compile during migration.
 */
export type AccessFilterContext = {
  orgId: string | null;
  userId?: string;
  entitlementRepo?: EntitlementRepository | null;
  bypassEntitlementFilter?: boolean;
};

/** @deprecated Use AccessFilterContext */
export type EntitlementFilterContext = AccessFilterContext;

function toCtx(
  menuRepo: MenuRepository | null | undefined,
  access?: AccessFilterContext,
): ResolveAccessContext {
  return {
    orgId: access?.orgId ?? null,
    userId: access?.userId,
    menuRepo,
    entitlementRepo: access?.entitlementRepo,
    bypassEntitlementFilter: access?.bypassEntitlementFilter,
  };
}

/** @deprecated Prefer `resolveEffectiveAccess` / `resolvePermissionSet` from access/. */
export async function resolveEffectivePermissions(
  roles: readonly string[],
  menuRepo: MenuRepository | null | undefined,
  access?: AccessFilterContext,
): Promise<Permission[]> {
  return resolvePermissionSet(roles, toCtx(menuRepo, access));
}

/** @deprecated Prefer `resolveEffectiveAccess` / `resolveNavSet` from access/. */
export async function resolveEffectiveNav(
  roles: readonly string[],
  menuRepo: MenuRepository | null | undefined,
  access?: AccessFilterContext,
): Promise<AuthNavItem[]> {
  return resolveNavSet(roles, toCtx(menuRepo, access));
}

/** @deprecated Prefer `effectiveCan(roles, permission, ctx)` from access/. */
export async function effectiveCan(
  roles: readonly string[],
  permission: Permission,
  menuRepo: MenuRepository | null | undefined,
  access?: AccessFilterContext,
): Promise<boolean> {
  return accessEffectiveCan(roles, permission, toCtx(menuRepo, access));
}

/** @deprecated Prefer `resolveGrantableMenuIds` from access/. */
export async function resolveGrantableMenuIds(
  roles: readonly string[],
  menuRepo: MenuRepository,
  access?: AccessFilterContext,
): Promise<string[]> {
  return accessResolveGrantableMenuIds(roles, menuRepo, toCtx(menuRepo, access));
}
