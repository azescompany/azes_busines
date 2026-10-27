/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/platformUsers.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: POST/GET /api/v1/users — SuperAdmin + orgAdmin create
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { claimHasPermission } from '../auth/permissions.js';
import {
  getAuthUser,
  requireAuth,
  requirePermission,
  type AuthedEnv,
} from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import {
  createDrizzlePlatformUserRepository,
  createMemoryPlatformUserRepository,
  type PlatformUserRepository,
} from '../org/platformUsers.js';
import {
  createDrizzleTenantRepository,
  createMemoryTenantRepository,
  type TenantRepository,
} from '../org/tenantRepository.js';
import { writeAuditLog } from '../org/writeAuditLog.js';

export type CreatePlatformUserRoutesOptions = {
  platformUserRepo?: PlatformUserRepository;
  tenantRepo?: TenantRepository;
};

function resolveUsers(env: ApiEnv, injected?: PlatformUserRepository): PlatformUserRepository {
  if (injected) return injected;
  if (!env.DB) return createMemoryPlatformUserRepository();
  return createDrizzlePlatformUserRepository(createDb(env.DB));
}

function resolveTenant(env: ApiEnv, injected?: TenantRepository): TenantRepository {
  if (injected) return injected;
  if (!env.DB) return createMemoryTenantRepository();
  return createDrizzleTenantRepository(createDb(env.DB));
}

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  orgId: z.string().min(1),
  roleName: z.string().min(1).optional(),
});

export function createPlatformUserRoutes(options: CreatePlatformUserRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/users', requireAuth(), requirePermission('org.manage'), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.query('orgId')?.trim();
    const repo = resolveUsers(c.env, options.platformUserRepo);

    if (claimHasPermission(user, 'org.manage_all')) {
      return c.json({ items: await repo.list(orgId ? { orgId } : undefined) });
    }

    const tenant = resolveTenant(c.env, options.tenantRepo);
    const memberships = await tenant.listMembershipsForUser(user.sub);
    const allowed = new Set(memberships.map((m) => m.orgId));
    if (orgId) {
      if (!allowed.has(orgId)) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'Not a member of organization');
      }
      return c.json({ items: await repo.list({ orgId }) });
    }
    const items = (await repo.list()).filter((u) => allowed.has(u.orgId));
    return c.json({ items });
  });

  routes.post('/api/v1/users', requireAuth(), requirePermission('org.manage'), async (c) => {
    const actor = getAuthUser(c);
    const body = parseBody(createUserSchema, await c.req.json());
    const repo = resolveUsers(c.env, options.platformUserRepo);
    const isSuper = claimHasPermission(actor, 'org.manage_all');

    let roleName = body.roleName?.trim() || 'member';
    if (!isSuper) {
      // orgAdmin may only create member users.
      roleName = 'member';
      const tenant = resolveTenant(c.env, options.tenantRepo);
      const memberships = await tenant.listMembershipsForUser(actor.sub);
      const allowed = new Set(memberships.map((m) => m.orgId));
      if (actor.orgId) allowed.add(actor.orgId);
      if (!allowed.has(body.orgId)) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'Not a member of organization');
      }
    }

    const created = await repo.create({
      username: body.username,
      password: body.password,
      orgId: body.orgId,
      roleName,
    });

    await writeAuditLog(c.env, {
      actorUserId: actor.sub,
      orgId: body.orgId,
      action: 'user.create',
      targetType: 'user',
      targetId: created.id,
      meta: { roleName },
    });

    return c.json(created, 201);
  });

  return routes;
}
