/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/platformRoles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: /api/v1/platform-roles — SuperAdmin elastic role catalog
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { requireAuth, requirePermission, type AuthedEnv } from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import {
  createDrizzlePlatformRoleRepository,
  createMemoryPlatformRoleRepository,
  type PlatformRoleRepository,
} from '../org/platformRoles.js';

export type CreatePlatformRoleRoutesOptions = {
  platformRoleRepo?: PlatformRoleRepository;
};

function resolveRoles(env: ApiEnv, injected?: PlatformRoleRepository): PlatformRoleRepository {
  if (injected) return injected;
  if (!env.DB) return createMemoryPlatformRoleRepository();
  return createDrizzlePlatformRoleRepository(createDb(env.DB));
}

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const nameSchema = z.object({ name: z.string().min(2) });

export function createPlatformRoleRoutes(options: CreatePlatformRoleRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get(
    '/api/v1/platform-roles',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const repo = resolveRoles(c.env, options.platformRoleRepo);
      return c.json({ items: await repo.list() });
    },
  );

  routes.post(
    '/api/v1/platform-roles',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const body = parseBody(nameSchema, await c.req.json());
      const repo = resolveRoles(c.env, options.platformRoleRepo);
      const created = await repo.create(body.name);
      return c.json(created, 201);
    },
  );

  routes.patch(
    '/api/v1/platform-roles/:roleId',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const body = parseBody(nameSchema, await c.req.json());
      const repo = resolveRoles(c.env, options.platformRoleRepo);
      const updated = await repo.rename(c.req.param('roleId'), body.name);
      return c.json(updated);
    },
  );

  routes.delete(
    '/api/v1/platform-roles/:roleId',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const repo = resolveRoles(c.env, options.platformRoleRepo);
      await repo.remove(c.req.param('roleId'));
      return c.json({ ok: true });
    },
  );

  return routes;
}
