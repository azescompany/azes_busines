/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/pathGuard.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Soft-shell path allowlist — home + modules + legacy
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { isPathAllowedByNav, type MeNavItem } from '../navigation/primaryNav.js';
import { isModulePath, isPathAllowedByModules } from './resolveModules.js';

const LEGACY_ROOTS = [
  '/organizations',
  '/users',
  '/role-menus',
  '/platform-roles',
  '/customers',
  '/audit-logs',
] as const;

function isLegacyAdminPath(logicalPath: string): boolean {
  return LEGACY_ROOTS.some((root) => logicalPath === root || logicalPath.startsWith(`${root}/`));
}

function isLauncherHomePath(logicalPath: string): boolean {
  return (
    logicalPath === '/' || logicalPath === '' || logicalPath === '/apps' || logicalPath === '/apps/'
  );
}

/**
 * Tenant audience path check: launcher home, module workspace, legacy AC routes.
 * Demo audience does not call this (no /me.nav). Privileged routes use AuthGate.
 */
export function isAdminPathAllowed(logicalPath: string, meNav: MeNavItem[] | undefined): boolean {
  if (isLauncherHomePath(logicalPath)) return true;
  if (isModulePath(logicalPath)) return isPathAllowedByModules(logicalPath);
  if (isLegacyAdminPath(logicalPath)) return true;
  if (meNav && meNav.length > 0) return isPathAllowedByNav(logicalPath, meNav);
  return false;
}
