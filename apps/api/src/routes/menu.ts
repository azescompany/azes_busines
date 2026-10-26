/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/menu.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Menu catalog + role↔menu binding HTTP APIs (M1.5)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { LMS_ROLES } from '../auth/permissions.js';
import { requireAuth, requirePermission, type AuthedEnv } from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import {
  createDrizzleMenuRepository,
  createMemoryMenuRepository,
  type MenuRepository,
} from '../menu/repository.js';

export type CreateMenuRoutesOptions = {
  menuRepo?: MenuRepository;
};

function resolveMenuRepo(env: ApiEnv, injected?: MenuRepository): MenuRepository {
  if (injected) return injected;
  if (!env.DB) {
    return createMemoryMenuRepository();
  }
  return createDrizzleMenuRepository(createDb(env.DB));
}

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const putRoleMenusSchema = z.object({
  menuIds: z.array(z.string().min(1)),
});

const ASSIGNABLE_ROLES = LMS_ROLES.filter((r) => r !== 'superAdmin');

export function createMenuRoutes(options: CreateMenuRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/menus', requireAuth(), requirePermission('org.manage_all'), async (c) => {
    const repo = resolveMenuRepo(c.env, options.menuRepo);
    const app = c.req.query('app')?.trim() || 'admin';
    return c.json({ items: await repo.listMenus(app) });
  });

  routes.get('/api/v1/roles', requireAuth(), requirePermission('org.manage_all'), async (c) => {
    return c.json({
      items: LMS_ROLES.map((name) => ({
        name,
        assignable: name !== 'superAdmin',
      })),
    });
  });

  routes.get(
    '/api/v1/roles/:role/menus',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const role = c.req.param('role');
      if (!(LMS_ROLES as readonly string[]).includes(role)) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Role not found');
      }
      const repo = resolveMenuRepo(c.env, options.menuRepo);
      const menuIds = await repo.listRoleMenus(role);
      return c.json({ role, menuIds });
    },
  );

  routes.put(
    '/api/v1/roles/:role/menus',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const role = c.req.param('role');
      if (!ASSIGNABLE_ROLES.includes(role as (typeof ASSIGNABLE_ROLES)[number])) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Cannot rebind menus for this role');
      }
      const body = parseBody(putRoleMenusSchema, await c.req.json());
      const repo = resolveMenuRepo(c.env, options.menuRepo);
      const menuIds = await repo.setRoleMenus(role, body.menuIds);
      return c.json({ role, menuIds });
    },
  );

  return routes;
}
