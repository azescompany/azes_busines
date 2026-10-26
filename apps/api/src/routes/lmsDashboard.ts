/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/lmsDashboard.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Dashboard / notifications / certificates / analytics routes (M7)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';

import { can, normalizeRoles } from '../auth/permissions.js';
import { getAuthUser, requireAuth, type AuthedEnv } from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { createDrizzleDashboardService, type DashboardService } from '../lms/dashboardService.js';
import { createDrizzleLmsRepository, type LmsRepository } from '../lms/repository.js';
import { emptyPlatformOverview, getPlatformOverview } from '../org/platformOverview.js';
import type { PlatformOverviewDto } from '../org/types.js';

export type CreateLmsDashboardRoutesOptions = {
  dashboardService?: DashboardService;
  lmsRepo?: LmsRepository;
  platformOverview?: PlatformOverviewDto;
};

function resolveRepo(env: ApiEnv, injected?: LmsRepository): LmsRepository {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleLmsRepository(createDb(env.DB));
}

function resolveDashboard(
  env: ApiEnv,
  injected?: DashboardService,
  repo?: LmsRepository,
): DashboardService {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  const db = createDb(env.DB);
  return createDrizzleDashboardService(db, repo ?? createDrizzleLmsRepository(db));
}

export function createLmsDashboardRoutes(options: CreateLmsDashboardRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/me/dashboard', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'progress.read_own') && !can(user.roles, 'course.learn')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json(await dash.getDashboard(user.sub));
  });

  routes.get('/api/v1/me/notifications', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json({ items: await dash.listNotifications(user.sub) });
  });

  routes.post('/api/v1/me/notifications/:id/read', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json(await dash.markNotificationRead(user.sub, c.req.param('id')));
  });

  routes.post('/api/v1/me/notifications/read-all', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json(await dash.markAllNotificationsRead(user.sub));
  });

  routes.get('/api/v1/me/bookmarks', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json({ items: await dash.listBookmarks(user.sub) });
  });

  routes.post('/api/v1/me/bookmarks/:courseId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json(await dash.addBookmark(user.sub, c.req.param('courseId')), 201);
  });

  routes.delete('/api/v1/me/bookmarks/:courseId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    await dash.removeBookmark(user.sub, c.req.param('courseId'));
    return c.body(null, 204);
  });

  routes.get('/api/v1/me/certificates', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json({ items: await dash.listCertificates(user.sub) });
  });

  routes.post('/api/v1/courses/:courseId/certificate', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.learn')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    return c.json(await dash.issueCertificate(user.sub, c.req.param('courseId')), 201);
  });

  routes.get('/api/v1/certificates/verify/:code', async (c) => {
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    const cert = await dash.verifyCertificate(c.req.param('code'));
    if (!cert) throw new ApiHttpError(404, 'NOT_FOUND', 'Certificate not found');
    return c.json(cert);
  });

  routes.get('/api/v1/manage/analytics', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'analytics.read')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const repo = resolveRepo(c.env, options.lmsRepo);
    const dash = resolveDashboard(c.env, options.dashboardService, repo);
    const roles = normalizeRoles(user.roles);
    if (can(user.roles, 'org.manage_all')) {
      return c.json(await dash.getAnalytics({ allOrgs: true }));
    }
    if (roles.includes('orgAdmin')) {
      return c.json(await dash.getAnalytics({ orgId: user.orgId ?? null }));
    }
    return c.json(await dash.getAnalytics({ ownerId: user.sub }));
  });

  routes.get('/api/v1/manage/platform-overview', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'org.manage_all') || !can(user.roles, 'analytics.read')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    if (options.platformOverview) {
      return c.json(options.platformOverview);
    }
    if (!c.env.DB) {
      return c.json(emptyPlatformOverview());
    }
    return c.json(await getPlatformOverview(createDb(c.env.DB)));
  });

  return routes;
}
