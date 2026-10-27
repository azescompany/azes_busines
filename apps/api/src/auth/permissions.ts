/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/permissions.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-27
 * ║ Purpose: Role → permission map (M1b RBAC; CLAUDE_DELTA)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const LMS_ROLES = ['superAdmin', 'orgAdmin', 'instructor', 'student', 'guest'] as const;

export type LmsRole = (typeof LMS_ROLES)[number];

export type Permission =
  | 'org.create'
  | 'org.manage_all'
  | 'org.manage'
  | 'instructor.create'
  | 'track.write'
  | 'course.write'
  | 'course.publish'
  | 'student.create'
  | 'track.assign'
  | 'catalog.read'
  | 'course.learn'
  | 'progress.read_own'
  | 'progress.read_students'
  | 'analytics.read'
  | 'modules.manage'
  | 'audit.read'
  | 'crm.customers.read'
  | 'crm.customers.create'
  | 'crm.customers.update'
  | 'crm.customers.delete'
  | 'dashboard.read';

const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  superAdmin: [
    'org.create',
    'org.manage_all',
    'org.manage',
    'instructor.create',
    'track.write',
    'course.write',
    'course.publish',
    'student.create',
    'track.assign',
    'catalog.read',
    // Staff may also use personal learner surfaces (dashboard / enroll / progress).
    'course.learn',
    'progress.read_own',
    'progress.read_students',
    'analytics.read',
    'modules.manage',
    'audit.read',
    'crm.customers.read',
    'crm.customers.create',
    'crm.customers.update',
    'crm.customers.delete',
    'dashboard.read',
  ],
  orgAdmin: [
    'org.manage',
    'instructor.create',
    'track.write',
    'course.write',
    'course.publish',
    'student.create',
    'track.assign',
    'catalog.read',
    'course.learn',
    'progress.read_own',
    'progress.read_students',
    'analytics.read',
    'crm.customers.read',
    'crm.customers.create',
    'crm.customers.update',
    'crm.customers.delete',
    'dashboard.read',
  ],
  instructor: [
    'track.write',
    'course.write',
    'course.publish',
    'student.create',
    'track.assign',
    'catalog.read',
    'course.learn',
    'progress.read_own',
    'progress.read_students',
    'analytics.read',
  ],
  student: ['catalog.read', 'course.learn', 'progress.read_own'],
  guest: ['catalog.read'],
};

/** Legacy LMS `admin` → `orgAdmin` (never auto-map to superAdmin). */
export function normalizeRoleName(role: string): string {
  if (role === 'admin') return 'orgAdmin';
  return role;
}

export function normalizeRoles(roles: readonly string[]): string[] {
  const out = new Set<string>();
  for (const r of roles) {
    out.add(normalizeRoleName(r));
  }
  return [...out];
}

const ROLE_RANK: Record<string, number> = {
  superAdmin: 100,
  orgAdmin: 80,
  instructor: 60,
  student: 20,
  guest: 0,
};

export function primaryRole(roles: readonly string[]): string {
  const normalized = normalizeRoles(roles);
  if (normalized.length === 0) return 'guest';
  return normalized.reduce((best, r) => ((ROLE_RANK[r] ?? 0) > (ROLE_RANK[best] ?? 0) ? r : best));
}

export function permissionsForRoles(roles: readonly string[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of normalizeRoles(roles)) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) {
      set.add(p);
    }
  }
  return [...set];
}

export function can(roles: readonly string[], permission: Permission): boolean {
  return permissionsForRoles(roles).includes(permission);
}

/**
 * Static fallback authz from **roles only** (AC-D05).
 *
 * JWT `permissions[]` may still be present for client compat —
 * it is **not** authoritative and is ignored here. Prefer `requirePermission` →
 * `effectiveCan` (live menuRepo) for protected routes.
 *
 * **Deprecation (Phase 08 / 2026-10-27):** stop treating claim as authz (already).
 * Emission of `permissions[]` in access JWT may be removed after **2026-12-31**
 * once Admin/Account clients rely only on `/me` (AC-D04). Owner: Backend Worker +
 * Coordinator release notes.
 */
export function claimHasPermission(
  user: { roles: readonly string[]; permissions?: readonly string[] },
  permission: Permission,
): boolean {
  void user.permissions;
  return can(user.roles, permission);
}

export function isPlatformStaff(roles: readonly string[]): boolean {
  return can(roles, 'course.write');
}
