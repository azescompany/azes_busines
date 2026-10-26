/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/platformModules.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Platform module registry + org assignment (TAGET M2)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { requireAuth, requirePermission, type AuthedEnv } from '../auth/requireAuth.js';
import { nowSec } from '../auth/tokens.js';
import { createDb } from '../db/client.js';
import { moduleMenus, organizationModules, platformModules } from '../db/schema.js';
import { ApiHttpError } from '../errors.js';

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const putOrgModulesSchema = z.object({
  moduleIds: z.array(z.string().min(1)),
});

export function createModuleRoutes() {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/modules', requireAuth(), requirePermission('org.manage_all'), async (c) => {
    if (!c.env.DB) {
      return c.json({
        items: [
          {
            id: 'pmod-admin-core',
            code: 'admin-core',
            name: 'Admin Core',
            version: '1.0.0',
            status: 'active',
          },
          { id: 'pmod-crm', code: 'crm', name: 'CRM', version: '1.0.0', status: 'active' },
        ],
      });
    }
    const db = createDb(c.env.DB);
    const rows = await db.select().from(platformModules).all();
    return c.json({
      items: rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        version: r.version,
        status: r.status,
      })),
    });
  });

  routes.get(
    '/api/v1/orgs/:orgId/modules',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const orgId = c.req.param('orgId');
      if (!c.env.DB) {
        return c.json({ orgId, moduleIds: ['pmod-admin-core'] });
      }
      const db = createDb(c.env.DB);
      const rows = await db
        .select()
        .from(organizationModules)
        .where(eq(organizationModules.orgId, orgId))
        .all();
      return c.json({
        orgId,
        moduleIds: rows.filter((r) => r.status === 'active').map((r) => r.moduleId),
      });
    },
  );

  routes.put(
    '/api/v1/orgs/:orgId/modules',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const orgId = c.req.param('orgId');
      const body = parseBody(putOrgModulesSchema, await c.req.json());
      if (!c.env.DB) {
        return c.json({ orgId, moduleIds: body.moduleIds });
      }
      const db = createDb(c.env.DB);
      await db.delete(organizationModules).where(eq(organizationModules.orgId, orgId)).run();
      const now = nowSec();
      for (const moduleId of body.moduleIds) {
        await db
          .insert(organizationModules)
          .values({
            orgId,
            moduleId,
            status: 'active',
            createdAt: now,
          })
          .run();
      }
      return c.json({ orgId, moduleIds: body.moduleIds });
    },
  );

  routes.get(
    '/api/v1/modules/:moduleId/menus',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const moduleId = c.req.param('moduleId');
      if (!c.env.DB) {
        return c.json({ moduleId, menuIds: [] });
      }
      const db = createDb(c.env.DB);
      const rows = await db
        .select()
        .from(moduleMenus)
        .where(eq(moduleMenus.moduleId, moduleId))
        .all();
      return c.json({ moduleId, menuIds: rows.map((r) => r.menuId) });
    },
  );

  return routes;
}
