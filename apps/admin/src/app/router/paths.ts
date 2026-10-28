/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/paths.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-28
 * ║ Purpose: Locale-free logical PATHS — unified home `/` + module `/m`
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { isSupportedLocale, type SupportedLocale } from '@azes/i18n';

/** Logical paths — no locale prefix. */
export const PATHS = {
  /** Unified launcher home (demo | tenant) under AppShell. */
  home: '/',
  /** Legacy bookmark — redirect to `home`. */
  apps: '/apps',
  /** Legacy demo module bookmark — redirect to `module`. */
  demoModule: '/demo/m/:moduleId/*',
  /** Module workspace catch-all — `/m/:moduleId/*` (demo | tenant). */
  module: '/m/:moduleId/*',
  organizations: '/organizations',
  organizationDetail: '/organizations/:orgId',
  users: '/users',
  userAccess: '/users/:userId/access',
  roleMenus: '/role-menus',
  platformRoles: '/platform-roles',
  customers: '/customers',
  auditLogs: '/audit-logs',
} as const;

/** Logical path for a module root or nested menu. */
export function modulePath(moduleId: string, suffix = ''): string {
  const base = `/m/${encodeURIComponent(moduleId)}`;
  if (!suffix || suffix === '/') return base;
  const clean = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${base}${clean}`;
}

/**
 * @deprecated Prefer `modulePath` — kept for bookmark redirects only.
 * Logical path for legacy `/demo/m/:moduleId`.
 */
export function demoModulePath(moduleId: string, suffix = ''): string {
  const base = `/demo/m/${encodeURIComponent(moduleId)}`;
  if (!suffix || suffix === '/') return base;
  const clean = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${base}${clean}`;
}

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
