/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/paths.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Locale-free logical PATHS for @azes/admin
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { isSupportedLocale, type SupportedLocale } from '@azes/i18n';

/** Logical paths — no locale prefix. */
export const PATHS = {
  home: '/',
  organizations: '/organizations',
  organizationDetail: '/organizations/:orgId',
  users: '/users',
  userAccess: '/users/:userId/access',
  roleMenus: '/role-menus',
  platformRoles: '/platform-roles',
  customers: '/customers',
} as const;

export type AdminPath = (typeof PATHS)[keyof typeof PATHS];

export function organizationDetailPath(orgId: string): string {
  return `/organizations/${encodeURIComponent(orgId)}`;
}

export function userAccessPath(userId: string): string {
  return `/users/${encodeURIComponent(userId)}/access`;
}

/** Prefix a logical path with the active locale segment. */
export function pathTo(logicalPath: string, locale: SupportedLocale | string): string {
  const localeSeg = isSupportedLocale(locale) ? locale : 'az';
  const clean = logicalPath.startsWith('/') ? logicalPath : `/${logicalPath}`;
  if (clean === '/') return `/${localeSeg}`;
  return `/${localeSeg}${clean}`;
}

/** Strip `/en|az|ru` prefix for nav matching. */
export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && isSupportedLocale(parts[0])) {
    const rest = parts.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname || '/';
}

export function replaceLocaleInPathname(pathname: string, nextLocale: SupportedLocale): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && isSupportedLocale(parts[0])) {
    parts[0] = nextLocale;
    return `/${parts.join('/')}`;
  }
  return pathTo(pathname || '/', nextLocale);
}
