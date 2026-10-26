/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/navCatalog.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Role-filtered Academy primary nav catalog for GET /me
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { can, type Permission } from './permissions.js';

export type AuthNavItem = {
  id: string;
  path: string;
  i18nKey: string;
  /** Admin icon map key (home, business, people, security); optional for Academy. */
  iconKey?: string | null;
};

type NavCatalogEntry = AuthNavItem & {
  /** Empty = any authenticated user. Any listed permission grants the item. */
  anyOf: readonly Permission[];
};

/**
 * Canonical Academy sidebar entries (hash-less paths).
 * Keep aligned with `apps/academy` feature `paths.ts`.
 */
const NAV_CATALOG: readonly NavCatalogEntry[] = [
  { id: 'overview', path: '/', i18nKey: 'nav.overview', anyOf: [] },
  { id: 'catalog', path: '/catalog', i18nKey: 'nav.catalog', anyOf: ['catalog.read'] },
  {
    id: 'my-programs',
    path: '/my-programs',
    i18nKey: 'nav.myPrograms',
    anyOf: ['catalog.read'],
  },
  {
    id: 'learn',
    path: '/learn',
    i18nKey: 'nav.learn',
    anyOf: ['course.learn', 'progress.read_own'],
  },
  {
    id: 'quizzes',
    path: '/quizzes',
    i18nKey: 'nav.quizzes',
    anyOf: ['course.learn'],
  },
  {
    id: 'notifications',
    path: '/notifications',
    i18nKey: 'nav.notifications',
    anyOf: ['course.learn', 'progress.read_own'],
  },
  {
    id: 'certificates',
    path: '/certificates',
    i18nKey: 'nav.certificates',
    anyOf: ['course.learn', 'progress.read_own'],
  },
  {
    id: 'manage-orgs',
    path: '/manage/orgs',
    i18nKey: 'nav.orgs',
    anyOf: ['org.create', 'org.manage_all'],
  },
  {
    id: 'manage-org-admins',
    path: '/manage/org-admins',
    i18nKey: 'nav.orgAdmins',
    anyOf: ['org.manage_all'],
  },
  {
    id: 'manage-tracks',
    path: '/manage/tracks',
    i18nKey: 'nav.tracks',
    anyOf: ['track.write'],
  },
  {
    id: 'manage-courses',
    path: '/manage/courses',
    i18nKey: 'nav.manageCourses',
    anyOf: ['course.write'],
  },
  {
    id: 'manage-quizzes',
    path: '/manage/quizzes',
    i18nKey: 'nav.manageQuizzes',
    anyOf: ['course.write'],
  },
  {
    id: 'analytics',
    path: '/manage/analytics',
    i18nKey: 'nav.analytics',
    anyOf: ['analytics.read'],
  },
  {
    id: 'manage-assign',
    path: '/manage/assign',
    i18nKey: 'nav.assign',
    anyOf: ['track.assign'],
  },
];

function isGranted(roles: readonly string[], anyOf: readonly Permission[]): boolean {
  if (anyOf.length === 0) return true;
  return anyOf.some((p) => can(roles, p));
}

/** Filter canonical nav by role permissions (server source of truth for Academy UI). */
export function navForRoles(roles: readonly string[]): AuthNavItem[] {
  return NAV_CATALOG.filter((entry) => isGranted(roles, entry.anyOf)).map(
    ({ id, path, i18nKey }) => ({ id, path, i18nKey }),
  );
}
