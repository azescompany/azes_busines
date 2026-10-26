/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/tenant.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Tenant membership / invite / active-org HTTP APIs
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { claimHasPermission } from '../auth/permissions.js';
import {
  createDrizzleAuthRepository,
  createMemoryAuthRepository,
  type AuthRepository,
} from '../auth/repository.js';
import {
  getAuthUser,
  requireAuth,
  type AuthedEnv,
} from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import { requireJwtAccessSecret, type ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import {
  createDrizzleMenuRepository,
  createMemoryMenuRepository,
  type MenuRepository,
} from '../menu/repository.js';
import {
  createDrizzleTenantRepository,
  createMemoryTenantRepository,
  type TenantRepository,
} from '../org/tenantRepository.js';
import {
  acceptInvitation,
  assertCanManageOrg,
  createOrgInvitation,
  listMyOrganizations,
  listOrgInvitations,
  listOrgMembers,
  setActiveOrganization,
  updateOrgMember,
} from '../org/tenantService.js';
import { createDrizzleOrgRepository, type OrgRepository } from '../org/repository.js';

export type CreateTenantRoutesOptions = {
  tenantRepo?: TenantRepository;
  authRepo?: AuthRepository;
  orgRepo?: OrgRepository;
  menuRepo?: MenuRepository;
};

function resolveTenantRepo(env: ApiEnv, injected?: TenantRepository): TenantRepository {
  if (injected) return injected;
  if (!env.DB) {
    return createMemoryTenantRepository();
  }
  return createDrizzleTenantRepository(createDb(env.DB));
}

function resolveAuthRepo(env: ApiEnv, injected?: AuthRepository): AuthRepository {
  if (injected) return injected;
  if (!env.DB) {
    return createMemoryAuthRepository();
  }
  return createDrizzleAuthRepository(createDb(env.DB));
}

function resolveOrgRepo(env: ApiEnv, injected?: OrgRepository): OrgRepository {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleOrgRepository(createDb(env.DB));
}

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const activeOrgSchema = z.object({
  orgId: z.string().min(1),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['orgAdmin', 'instructor', 'student']),
});

const acceptInviteSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
  username: z.string().min(3).optional(),
});

const memberPatchSchema = z.object({
  role: z.enum(['orgAdmin', 'instructor', 'student', 'guest']).optional(),
  status: z.enum(['active', 'disabled', 'revoked']).optional(),
});

export function createTenantRoutes(options: CreateTenantRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/me/organizations', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const items = await listMyOrganizations(tenant, user.sub);
    return c.json({ items });
  });

  routes.post('/api/v1/me/active-organization', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const body = parseBody(activeOrgSchema, await c.req.json());
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const authRepo = resolveAuthRepo(c.env, options.authRepo);
    const menuRepo =
      options.menuRepo ??
      (c.env.DB
        ? createDrizzleMenuRepository(createDb(c.env.DB))
        : createMemoryMenuRepository());
    const result = await setActiveOrganization({
      authRepo,
      tenant,
      menuRepo,
      userId: user.sub,
      orgId: body.orgId,
      jwtSecret: requireJwtAccessSecret(c.env),
      userAgent: c.req.header('user-agent') ?? null,
    });
    return c.json(result);
  });

  routes.get('/api/v1/orgs/:orgId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const orgRepo = resolveOrgRepo(c.env, options.orgRepo);

    if (claimHasPermission(user, 'org.manage_all')) {
      const org = await orgRepo.getOrganization(orgId);
      if (!org) throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
      return c.json(org);
    }

    const membership = await tenant.getMembership(orgId, user.sub);
    if (!membership || membership.status !== 'active') {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Cross-organization access denied');
    }
    const org = await orgRepo.getOrganization(orgId);
    if (!org) throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
    return c.json(org);
  });

  routes.get('/api/v1/orgs/:orgId/members', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const items = await listOrgMembers(tenant, user, c.req.param('orgId'));
    return c.json({ items });
  });

  routes.patch('/api/v1/orgs/:orgId/members/:userId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const body = parseBody(memberPatchSchema, await c.req.json());
    if (body.role === undefined && body.status === undefined) {
      throw new ApiHttpError(400, 'VALIDATION_ERROR', 'No fields to update');
    }
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const updated = await updateOrgMember(
      tenant,
      user,
      c.req.param('orgId'),
      c.req.param('userId'),
      body,
    );
    return c.json(updated);
  });

  routes.delete('/api/v1/orgs/:orgId/members/:userId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const updated = await updateOrgMember(
      tenant,
      user,
      c.req.param('orgId'),
      c.req.param('userId'),
      { status: 'revoked' },
    );
    return c.json(updated);
  });

  routes.get('/api/v1/orgs/:orgId/invitations', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const items = await listOrgInvitations(tenant, user, c.req.param('orgId'));
    return c.json({ items });
  });

  routes.post('/api/v1/orgs/:orgId/invitations', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const body = parseBody(inviteSchema, await c.req.json());
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const created = await createOrgInvitation({
      tenant,
      actor: user,
      orgId: c.req.param('orgId'),
      email: body.email,
      role: body.role,
    });
    return c.json(created, 201);
  });

  routes.post('/api/v1/invitations/accept', async (c) => {
    const body = parseBody(acceptInviteSchema, await c.req.json());
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    const authRepo = resolveAuthRepo(c.env, options.authRepo);
    const result = await acceptInvitation({
      authRepo,
      tenant,
      token: body.token,
      password: body.password,
      username: body.username,
      jwtSecret: requireJwtAccessSecret(c.env),
      userAgent: c.req.header('user-agent') ?? null,
    });
    return c.json(result, 201);
  });

  // Soften org patch for OrgAdmin (own org name only) — registered here to avoid
  // colliding with SuperAdmin-only patch when tenant routes mount alongside org routes.
  routes.patch('/api/v1/orgs/:orgId/profile', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.param('orgId');
    const tenant = resolveTenantRepo(c.env, options.tenantRepo);
    await assertCanManageOrg(tenant, user, orgId);
    const body = parseBody(
      z.object({ name: z.string().min(1).optional() }),
      await c.req.json(),
    );
    if (!body.name) {
      throw new ApiHttpError(400, 'VALIDATION_ERROR', 'No fields to update');
    }
    const orgRepo = resolveOrgRepo(c.env, options.orgRepo);
    const org = await orgRepo.updateOrganization(orgId, { name: body.name });
    return c.json(org);
  });

  return routes;
}
