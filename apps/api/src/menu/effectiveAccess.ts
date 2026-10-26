/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/menu/effectiveAccess.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Resolve nav + permissions from role_menus UNION
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  normalizeRoles,
  permissionsForRoles,
  type Permission,
} from '../auth/permissions.js';
import type { AuthNavItem } from '../auth/navCatalog.js';
import type { MenuRepository } from './repository.js';

/**
 * Menu-gated permission codes come only from role_menus UNION.
 * Other LMS permissions stay on the static ROLE_PERMISSIONS baseline.
 * superAdmin always receives the full static platform set + all admin nav.
 */
export async function resolveEffectivePermissions(
  roles: readonly string[],
  menuRepo: MenuRepository | null | undefined,
): Promise<Permission[]> {
  const normalized = normalizeRoles(roles);
  if (normalized.includes('superAdmin')) {
    return permissionsForRoles(normalized);
  }

  const baseline = permissionsForRoles(normalized);
  if (!menuRepo) {
    return baseline;
  }

  const gated = new Set(await menuRepo.listAllMenuGatedPermissionCodes());
  const fromMenus = await menuRepo.listPermissionCodesForRoles(normalized);
  const keptBaseline = baseline.filter((p) => !gated.has(p));
  const set = new Set<Permission>(keptBaseline);
  for (const code of fromMenus) {
    set.add(code as Permission);
  }
  return [...set];
}

export async function resolveEffectiveNav(
  roles: readonly string[],
  menuRepo: MenuRepository | null | undefined,
): Promise<AuthNavItem[]> {
  const normalized = normalizeRoles(roles);
  if (!menuRepo) {
    // Fallback: empty admin nav when no menu repo (should not happen in production).
    return [{ id: 'home', path: '/', i18nKey: 'nav.home' }];
  }
  const items = await menuRepo.listNavForRoles(normalized, 'admin');
  return items.map((i) => ({
    id: i.id,
    path: i.path,
    i18nKey: i.i18nKey,
    iconKey: i.iconKey,
  }));
}

export async function effectiveCan(
  roles: readonly string[],
  permission: Permission,
  menuRepo: MenuRepository | null | undefined,
): Promise<boolean> {
  const perms = await resolveEffectivePermissions(roles, menuRepo);
  return perms.includes(permission);
}
