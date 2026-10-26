/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/userAccess.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Permission profiles + user menu assignment (TAGET M3)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { getAuthUser, requireAuth, requirePermission, type AuthedEnv } from '../auth/requireAuth.js';
import { nowSec } from '../auth/tokens.js';
import { createDb } from '../db/client.js';
import {
  permissionProfileItems,
  permissionProfiles,
  userMenuPermissions,
  userMenus,
} from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import type { MenuRepository } from '../menu/repository.js';
import { writeAuditLog } from '../org/writeAuditLog.js';

export type CreateAccessRoutesOptions = {
  menuRepo?: MenuRepository;
};

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const putUserAccessSchema = z.object({
  menuIds: z.array(z.string().min(1)),
  permissions: z
    .array(
      z.object({
        menuId: z.string().min(1),
        canRead: z.boolean(),
        canCreate: z.boolean(),
        canUpdate: z.boolean(),
        canDelete: z.boolean(),
      }),
    )
    .optional(),
});

export function createAccessRoutes(_options: CreateAccessRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get(
    '/api/v1/permission-profiles',
    requireAuth(),
    requirePermission('org.manage'),
    async (c) => {
      if (!c.env.DB) {
        return c.json({
          items: [
            { id: 'prof-org-admin', code: 'org-admin', name: 'Organization Admin' },
            { id: 'prof-readonly', code: 'read-only', name: 'Read-only User' },
          ],
        });
      }
      const db = createDb(c.env.DB);
      const rows = await db.select().from(permissionProfiles).all();
      return c.json({
        items: rows.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          description: r.description,
        })),
      });
    },
  );

  routes.get(
    '/api/v1/permission-profiles/:profileId',
    requireAuth(),
    requirePermission('org.manage'),
    async (c) => {
      const profileId = c.req.param('profileId');
      if (!c.env.DB) {
        return c.json({ id: profileId, items: [] });
      }
      const db = createDb(c.env.DB);
      const items = await db
        .select()
        .from(permissionProfileItems)
        .where(eq(permissionProfileItems.profileId, profileId))
        .all();
      return c.json({
        id: profileId,
        items: items.map((i) => ({
          menuId: i.menuId,
          canRead: Boolean(i.canRead),
          canCreate: Boolean(i.canCreate),
          canUpdate: Boolean(i.canUpdate),
          canDelete: Boolean(i.canDelete),
        })),
      });
    },
  );

  routes.get(
    '/api/v1/users/:userId/access',
    requireAuth(),
    requirePermission('org.manage'),
    async (c) => {
      const userId = c.req.param('userId');
      const orgId = c.req.query('orgId')?.trim();
      const actor = getAuthUser(c);
      const effectiveOrg = orgId || actor.orgId;
      if (!effectiveOrg) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'orgId required');
      }
      if (!c.env.DB) {
        return c.json({ userId, orgId: effectiveOrg, menuIds: [], permissions: [] });
      }
      const db = createDb(c.env.DB);
      const menus = await db
        .select()
        .from(userMenus)
        .where(and(eq(userMenus.userId, userId), eq(userMenus.orgId, effectiveOrg)))
        .all();
      const perms = await db
        .select()
        .from(userMenuPermissions)
        .where(
          and(eq(userMenuPermissions.userId, userId), eq(userMenuPermissions.orgId, effectiveOrg)),
        )
        .all();
      return c.json({
        userId,
        orgId: effectiveOrg,
        menuIds: menus.map((m) => m.menuId),
        permissions: perms.map((p) => ({
          menuId: p.menuId,
          canRead: Boolean(p.canRead),
          canCreate: Boolean(p.canCreate),
          canUpdate: Boolean(p.canUpdate),
          canDelete: Boolean(p.canDelete),
        })),
      });
    },
  );

  routes.put(
    '/api/v1/users/:userId/access',
    requireAuth(),
    requirePermission('org.manage'),
    async (c) => {
      const userId = c.req.param('userId');
      const actor = getAuthUser(c);
      const body = parseBody(putUserAccessSchema, await c.req.json());
      const orgId = c.req.query('orgId')?.trim() || actor.orgId;
      if (!orgId) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'orgId required');
      }
      if (!c.env.DB) {
        return c.json({ userId, orgId, menuIds: body.menuIds, permissions: body.permissions ?? [] });
      }
      const db = createDb(c.env.DB);
      const now = nowSec();
      await db
        .delete(userMenus)
        .where(and(eq(userMenus.userId, userId), eq(userMenus.orgId, orgId)))
        .run();
      await db
        .delete(userMenuPermissions)
        .where(and(eq(userMenuPermissions.userId, userId), eq(userMenuPermissions.orgId, orgId)))
        .run();
      for (const menuId of body.menuIds) {
        await db.insert(userMenus).values({ userId, orgId, menuId, createdAt: now }).run();
      }
      for (const p of body.permissions ?? []) {
        await db
          .insert(userMenuPermissions)
          .values({
            userId,
            orgId,
            menuId: p.menuId,
            canRead: p.canRead ? 1 : 0,
            canCreate: p.canCreate ? 1 : 0,
            canUpdate: p.canUpdate ? 1 : 0,
            canDelete: p.canDelete ? 1 : 0,
          })
          .run();
      }
      await writeAuditLog(c.env, {
        actorUserId: actor.sub,
        orgId,
        action: 'user.access.update',
        targetType: 'user',
        targetId: userId,
        meta: { menuIds: body.menuIds },
      });
      return c.json({ userId, orgId, menuIds: body.menuIds, permissions: body.permissions ?? [] });
    },
  );

  return routes;
}
