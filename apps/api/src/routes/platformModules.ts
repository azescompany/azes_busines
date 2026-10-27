/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/platformModules.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Platform module registry + org assignment (TAGET M2 / Phase 04)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import {
  createDrizzleEntitlementRepository,
  createMemoryEntitlementRepository,
  type EntitlementRepository,
} from '../access/entitlementRepository.js';
import {
  getAuthUser,
  requireAuth,
  requirePermission,
  type AuthedEnv,
} from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import { moduleMenus } from '../db/schema.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { writeAuditLog } from '../org/writeAuditLog.js';

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

export type CreateModuleRoutesOptions = {
  entitlementRepo?: EntitlementRepository;
};

function resolveEntitlementRepo(
  env: ApiEnv,
  cRepo: EntitlementRepository | null | undefined,
  injected?: EntitlementRepository,
): EntitlementRepository {
  if (injected) return injected;
  if (cRepo) return cRepo;
  if (!env.DB) return createMemoryEntitlementRepository();
  return createDrizzleEntitlementRepository(createDb(env.DB));
}

/**
 * Module registry + org assignment.
 * PUT remains `org.manage_all` (AC-D01 A — GeneralAdmin = capability set later).
 * Soft-disable: removing a module sets status=disabled; does not delete business rows.
 */
export function createModuleRoutes(options: CreateModuleRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/modules', requireAuth(), requirePermission('org.manage_all'), async (c) => {
    const repo = resolveEntitlementRepo(c.env, c.get('entitlementRepo'), options.entitlementRepo);
    const items = await repo.listPlatformModules();
    return c.json({ items });
  });

  routes.get(
    '/api/v1/orgs/:orgId/modules',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const orgId = c.req.param('orgId');
      const repo = resolveEntitlementRepo(c.env, c.get('entitlementRepo'), options.entitlementRepo);
      const codes = await repo.listActiveModuleCodes(orgId);
      const platform = await repo.listPlatformModules();
      const byCode = new Map(platform.map((p) => [p.code, p.id]));
      const moduleIds = codes.map((code) => byCode.get(code)).filter((id): id is string => !!id);
      return c.json({ orgId, moduleIds });
    },
  );

  routes.put(
    '/api/v1/orgs/:orgId/modules',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const orgId = c.req.param('orgId');
      const body = parseBody(putOrgModulesSchema, await c.req.json());
      const repo = resolveEntitlementRepo(c.env, c.get('entitlementRepo'), options.entitlementRepo);
      const moduleIds = await repo.setOrgModules(orgId, body.moduleIds);
      const actor = getAuthUser(c);
      await writeAuditLog(c.env, {
        actorUserId: actor.sub,
        orgId,
        action: 'org.modules.update',
        targetType: 'organization',
        targetId: orgId,
        meta: { moduleIds },
      });
      return c.json({ orgId, moduleIds });
    },
  );

  routes.get(
    '/api/v1/modules/:moduleId/menus',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const moduleId = c.req.param('moduleId');
      if (!c.env.DB) {
        return c.json({
          moduleId,
          menuIds: moduleId === 'pmod-crm' ? ['menu-admin-customers'] : [],
        });
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
