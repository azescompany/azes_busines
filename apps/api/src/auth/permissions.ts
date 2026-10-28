/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/permissions.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-28
 * ║ Purpose: Role → permission map (M1b RBAC; Phase 09 soft de-authz + GA)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const LMS_ROLES = ['superAdmin', 'orgAdmin', 'instructor', 'student', 'guest'] as const;

export type LmsRole = (typeof LMS_ROLES)[number];

/**
 * Membership / invitation channel roles that are Academy-oriented (AC-D07).
 * Enum values are preserved; they must not grant platform/ERP permissions.
 */
export const LMS_CHANNEL_ROLES = new Set(['instructor', 'student', 'guest']);

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

/** Platform / ERP codes — never granted via LMS channel role baseline (Phase 09). */
export const PLATFORM_ERP_PERMISSIONS = new Set<Permission>([
  'org.create',
  'org.manage_all',
  'org.manage',
  'modules.manage',
  'audit.read',
  'crm.customers.read',
  'crm.customers.create',
  'crm.customers.update',
  'crm.customers.delete',
  'dashboard.read',
]);

/**
 * GeneralAdmin capability set (AC-D01 A) — not a membership enum.
 * Assigned via platform `user_roles` / role name `generalAdmin` + this map.
 * Must not include `org.manage_all` or automatic cross-tenant CRM write.
 */
export const GENERAL_ADMIN_CAPABILITY_PERMISSIONS = [
  'org.create',
  'modules.manage',
  'audit.read',
] as const satisfies readonly Permission[];

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
  /** Platform ops capability profile — AC-D01 A (Phase 09). */
  generalAdmin: [...GENERAL_ADMIN_CAPABILITY_PERMISSIONS],
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
  /** LMS channel only — no platform/ERP (Phase 09 soft de-authz). */
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

export function isPlatformOrErpPermission(code: string): boolean {
  return PLATFORM_ERP_PERMISSIONS.has(code as Permission);
}

export function isLmsChannelRole(role: string): boolean {
  return LMS_CHANNEL_ROLES.has(normalizeRoleName(role));
}

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
  generalAdmin: 90,
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

function baselineForRole(role: string): readonly Permission[] {
  const raw = ROLE_PERMISSIONS[role] ?? [];
  if (!isLmsChannelRole(role)) return raw;
  // Defense in depth: never emit platform/ERP from LMS channel baselines.
  return raw.filter((p) => !PLATFORM_ERP_PERMISSIONS.has(p));
}

export function permissionsForRoles(roles: readonly string[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of normalizeRoles(roles)) {
    for (const p of baselineForRole(role)) {
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
