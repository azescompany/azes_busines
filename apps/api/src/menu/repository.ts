/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/menu/repository.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Menu + role_menus + user override persistence (D1 + memory)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, eq, inArray } from 'drizzle-orm';

import { mapCrudFlagsToPermissionCodes } from '../access/permissionMapper.js';
import { nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import type { MenuDto, MenuNavItem } from './types.js';

export type UserOverrideCrud = {
  menuId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export interface MenuRepository {
  listMenus(app?: string): Promise<MenuDto[]>;
  listMenuIdsForRoles(roleNames: readonly string[]): Promise<string[]>;
  listNavForRoles(roleNames: readonly string[], app?: string): Promise<MenuNavItem[]>;
  listPermissionCodesForRoles(roleNames: readonly string[]): Promise<string[]>;
  /** All permission codes that appear on any menu (menu-gated set). */
  listAllMenuGatedPermissionCodes(): Promise<string[]>;
  listRoleMenus(roleName: string): Promise<string[]>;
  setRoleMenus(roleName: string, menuIds: string[]): Promise<string[]>;
  /** Permission codes from `user_menu_permissions` CRUD flags (AC-D03 mapper). */
  listUserOverridePermissionCodes(userId: string, orgId: string): Promise<string[]>;
  /** Extra menu ids from `user_menus` for nav merge. */
  listUserOverrideMenuIds(userId: string, orgId: string): Promise<string[]>;
  /** Optional memory seed / test helper. */
  setUserAccess?(
    userId: string,
    orgId: string,
    menuIds: string[],
    permissions: UserOverrideCrud[],
  ): Promise<void>;
  listPermissionCodesForMenuIds(menuIds: readonly string[]): Promise<string[]>;
}

function mapMenu(row: typeof schema.menus.$inferSelect, permissionCodes: string[]): MenuDto {
  return {
    id: row.id,
    app: row.app,
    code: row.code,
    path: row.path,
    i18nKey: row.i18nKey,
    iconKey: row.iconKey ?? null,
    sortOrder: row.sortOrder,
    status: row.status as 'active' | 'disabled',
    permissionCodes,
  };
}

export function createDrizzleMenuRepository(db: ApiDb): MenuRepository {
  return {
    async listMenus(app = 'admin') {
      const rows = await db
        .select()
        .from(schema.menus)
        .where(and(eq(schema.menus.app, app), eq(schema.menus.status, 'active')))
        .orderBy(asc(schema.menus.sortOrder));
      const perms = await db.select().from(schema.menuPermissions);
      const byMenu = new Map<string, string[]>();
      for (const p of perms) {
        const list = byMenu.get(p.menuId) ?? [];
        list.push(p.permissionCode);
        byMenu.set(p.menuId, list);
      }
      return rows.map((r) => mapMenu(r, byMenu.get(r.id) ?? []));
    },

    async listMenuIdsForRoles(roleNames) {
      if (roleNames.length === 0) return [];
      const rows = await db
        .select({ menuId: schema.roleMenus.menuId })
        .from(schema.roleMenus)
        .where(inArray(schema.roleMenus.roleName, [...roleNames]));
      return [...new Set(rows.map((r) => r.menuId))];
    },

    async listNavForRoles(roleNames, app = 'admin') {
      const menuIds = await this.listMenuIdsForRoles(roleNames);
      if (menuIds.length === 0) return [];
      const rows = await db
        .select()
        .from(schema.menus)
        .where(
          and(
            eq(schema.menus.app, app),
            eq(schema.menus.status, 'active'),
            inArray(schema.menus.id, menuIds),
          ),
        )
        .orderBy(asc(schema.menus.sortOrder));
      return rows.map((r) => ({
        id: r.code,
        path: r.path,
        i18nKey: r.i18nKey,
        iconKey: r.iconKey ?? null,
      }));
    },

    async listPermissionCodesForRoles(roleNames) {
      const menuIds = await this.listMenuIdsForRoles(roleNames);
      if (menuIds.length === 0) return [];
      const rows = await db
        .select({ code: schema.menuPermissions.permissionCode })
        .from(schema.menuPermissions)
        .where(inArray(schema.menuPermissions.menuId, menuIds));
      return [...new Set(rows.map((r) => r.code))];
    },

    async listAllMenuGatedPermissionCodes() {
      const rows = await db
        .select({ code: schema.menuPermissions.permissionCode })
        .from(schema.menuPermissions);
      return [...new Set(rows.map((r) => r.code))];
    },

    async listRoleMenus(roleName) {
      const rows = await db
        .select({ menuId: schema.roleMenus.menuId })
        .from(schema.roleMenus)
        .where(eq(schema.roleMenus.roleName, roleName));
      return rows.map((r) => r.menuId);
    },

    async setRoleMenus(roleName, menuIds) {
      const unique = [...new Set(menuIds.map((id) => id.trim()).filter(Boolean))];
      if (unique.length > 0) {
        const existing = await db
          .select({ id: schema.menus.id })
          .from(schema.menus)
          .where(inArray(schema.menus.id, unique));
        if (existing.length !== unique.length) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'One or more menu ids are invalid');
        }
      }
      await db.delete(schema.roleMenus).where(eq(schema.roleMenus.roleName, roleName));
      const ts = nowSec();
      for (const menuId of unique) {
        await db.insert(schema.roleMenus).values({
          roleName,
          menuId,
          createdAt: ts,
        });
      }
      return unique;
    },

    async listPermissionCodesForMenuIds(menuIds) {
      if (menuIds.length === 0) return [];
      const rows = await db
        .select({ code: schema.menuPermissions.permissionCode })
        .from(schema.menuPermissions)
        .where(inArray(schema.menuPermissions.menuId, [...menuIds]));
      return [...new Set(rows.map((r) => r.code))];
    },

    async listUserOverrideMenuIds(userId, orgId) {
      const rows = await db
        .select({ menuId: schema.userMenus.menuId })
        .from(schema.userMenus)
        .where(and(eq(schema.userMenus.userId, userId), eq(schema.userMenus.orgId, orgId)));
      return rows.map((r) => r.menuId);
    },

    async listUserOverridePermissionCodes(userId, orgId) {
      const crudRows = await db
        .select()
        .from(schema.userMenuPermissions)
        .where(
          and(
            eq(schema.userMenuPermissions.userId, userId),
            eq(schema.userMenuPermissions.orgId, orgId),
          ),
        );
      const menuOnly = await this.listUserOverrideMenuIds(userId, orgId);
      const codes = new Set<string>();
      const menusWithCrud = new Set(crudRows.map((r) => r.menuId));

      for (const row of crudRows) {
        const menuCodes = await this.listPermissionCodesForMenuIds([row.menuId]);
        for (const c of mapCrudFlagsToPermissionCodes(menuCodes, {
          canRead: Boolean(row.canRead),
          canCreate: Boolean(row.canCreate),
          canUpdate: Boolean(row.canUpdate),
          canDelete: Boolean(row.canDelete),
        })) {
          codes.add(c);
        }
      }
      // user_menus without CRUD row → read-only codes for that menu
      for (const menuId of menuOnly) {
        if (menusWithCrud.has(menuId)) continue;
        const menuCodes = await this.listPermissionCodesForMenuIds([menuId]);
        for (const c of mapCrudFlagsToPermissionCodes(menuCodes, {
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        })) {
          codes.add(c);
        }
      }
      return [...codes];
    },
  };
}

export function createMemoryMenuRepository(seed?: {
  menus?: MenuDto[];
  roleMenus?: Record<string, string[]>;
  userAccess?: Record<string, { menuIds: string[]; permissions: UserOverrideCrud[] }>;
}): MenuRepository {
  const menus = [...(seed?.menus ?? defaultAdminMenus())];
  const roleMenus = new Map<string, Set<string>>();
  for (const [role, ids] of Object.entries(seed?.roleMenus ?? defaultRoleMenus())) {
    roleMenus.set(role, new Set(ids));
  }
  const userAccess = new Map<string, { menuIds: string[]; permissions: UserOverrideCrud[] }>(
    Object.entries(seed?.userAccess ?? {}),
  );
  const accessKey = (userId: string, orgId: string) => `${userId}::${orgId}`;

  return {
    async listMenus(app = 'admin') {
      return menus
        .filter((m) => m.app === app && m.status === 'active')
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async listMenuIdsForRoles(roleNames) {
      const ids = new Set<string>();
      for (const role of roleNames) {
        for (const id of roleMenus.get(role) ?? []) ids.add(id);
      }
      return [...ids];
    },

    async listNavForRoles(roleNames, app = 'admin') {
      const ids = new Set(await this.listMenuIdsForRoles(roleNames));
      return menus
        .filter((m) => m.app === app && m.status === 'active' && ids.has(m.id))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => ({
          id: m.code,
          path: m.path,
          i18nKey: m.i18nKey,
          iconKey: m.iconKey,
        }));
    },

    async listPermissionCodesForRoles(roleNames) {
      const ids = new Set(await this.listMenuIdsForRoles(roleNames));
      const codes = new Set<string>();
      for (const m of menus) {
        if (ids.has(m.id)) {
          for (const c of m.permissionCodes) codes.add(c);
        }
      }
      return [...codes];
    },

    async listAllMenuGatedPermissionCodes() {
      const codes = new Set<string>();
      for (const m of menus) {
        for (const c of m.permissionCodes) codes.add(c);
      }
      return [...codes];
    },

    async listRoleMenus(roleName) {
      return [...(roleMenus.get(roleName) ?? [])];
    },

    async setRoleMenus(roleName, menuIds) {
      const unique = [...new Set(menuIds)];
      for (const id of unique) {
        if (!menus.some((m) => m.id === id)) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'One or more menu ids are invalid');
        }
      }
      roleMenus.set(roleName, new Set(unique));
      return unique;
    },

    async listPermissionCodesForMenuIds(menuIds) {
      const codes = new Set<string>();
      for (const m of menus) {
        if (menuIds.includes(m.id)) {
          for (const c of m.permissionCodes) codes.add(c);
        }
      }
      return [...codes];
    },

    async listUserOverrideMenuIds(userId, orgId) {
      return userAccess.get(accessKey(userId, orgId))?.menuIds ?? [];
    },

    async listUserOverridePermissionCodes(userId, orgId) {
      const row = userAccess.get(accessKey(userId, orgId));
      if (!row) return [];
      const codes = new Set<string>();
      const menusWithCrud = new Set(row.permissions.map((p) => p.menuId));
      for (const p of row.permissions) {
        const menuCodes = await this.listPermissionCodesForMenuIds([p.menuId]);
        for (const c of mapCrudFlagsToPermissionCodes(menuCodes, p)) codes.add(c);
      }
      for (const menuId of row.menuIds) {
        if (menusWithCrud.has(menuId)) continue;
        const menuCodes = await this.listPermissionCodesForMenuIds([menuId]);
        for (const c of mapCrudFlagsToPermissionCodes(menuCodes, {
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        })) {
          codes.add(c);
        }
      }
      return [...codes];
    },

    async setUserAccess(userId, orgId, menuIds, permissions) {
      userAccess.set(accessKey(userId, orgId), {
        menuIds: [...menuIds],
        permissions: [...permissions],
      });
    },
  };
}

function defaultAdminMenus(): MenuDto[] {
  return [
    {
      id: 'menu-admin-home',
      app: 'admin',
      code: 'home',
      path: '/',
      i18nKey: 'nav.home',
      iconKey: 'home',
      sortOrder: 10,
      status: 'active',
      permissionCodes: [],
    },
    {
      id: 'menu-admin-orgs',
      app: 'admin',
      code: 'organizations',
      path: '/organizations',
      i18nKey: 'nav.organizations',
      iconKey: 'business',
      sortOrder: 20,
      status: 'active',
      permissionCodes: ['org.manage', 'org.create'],
    },
    {
      id: 'menu-admin-users',
      app: 'admin',
      code: 'users',
      path: '/users',
      i18nKey: 'nav.users',
      iconKey: 'people',
      sortOrder: 30,
      status: 'active',
      permissionCodes: ['org.manage'],
    },
    {
      id: 'menu-admin-role-menus',
      app: 'admin',
      code: 'role-menus',
      path: '/role-menus',
      i18nKey: 'nav.roleMenus',
      iconKey: 'security',
      sortOrder: 40,
      status: 'active',
      permissionCodes: ['org.manage_all'],
    },
    {
      id: 'menu-admin-platform-roles',
      app: 'admin',
      code: 'platform-roles',
      path: '/platform-roles',
      i18nKey: 'nav.platformRoles',
      iconKey: 'security',
      sortOrder: 45,
      status: 'active',
      permissionCodes: ['org.manage_all'],
    },
    {
      id: 'menu-admin-customers',
      app: 'admin',
      code: 'customers',
      path: '/customers',
      i18nKey: 'nav.customers',
      iconKey: 'people',
      sortOrder: 50,
      status: 'active',
      permissionCodes: [
        'crm.customers.read',
        'crm.customers.create',
        'crm.customers.update',
        'crm.customers.delete',
      ],
    },
    {
      id: 'menu-admin-audit',
      app: 'admin',
      code: 'audit-logs',
      path: '/audit-logs',
      i18nKey: 'nav.auditLogs',
      iconKey: 'security',
      sortOrder: 60,
      status: 'active',
      permissionCodes: ['audit.read'],
    },
  ];
}

function defaultRoleMenus(): Record<string, string[]> {
  return {
    superAdmin: [
      'menu-admin-home',
      'menu-admin-orgs',
      'menu-admin-users',
      'menu-admin-role-menus',
      'menu-admin-platform-roles',
      'menu-admin-customers',
      'menu-admin-audit',
    ],
    /** AC-D01 A — platform ops without org.manage_all / CRM menus. */
    generalAdmin: ['menu-admin-home', 'menu-admin-orgs', 'menu-admin-audit'],
    orgAdmin: ['menu-admin-home', 'menu-admin-orgs', 'menu-admin-users', 'menu-admin-customers'],
    instructor: ['menu-admin-home'],
    student: ['menu-admin-home'],
  };
}
