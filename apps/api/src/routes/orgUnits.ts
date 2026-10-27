/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/orgUnits.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Organization Unit HTTP APIs (AC-D02 A / Phase 03)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { getAuthUser, requireAuth, type AuthedEnv } from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import {
  createDrizzleTenantRepository,
  createMemoryTenantRepository,
  type TenantRepository,
} from '../org/tenantRepository.js';
import {
  createDrizzleUnitRepository,
  createMemoryUnitRepository,
  type UnitRepository,
} from '../org/unitRepository.js';
import {
  createOrganizationUnit,
  getOrganizationUnit,
  listOrganizationUnits,
  listUnitMemberships,
  removeUnitMembership,
  updateOrganizationUnit,
  upsertUnitMembership,
} from '../org/unitService.js';

export type CreateOrgUnitRoutesOptions = {
  tenantRepo?: TenantRepository;
  unitRepo?: UnitRepository;
};

function resolveTenantRepo(env: ApiEnv, injected?: TenantRepository): TenantRepository {
  if (injected) return injected;
  if (!env.DB) return createMemoryTenantRepository();
  return createDrizzleTenantRepository(createDb(env.DB));
}

function resolveUnitRepo(env: ApiEnv, injected?: UnitRepository): UnitRepository {
  if (injected) return injected;
  if (!env.DB) return createMemoryUnitRepository();
  return createDrizzleUnitRepository(createDb(env.DB));
}

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const createUnitSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(64),
  kind: z.enum(['branch', 'department', 'team', 'other']).optional(),
  parentUnitId: z.string().min(1).nullable().optional(),
});

const patchUnitSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).max(64).optional(),
  kind: z.enum(['branch', 'department', 'team', 'other']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  parentUnitId: z.string().min(1).nullable().optional(),
});

const upsertMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['manager', 'member']).optional(),
});

export function createOrgUnitRoutes(options: CreateOrgUnitRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/orgs/:orgId/units', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const units = resolveUnitRepo(c.env, options.unitRepo);
    const items = await listOrganizationUnits(tenant, units, user, orgId);
    return c.json({ items });
  });

  routes.post('/api/v1/orgs/:orgId/units', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const body = parseBody(createUnitSchema, await c.req.json());
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const units = resolveUnitRepo(c.env, options.unitRepo);
    const created = await createOrganizationUnit(tenant, units, user, orgId, body);
    return c.json(created, 201);
  });

  routes.get('/api/v1/orgs/:orgId/units/:unitId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const unitId = c.req.param('unitId');
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const units = resolveUnitRepo(c.env, options.unitRepo);
    const unit = await getOrganizationUnit(tenant, units, user, orgId, unitId);
    return c.json(unit);
  });

  routes.patch('/api/v1/orgs/:orgId/units/:unitId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const unitId = c.req.param('unitId');
    const body = parseBody(patchUnitSchema, await c.req.json());
    if (
      body.name === undefined &&
      body.code === undefined &&
      body.kind === undefined &&
      body.status === undefined &&
      body.parentUnitId === undefined
    ) {
      throw new ApiHttpError(400, 'VALIDATION_ERROR', 'No fields to update');
    }
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const units = resolveUnitRepo(c.env, options.unitRepo);
    const updated = await updateOrganizationUnit(tenant, units, user, orgId, unitId, body);
    return c.json(updated);
  });

  routes.get('/api/v1/orgs/:orgId/units/:unitId/members', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const unitId = c.req.param('unitId');
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const units = resolveUnitRepo(c.env, options.unitRepo);
    const items = await listUnitMemberships(tenant, units, user, orgId, unitId);
    return c.json({ items });
  });

  routes.put('/api/v1/orgs/:orgId/units/:unitId/members', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const unitId = c.req.param('unitId');
    const body = parseBody(upsertMemberSchema, await c.req.json());
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const units = resolveUnitRepo(c.env, options.unitRepo);
    const member = await upsertUnitMembership(tenant, units, user, orgId, unitId, body);
    return c.json(member);
  });

  routes.delete('/api/v1/orgs/:orgId/units/:unitId/members/:userId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const unitId = c.req.param('unitId');
    const userId = c.req.param('userId');
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const units = resolveUnitRepo(c.env, options.unitRepo);
    const result = await removeUnitMembership(tenant, units, user, orgId, unitId, userId);
    return c.json(result);
  });

  return routes;
}
