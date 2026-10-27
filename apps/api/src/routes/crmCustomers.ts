/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/crmCustomers.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: CRM customers CRUD — tenant + permission scoped (TAGET M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import {
  isOwnerVisible,
  isOwnerVisibleInUnitSubtree,
  normalizeDataScope,
} from '../auth/dataScope.js';
import {
  getAuthUser,
  requireAuth,
  requirePermission,
  type AuthedEnv,
} from '../auth/requireAuth.js';
import { newId, nowSec } from '../auth/tokens.js';
import { createDb } from '../db/client.js';
import { crmCustomers, organizationMemberships } from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import {
  createDrizzleUnitRepository,
  createMemoryUnitRepository,
  type UnitRepository,
} from '../org/unitRepository.js';
import { writeAuditLog } from '../org/writeAuditLog.js';

export type CreateCrmRoutesOptions = {
  unitRepo?: UnitRepository;
};

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
});

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  status: z.enum(['active', 'disabled']).optional(),
});

export function createCrmRoutes(options: CreateCrmRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  function resolveUnitRepo(env: AuthedEnv['Bindings']): UnitRepository {
    if (options.unitRepo) return options.unitRepo;
    if (!env.DB) return createMemoryUnitRepository();
    return createDrizzleUnitRepository(createDb(env.DB));
  }

  routes.get(
    '/api/v1/crm/customers',
    requireAuth(),
    requirePermission('crm.customers.read'),
    async (c) => {
      const user = getAuthUser(c);
      if (!user.orgId) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Active organization required');
      }
      if (!c.env.DB) {
        return c.json({ items: [], dataScope: 'org' });
      }
      const db = createDb(c.env.DB);
      const membership = await db
        .select()
        .from(organizationMemberships)
        .where(
          and(
            eq(organizationMemberships.orgId, user.orgId),
            eq(organizationMemberships.userId, user.sub),
          ),
        )
        .get();
      const scope = normalizeDataScope(membership?.dataScope);
      const rows = await db
        .select()
        .from(crmCustomers)
        .where(eq(crmCustomers.orgId, user.orgId))
        .all();
      const unitRepo = resolveUnitRepo(c.env);
      const items = [];
      for (const r of rows) {
        const visible =
          scope === 'subtree'
            ? await isOwnerVisibleInUnitSubtree({
                scope,
                viewerUserId: user.sub,
                ownerUserId: r.ownerUserId,
                orgId: user.orgId,
                unitRepo,
              })
            : isOwnerVisible(scope, user.sub, r.ownerUserId);
        if (visible) items.push(r);
      }
      return c.json({
        items: items.map((r) => ({
          id: r.id,
          orgId: r.orgId,
          name: r.name,
          email: r.email,
          status: r.status,
          ownerUserId: r.ownerUserId,
        })),
        dataScope: scope,
      });
    },
  );

  routes.post(
    '/api/v1/crm/customers',
    requireAuth(),
    requirePermission('crm.customers.create'),
    async (c) => {
      const user = getAuthUser(c);
      if (!user.orgId) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Active organization required');
      }
      const body = parseBody(createSchema, await c.req.json());
      if (!c.env.DB) {
        return c.json(
          {
            id: newId(),
            orgId: user.orgId,
            name: body.name,
            email: body.email ?? null,
            status: 'active',
            ownerUserId: user.sub,
          },
          201,
        );
      }
      const db = createDb(c.env.DB);
      const now = nowSec();
      const id = newId();
      await db
        .insert(crmCustomers)
        .values({
          id,
          orgId: user.orgId,
          name: body.name,
          email: body.email ?? null,
          status: 'active',
          ownerUserId: user.sub,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      await writeAuditLog(c.env, {
        actorUserId: user.sub,
        orgId: user.orgId,
        action: 'crm.customer.create',
        targetType: 'crm_customer',
        targetId: id,
      });
      return c.json(
        {
          id,
          orgId: user.orgId,
          name: body.name,
          email: body.email ?? null,
          status: 'active',
          ownerUserId: user.sub,
        },
        201,
      );
    },
  );

  routes.patch(
    '/api/v1/crm/customers/:id',
    requireAuth(),
    requirePermission('crm.customers.update'),
    async (c) => {
      const user = getAuthUser(c);
      const id = c.req.param('id');
      const body = parseBody(patchSchema, await c.req.json());
      if (!user.orgId) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Active organization required');
      }
      if (!c.env.DB) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Customer not found');
      }
      const db = createDb(c.env.DB);
      const existing = await db.select().from(crmCustomers).where(eq(crmCustomers.id, id)).get();
      if (!existing || existing.orgId !== user.orgId) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Customer not found');
      }
      await db
        .update(crmCustomers)
        .set({
          name: body.name ?? existing.name,
          email: body.email === undefined ? existing.email : body.email,
          status: body.status ?? existing.status,
          updatedAt: nowSec(),
        })
        .where(eq(crmCustomers.id, id))
        .run();
      return c.json({ id, orgId: user.orgId, ok: true });
    },
  );

  routes.delete(
    '/api/v1/crm/customers/:id',
    requireAuth(),
    requirePermission('crm.customers.delete'),
    async (c) => {
      const user = getAuthUser(c);
      const id = c.req.param('id');
      if (!user.orgId) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Active organization required');
      }
      if (!c.env.DB) {
        return c.json({ ok: true });
      }
      const db = createDb(c.env.DB);
      const existing = await db.select().from(crmCustomers).where(eq(crmCustomers.id, id)).get();
      if (!existing || existing.orgId !== user.orgId) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Customer not found');
      }
      await db.delete(crmCustomers).where(eq(crmCustomers.id, id)).run();
      await writeAuditLog(c.env, {
        actorUserId: user.sub,
        orgId: user.orgId,
        action: 'crm.customer.delete',
        targetType: 'crm_customer',
        targetId: id,
      });
      return c.json({ ok: true });
    },
  );

  return routes;
}
