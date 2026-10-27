/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/db/schema.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-27
 * ║ Purpose: Auth + LMS + Tenant + Menu RBAC + ERP + organization units
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { integer, real, sqliteTable, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const organizations = sqliteTable(
  'organizations',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    colorCode: text('color_code').notNull().default('#2563EB'),
    subscriptionStatus: text('subscription_status', { enum: ['active', 'blocked'] })
      .notNull()
      .default('active'),
    trialEndsAt: integer('trial_ends_at', { mode: 'number' }),
    /** AC-D08 lite — when true, module-bound writes are denied (reads may remain). */
    subscriptionReadOnly: integer('subscription_read_only', { mode: 'boolean' })
      .notNull()
      .default(false),
    status: text('status', { enum: ['active', 'disabled'] })
      .notNull()
      .default('active'),
    parentOrganizationId: text('parent_organization_id'),
    createdBy: text('created_by'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('organizations_slug_uidx').on(t.slug),
    index('organizations_parent_idx').on(t.parentOrganizationId),
  ],
);

/**
 * Platform user — password hash only; never store plaintext.
 *
 * `org_id` is the **active organization pointer** for session/JWT bootstrap
 * (AC-D02 / Phase 03). It is NOT sole membership proof — real membership lives
 * in `organization_memberships`. Switch via `POST /api/v1/me/active-organization`.
 */
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    usernameNormalized: text('username_normalized').notNull(),
    passwordHash: text('password_hash').notNull(),
    status: text('status', { enum: ['active', 'disabled', 'pending'] })
      .notNull()
      .default('pending'),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('users_username_normalized_uidx').on(t.usernameNormalized),
    index('users_org_idx').on(t.orgId),
  ],
);

export const roles = sqliteTable(
  'roles',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('roles_name_uidx').on(t.name)],
);

export const userRoles = sqliteTable(
  'user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('user_roles_uidx').on(t.userId, t.roleId)],
);

/** Refresh token storage — store hash only; plaintext never persists. */
export const refreshSessions = sqliteTable('refresh_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'number' }).notNull(),
  revokedAt: integer('revoked_at', { mode: 'number' }),
  replacedById: text('replaced_by_id'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  userAgent: text('user_agent'),
});

/** Sliding fixed-window counters for auth abuse control (Phase 2E). */
export const authRateLimits = sqliteTable('auth_rate_limits', {
  bucketKey: text('bucket_key').primaryKey(),
  windowStart: integer('window_start', { mode: 'number' }).notNull(),
  hitCount: integer('hit_count', { mode: 'number' }).notNull(),
});

/**
 * Multi-org membership — authoritative User↔Org link.
 * `users.org_id` remains only the active pointer (not a substitute for this table).
 */
export const organizationMemberships = sqliteTable(
  'organization_memberships',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', {
      enum: ['orgAdmin', 'instructor', 'student', 'guest', 'member'],
    }).notNull(),
    status: text('status', { enum: ['active', 'disabled', 'revoked'] })
      .notNull()
      .default('active'),
    orgMulti: integer('org_multi', { mode: 'number' }).notNull().default(0),
    dataScope: text('data_scope', { enum: ['org', 'own', 'subtree'] })
      .notNull()
      .default('org'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('organization_memberships_org_user_uidx').on(t.orgId, t.userId),
    index('organization_memberships_user_idx').on(t.userId),
    index('organization_memberships_org_idx').on(t.orgId),
  ],
);

/**
 * In-tenant hierarchy (branch / department / team). AC-D02 A —
 * do NOT reuse `organizations.parentOrganizationId` as a branch.
 */
export const organizationUnits = sqliteTable(
  'organization_units',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    parentUnitId: text('parent_unit_id'),
    name: text('name').notNull(),
    code: text('code').notNull(),
    kind: text('kind', { enum: ['branch', 'department', 'team', 'other'] })
      .notNull()
      .default('other'),
    status: text('status', { enum: ['active', 'disabled'] })
      .notNull()
      .default('active'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('organization_units_org_code_uidx').on(t.orgId, t.code),
    index('organization_units_org_idx').on(t.orgId),
    index('organization_units_parent_idx').on(t.parentUnitId),
  ],
);

/** User ↔ unit link inside one org (separate from organization_memberships). */
export const unitMemberships = sqliteTable(
  'unit_memberships',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    unitId: text('unit_id')
      .notNull()
      .references(() => organizationUnits.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['manager', 'member'] })
      .notNull()
      .default('member'),
    status: text('status', { enum: ['active', 'disabled'] })
      .notNull()
      .default('active'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('unit_memberships_unit_user_uidx').on(t.unitId, t.userId),
    index('unit_memberships_org_idx').on(t.orgId),
    index('unit_memberships_user_idx').on(t.userId),
  ],
);

/** Org invites — store token hash only; plaintext returned once on create. */
export const organizationInvitations = sqliteTable(
  'organization_invitations',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role', { enum: ['orgAdmin', 'instructor', 'student'] }).notNull(),
    tokenHash: text('token_hash').notNull(),
    status: text('status', { enum: ['pending', 'accepted', 'revoked', 'expired'] })
      .notNull()
      .default('pending'),
    expiresAt: integer('expires_at', { mode: 'number' }).notNull(),
    acceptedAt: integer('accepted_at', { mode: 'number' }),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('organization_invitations_token_hash_uidx').on(t.tokenHash),
    index('organization_invitations_org_idx').on(t.orgId),
    index('organization_invitations_email_idx').on(t.email),
  ],
);

/** Admin (and future app) navigation catalog — TAGET M1.5. */
export const menus = sqliteTable(
  'menus',
  {
    id: text('id').primaryKey(),
    app: text('app').notNull().default('admin'),
    code: text('code').notNull(),
    path: text('path').notNull(),
    i18nKey: text('i18n_key').notNull(),
    iconKey: text('icon_key'),
    sortOrder: integer('sort_order', { mode: 'number' }).notNull().default(0),
    status: text('status', { enum: ['active', 'disabled'] })
      .notNull()
      .default('active'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('menus_app_code_uidx').on(t.app, t.code),
    index('menus_app_sort_idx').on(t.app, t.sortOrder),
  ],
);

export const menuPermissions = sqliteTable(
  'menu_permissions',
  {
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    permissionCode: text('permission_code').notNull(),
  },
  (t) => [uniqueIndex('menu_permissions_uidx').on(t.menuId, t.permissionCode)],
);

export const roleMenus = sqliteTable(
  'role_menus',
  {
    roleName: text('role_name').notNull(),
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('role_menus_uidx').on(t.roleName, t.menuId),
    index('role_menus_role_idx').on(t.roleName),
  ],
);

/** Platform business modules (TAGET M2) — distinct from LMS curriculum `modules`. */
export const platformModules = sqliteTable(
  'platform_modules',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    version: text('version').notNull().default('1.0.0'),
    status: text('status', { enum: ['active', 'disabled'] })
      .notNull()
      .default('active'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('platform_modules_code_uidx').on(t.code)],
);

export const moduleMenus = sqliteTable(
  'module_menus',
  {
    moduleId: text('module_id')
      .notNull()
      .references(() => platformModules.id, { onDelete: 'cascade' }),
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('module_menus_uidx').on(t.moduleId, t.menuId)],
);

export const organizationModules = sqliteTable(
  'organization_modules',
  {
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    moduleId: text('module_id')
      .notNull()
      .references(() => platformModules.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['active', 'disabled'] })
      .notNull()
      .default('active'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('organization_modules_uidx').on(t.orgId, t.moduleId)],
);

export const organizationMenus = sqliteTable(
  'organization_menus',
  {
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('organization_menus_uidx').on(t.orgId, t.menuId)],
);

export const permissionProfiles = sqliteTable(
  'permission_profiles',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('permission_profiles_code_uidx').on(t.code)],
);

export const permissionProfileItems = sqliteTable(
  'permission_profile_items',
  {
    profileId: text('profile_id')
      .notNull()
      .references(() => permissionProfiles.id, { onDelete: 'cascade' }),
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    canRead: integer('can_read', { mode: 'number' }).notNull().default(1),
    canCreate: integer('can_create', { mode: 'number' }).notNull().default(0),
    canUpdate: integer('can_update', { mode: 'number' }).notNull().default(0),
    canDelete: integer('can_delete', { mode: 'number' }).notNull().default(0),
  },
  (t) => [uniqueIndex('permission_profile_items_uidx').on(t.profileId, t.menuId)],
);

export const userMenus = sqliteTable(
  'user_menus',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('user_menus_uidx').on(t.userId, t.orgId, t.menuId)],
);

export const userMenuPermissions = sqliteTable(
  'user_menu_permissions',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    canRead: integer('can_read', { mode: 'number' }).notNull().default(1),
    canCreate: integer('can_create', { mode: 'number' }).notNull().default(0),
    canUpdate: integer('can_update', { mode: 'number' }).notNull().default(0),
    canDelete: integer('can_delete', { mode: 'number' }).notNull().default(0),
  },
  (t) => [uniqueIndex('user_menu_permissions_uidx').on(t.userId, t.orgId, t.menuId)],
);

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    actorUserId: text('actor_user_id'),
    orgId: text('org_id'),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id'),
    metaJson: text('meta_json'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [index('audit_logs_created_idx').on(t.createdAt), index('audit_logs_org_idx').on(t.orgId)],
);

export const crmCustomers = sqliteTable(
  'crm_customers',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email'),
    status: text('status', { enum: ['active', 'disabled'] })
      .notNull()
      .default('active'),
    ownerUserId: text('owner_user_id'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [index('crm_customers_org_idx').on(t.orgId)],
);

/* ——— Academy LMS ——— */

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('categories_slug_uidx').on(t.slug)],
);

export const courses = sqliteTable(
  'courses',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
    level: text('level', { enum: ['beginner', 'intermediate', 'advanced'] })
      .notNull()
      .default('beginner'),
    coverFileId: text('cover_file_id'),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    accessType: text('access_type', { enum: ['free', 'invite', 'paid'] })
      .notNull()
      .default('free'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
    publishedAt: integer('published_at', { mode: 'number' }),
  },
  (t) => [
    uniqueIndex('courses_slug_uidx').on(t.slug),
    index('courses_status_idx').on(t.status),
    index('courses_owner_idx').on(t.ownerId),
    index('courses_org_idx').on(t.orgId),
  ],
);

export const tracks = sqliteTable(
  'tracks',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    status: text('status', { enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('tracks_org_slug_uidx').on(t.orgId, t.slug),
    index('tracks_org_idx').on(t.orgId),
    index('tracks_created_by_idx').on(t.createdBy),
  ],
);

export const trackCourses = sqliteTable(
  'track_courses',
  {
    trackId: text('track_id')
      .notNull()
      .references(() => tracks.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    position: integer('position', { mode: 'number' }).notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [uniqueIndex('track_courses_uidx').on(t.trackId, t.courseId)],
);

export const userTracks = sqliteTable(
  'user_tracks',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    trackId: text('track_id')
      .notNull()
      .references(() => tracks.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    assignedBy: text('assigned_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedAt: integer('assigned_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('user_tracks_uidx').on(t.userId, t.trackId),
    index('user_tracks_user_idx').on(t.userId),
  ],
);

export const modules = sqliteTable(
  'modules',
  {
    id: text('id').primaryKey(),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: integer('position', { mode: 'number' }).notNull(),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [index('modules_course_idx').on(t.courseId)],
);

export const lessons = sqliteTable(
  'lessons',
  {
    id: text('id').primaryKey(),
    moduleId: text('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: text('type', { enum: ['text', 'video', 'file'] })
      .notNull()
      .default('text'),
    content: text('content'),
    videoUrl: text('video_url'),
    durationMin: real('duration_min'),
    position: integer('position', { mode: 'number' }).notNull(),
    isRequired: integer('is_required', { mode: 'boolean' }).notNull().default(true),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [index('lessons_module_idx').on(t.moduleId)],
);

export const fileAssets = sqliteTable('file_assets', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  storageKey: text('storage_key').notNull(),
  mime: text('mime').notNull(),
  size: integer('size', { mode: 'number' }).notNull(),
  purpose: text('purpose').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

export const enrollments = sqliteTable(
  'enrollments',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['active', 'completed', 'cancelled'] })
      .notNull()
      .default('active'),
    enrolledAt: integer('enrolled_at', { mode: 'number' }).notNull(),
    completedAt: integer('completed_at', { mode: 'number' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('enrollments_user_course_uidx').on(t.userId, t.courseId),
    index('enrollments_user_idx').on(t.userId),
  ],
);

export const lessonProgress = sqliteTable(
  'lesson_progress',
  {
    id: text('id').primaryKey(),
    enrollmentId: text('enrollment_id')
      .notNull()
      .references(() => enrollments.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['not_started', 'in_progress', 'completed'] })
      .notNull()
      .default('not_started'),
    completedAt: integer('completed_at', { mode: 'number' }),
    lastPositionSec: integer('last_position_sec', { mode: 'number' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('lesson_progress_enroll_lesson_uidx').on(t.enrollmentId, t.lessonId),
    index('lesson_progress_enrollment_idx').on(t.enrollmentId),
  ],
);

export const quizzes = sqliteTable(
  'quizzes',
  {
    id: text('id').primaryKey(),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    timeLimitSec: integer('time_limit_sec', { mode: 'number' }),
    maxAttempts: integer('max_attempts', { mode: 'number' }).notNull().default(3),
    passScore: integer('pass_score', { mode: 'number' }).notNull().default(70),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [index('quizzes_course_idx').on(t.courseId)],
);

export const questions = sqliteTable(
  'questions',
  {
    id: text('id').primaryKey(),
    quizId: text('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['single_choice', 'multiple_choice', 'short_text'] })
      .notNull()
      .default('single_choice'),
    text: text('text').notNull(),
    /** JSON array of { id, label } — never includes correctness. */
    optionsJson: text('options_json'),
    /** JSON — server-only; never returned on student take endpoints. */
    correctAnswerJson: text('correct_answer_json').notNull(),
    explanation: text('explanation'),
    points: integer('points', { mode: 'number' }).notNull().default(1),
    position: integer('position', { mode: 'number' }).notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [index('questions_quiz_idx').on(t.quizId)],
);

export const quizAttempts = sqliteTable(
  'quiz_attempts',
  {
    id: text('id').primaryKey(),
    quizId: text('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    startedAt: integer('started_at', { mode: 'number' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'number' }),
    submittedAt: integer('submitted_at', { mode: 'number' }),
    score: integer('score', { mode: 'number' }),
    status: text('status', { enum: ['in_progress', 'submitted', 'expired'] })
      .notNull()
      .default('in_progress'),
    idempotencyKey: text('idempotency_key'),
    answersJson: text('answers_json'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    index('quiz_attempts_quiz_user_idx').on(t.quizId, t.userId),
    uniqueIndex('quiz_attempts_idempotency_uidx').on(t.quizId, t.userId, t.idempotencyKey),
  ],
);

export const assignments = sqliteTable(
  'assignments',
  {
    id: text('id').primaryKey(),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    dueAt: integer('due_at', { mode: 'number' }),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [index('assignments_course_idx').on(t.courseId)],
);

export const assignmentSubmissions = sqliteTable(
  'assignment_submissions',
  {
    id: text('id').primaryKey(),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content'),
    fileId: text('file_id'),
    status: text('status', { enum: ['submitted', 'graded'] })
      .notNull()
      .default('submitted'),
    score: integer('score', { mode: 'number' }),
    feedback: text('feedback'),
    gradedBy: text('graded_by').references(() => users.id, { onDelete: 'set null' }),
    gradedAt: integer('graded_at', { mode: 'number' }),
    submittedAt: integer('submitted_at', { mode: 'number' }).notNull(),
    idempotencyKey: text('idempotency_key'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    index('assignment_submissions_assignment_idx').on(t.assignmentId),
    uniqueIndex('assignment_submissions_idempotency_uidx').on(
      t.assignmentId,
      t.userId,
      t.idempotencyKey,
    ),
  ],
);

export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull().default('info'),
    title: text('title').notNull(),
    body: text('body'),
    link: text('link'),
    readAt: integer('read_at', { mode: 'number' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    index('notifications_user_idx').on(t.userId),
    index('notifications_user_read_idx').on(t.userId, t.readAt),
  ],
);

export const bookmarks = sqliteTable(
  'bookmarks',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('bookmarks_user_course_uidx').on(t.userId, t.courseId),
    index('bookmarks_user_idx').on(t.userId),
  ],
);

export const certificates = sqliteTable(
  'certificates',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    issuedAt: integer('issued_at', { mode: 'number' }).notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('certificates_user_course_uidx').on(t.userId, t.courseId),
    uniqueIndex('certificates_code_uidx').on(t.code),
    index('certificates_user_idx').on(t.userId),
  ],
);
