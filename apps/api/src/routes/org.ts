/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/org.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Organization + Track + OrgAdmin HTTP APIs
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
import { assertCanWriteTrack, assertSameOrg } from '../auth/scope.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import {
  createDrizzleOrgAdminRepository,
  createMemoryOrgAdminRepository,
  type OrgAdminRepository,
} from '../org/orgAdmins.js';
import { createDrizzleOrgRepository, type OrgRepository } from '../org/repository.js';

export type CreateOrgRoutesOptions = {
  orgRepo?: OrgRepository;
  orgAdminRepo?: OrgAdminRepository;
};

function resolveOrgRepo(env: ApiEnv, injected?: OrgRepository): OrgRepository {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleOrgRepository(createDb(env.DB));
}

function resolveOrgAdminRepo(env: ApiEnv, injected?: OrgAdminRepository): OrgAdminRepository {
  if (injected) return injected;
  if (!env.DB) {
    return createMemoryOrgAdminRepository();
  }
  return createDrizzleOrgAdminRepository(createDb(env.DB));
}

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const orgBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  parentOrganizationId: z.string().min(1).optional().nullable(),
});

const orgPatchSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['active', 'disabled']).optional(),
});

const orgAdminCreateSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  orgId: z.string().min(1),
});

const orgAdminStatusSchema = z.object({
  status: z.enum(['active', 'disabled']),
});

const trackBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  orgId: z.string().optional(),
});

const assignTracksSchema = z.object({
  trackIds: z.array(z.string().min(1)).min(1),
});

const trackCoursesSchema = z.object({
  courseIds: z.array(z.string().min(1)),
});

export function createOrgRoutes(options: CreateOrgRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/orgs', requireAuth(), requirePermission('org.manage_all'), async (c) => {
    const repo = resolveOrgRepo(c.env, options.orgRepo);
    return c.json({ items: await repo.listOrganizations() });
  });

  routes.post('/api/v1/orgs', requireAuth(), requirePermission('org.create'), async (c) => {
    const user = getAuthUser(c);
    const body = parseBody(orgBodySchema, await c.req.json());
    const repo = resolveOrgRepo(c.env, options.orgRepo);

    // Root org: superAdmin only (org.manage_all). Child: parentOrganizationId + org_multi.
    if (body.parentOrganizationId) {
      if (!claimHasPermission(user, 'org.manage_all') && !claimHasPermission(user, 'org.manage')) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
      }
      const parent = await repo.getOrganization(body.parentOrganizationId);
      if (!parent) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Parent organization not found');
      }
      if (!claimHasPermission(user, 'org.manage_all')) {
        // Non-platform: must create under active org and hold org_multi (JWT hint; live DB in M2.5+).
        if (user.orgId !== body.parentOrganizationId) {
          throw new ApiHttpError(403, 'FORBIDDEN', 'Parent must be active organization');
        }
        const multi = (user as { orgMulti?: boolean }).orgMulti;
        if (multi === false) {
          throw new ApiHttpError(
            403,
            'FORBIDDEN',
            'orgMulti required to create child organization',
          );
        }
      }
    } else if (!claimHasPermission(user, 'org.manage_all')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Only SuperAdmin can create root organizations');
    }

    const org = await repo.createOrganization({
      name: body.name,
      slug: body.slug,
      createdBy: user.sub,
      parentOrganizationId: body.parentOrganizationId ?? null,
    });
    return c.json(org, 201);
  });

  routes.patch(
    '/api/v1/orgs/:orgId',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const body = parseBody(orgPatchSchema, await c.req.json());
      if (body.name === undefined && body.status === undefined) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'No fields to update');
      }
      const repo = resolveOrgRepo(c.env, options.orgRepo);
      const org = await repo.updateOrganization(c.req.param('orgId'), body);
      return c.json(org);
    },
  );

  routes.get(
    '/api/v1/org-admins',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const orgId = c.req.query('orgId')?.trim() || undefined;
      const repo = resolveOrgAdminRepo(c.env, options.orgAdminRepo);
      return c.json({ items: await repo.list(orgId ? { orgId } : undefined) });
    },
  );

  routes.post(
    '/api/v1/org-admins',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const body = parseBody(orgAdminCreateSchema, await c.req.json());
      const repo = resolveOrgAdminRepo(c.env, options.orgAdminRepo);
      const created = await repo.create(body);
      return c.json(created, 201);
    },
  );

  routes.patch(
    '/api/v1/org-admins/:userId',
    requireAuth(),
    requirePermission('org.manage_all'),
    async (c) => {
      const body = parseBody(orgAdminStatusSchema, await c.req.json());
      const repo = resolveOrgAdminRepo(c.env, options.orgAdminRepo);
      const updated = await repo.setStatus(c.req.param('userId'), body.status);
      return c.json(updated);
    },
  );

  routes.get('/api/v1/tracks', requireAuth(), requirePermission('track.write'), async (c) => {
    const user = getAuthUser(c);
    const orgId = c.req.query('orgId') ?? user.orgId ?? null;
    const repo = resolveOrgRepo(c.env, options.orgRepo);

    // superAdmin (org.manage_all) may omit orgId → platform-wide list.
    if (!orgId) {
      if (!claimHasPermission(user, 'org.manage_all')) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'orgId is required');
      }
      return c.json({ items: await repo.listAllTracks() });
    }

    if (!claimHasPermission(user, 'org.manage_all')) {
      assertSameOrg(user, orgId);
    }
    let items = await repo.listTracks(orgId);
    if (!claimHasPermission(user, 'org.manage') && !claimHasPermission(user, 'org.manage_all')) {
      items = items.filter((t) => t.createdBy === user.sub);
    }
    return c.json({ items });
  });

  routes.post('/api/v1/tracks', requireAuth(), requirePermission('track.write'), async (c) => {
    const user = getAuthUser(c);
    const body = parseBody(trackBodySchema, await c.req.json());
    const orgId = body.orgId ?? user.orgId;
    if (!orgId) {
      throw new ApiHttpError(400, 'VALIDATION_ERROR', 'orgId is required');
    }
    if (!claimHasPermission(user, 'org.manage_all')) {
      assertSameOrg(user, orgId);
    }
    const repo = resolveOrgRepo(c.env, options.orgRepo);
    const track = await repo.createTrack({
      orgId,
      name: body.name,
      slug: body.slug,
      description: body.description,
      createdBy: user.sub,
    });
    return c.json(track, 201);
  });

  routes.put(
    '/api/v1/tracks/:trackId/courses',
    requireAuth(),
    requirePermission('track.write'),
    async (c) => {
      const user = getAuthUser(c);
      const repo = resolveOrgRepo(c.env, options.orgRepo);
      const track = await repo.getTrack(c.req.param('trackId'));
      if (!track) throw new ApiHttpError(404, 'NOT_FOUND', 'Track not found');
      assertCanWriteTrack(user, track);
      const body = parseBody(trackCoursesSchema, await c.req.json());
      await repo.setTrackCourses(track.id, body.courseIds);
      return c.json({ ok: true });
    },
  );

  routes.put(
    '/api/v1/users/:userId/tracks',
    requireAuth(),
    requirePermission('track.assign'),
    async (c) => {
      const user = getAuthUser(c);
      const body = parseBody(assignTracksSchema, await c.req.json());
      const targetUserId = c.req.param('userId');
      const repo = resolveOrgRepo(c.env, options.orgRepo);
      for (const trackId of body.trackIds) {
        const track = await repo.getTrack(trackId);
        if (!track) throw new ApiHttpError(404, 'NOT_FOUND', 'Track not found');
        assertCanWriteTrack(user, track);
      }
      await repo.assignUserTracks({
        userId: targetUserId,
        trackIds: body.trackIds,
        assignedBy: user.sub,
      });
      return c.json({ ok: true });
    },
  );

  routes.get('/api/v1/me/tracks', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveOrgRepo(c.env, options.orgRepo);
    const items = await repo.listActiveTracksForUser(user.sub);
    return c.json({ items });
  });

  return routes;
}
