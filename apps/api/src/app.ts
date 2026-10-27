/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/app.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-27
 * ║ Purpose: Hono application — CORS + auth + LMS routes + JSON errors
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';

import {
  createDrizzleEntitlementRepository,
  createMemoryEntitlementRepository,
  type EntitlementRepository,
} from './access/entitlementRepository.js';
import { initResolverModeFromEnv } from './access/effectiveAccess.js';
import type { RateLimitStore } from './auth/rateLimit.js';
import type { AuthRepository } from './auth/repository.js';
import { createCorsMiddleware } from './cors.js';
import type { ApiEnv } from './env.js';
import { toErrorBody } from './errors.js';
import type { LmsMutations } from './lms/mutations.js';
import type { LmsRepository } from './lms/repository.js';
import type { DashboardService } from './lms/dashboardService.js';
import type { QuizService } from './lms/quizService.js';
import type { OrgAdminRepository } from './org/orgAdmins.js';
import type { OrgRepository } from './org/repository.js';
import type { TenantRepository } from './org/tenantRepository.js';
import type { UnitRepository } from './org/unitRepository.js';
import type { PlatformOverviewDto } from './org/types.js';
import { createDb } from './db/client.js';
import type { MenuRepository } from './menu/repository.js';
import { createDrizzleMenuRepository, createMemoryMenuRepository } from './menu/repository.js';
import { createAuthRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { createLmsDashboardRoutes } from './routes/lmsDashboard.js';
import { createLmsRoutes } from './routes/lms.js';
import { createLmsManageRoutes } from './routes/lmsManage.js';
import { createLmsQuizRoutes } from './routes/lmsQuiz.js';
import { createMenuRoutes } from './routes/menu.js';
import { createModuleRoutes } from './routes/platformModules.js';
import { createOrgRoutes } from './routes/org.js';
import { createOrgUnitRoutes } from './routes/orgUnits.js';
import { createTenantRoutes } from './routes/tenant.js';
import { createAccessRoutes } from './routes/userAccess.js';
import { createAuditRoutes } from './routes/auditLogs.js';
import { createCrmRoutes } from './routes/crmCustomers.js';
import { createPlatformRoleRoutes } from './routes/platformRoles.js';
import { createPlatformUserRoutes } from './routes/platformUsers.js';
import type { PlatformRoleRepository } from './org/platformRoles.js';
import type { PlatformUserRepository } from './org/platformUsers.js';

export type CreateAppOptions = {
  /** Injected for unit tests (avoids D1). */
  authRepo?: AuthRepository;
  /** Injected rate-limit store for unit tests. */
  rateLimitStore?: RateLimitStore;
  /** Injected LMS repository for unit tests. */
  lmsRepo?: LmsRepository;
  /** Injected LMS mutations for unit tests. */
  lmsMutations?: LmsMutations;
  /** Injected quiz/assignment service for unit tests. */
  quizService?: QuizService;
  /** Injected dashboard/notifications/certificates service for unit tests. */
  dashboardService?: DashboardService;
  /** Injected org/track repository for unit tests. */
  orgRepo?: OrgRepository;
  /** Injected OrgAdmin admin repository for unit tests. */
  orgAdminRepo?: OrgAdminRepository;
  /** Injected tenant membership/invite repository for unit tests. */
  tenantRepo?: TenantRepository;
  /** Injected menu RBAC repository for unit tests. */
  menuRepo?: MenuRepository;
  /** Injected organization-unit repository for unit tests (Phase 03). */
  unitRepo?: UnitRepository;
  /** Injected entitlement / subscription repo (Phase 04). */
  entitlementRepo?: EntitlementRepository;
  /** Injected platform user create/list (M5.0-lite). */
  platformUserRepo?: PlatformUserRepository;
  /** Injected platform role catalog (M5.0-lite). */
  platformRoleRepo?: PlatformRoleRepository;
  /** Injected platform overview for unit tests. */
  platformOverview?: PlatformOverviewDto;
  /** Phase 06 test override — ACCESS_RESOLVER_MODE=legacy|unified (default unified). */
  accessResolverMode?: 'legacy' | 'unified';
};

export function createApp(options: CreateAppOptions = {}) {
  const app = new Hono<{
    Bindings: ApiEnv;
    Variables: {
      menuRepo?: MenuRepository | null;
      entitlementRepo?: EntitlementRepository | null;
    };
  }>();

  // Phase 06: ACCESS_RESOLVER_MODE (default unified). Tests may pass accessResolverMode.
  if (options.accessResolverMode) {
    initResolverModeFromEnv({ ACCESS_RESOLVER_MODE: options.accessResolverMode });
  }

  app.use('*', async (c, next) => {
    initResolverModeFromEnv(c.env);
    await next();
  });

  app.use('*', createCorsMiddleware());

  /** TAGET M1.6 — attach live menu repo for requirePermission. */
  app.use('*', async (c, next) => {
    const repo =
      options.menuRepo ??
      (c.env.DB ? createDrizzleMenuRepository(createDb(c.env.DB)) : createMemoryMenuRepository());
    c.set('menuRepo', repo);
    await next();
  });

  /** Phase 04 — module entitlement + subscription lite. */
  app.use('*', async (c, next) => {
    const repo =
      options.entitlementRepo ??
      (c.env.DB
        ? createDrizzleEntitlementRepository(createDb(c.env.DB))
        : createMemoryEntitlementRepository());
    c.set('entitlementRepo', repo);
    await next();
  });

  app.route('/', healthRoutes);
  app.route(
    '/',
    createAuthRoutes({
      authRepo: options.authRepo,
      rateLimitStore: options.rateLimitStore,
      menuRepo: options.menuRepo,
    }),
  );
  app.route(
    '/',
    createLmsRoutes({
      lmsRepo: options.lmsRepo,
      lmsMutations: options.lmsMutations,
      orgRepo: options.orgRepo,
    }),
  );
  app.route(
    '/',
    createLmsManageRoutes({
      lmsRepo: options.lmsRepo,
      lmsMutations: options.lmsMutations,
      rateLimitStore: options.rateLimitStore,
    }),
  );
  app.route(
    '/',
    createLmsQuizRoutes({
      quizService: options.quizService,
      lmsRepo: options.lmsRepo,
      rateLimitStore: options.rateLimitStore,
    }),
  );
  app.route(
    '/',
    createLmsDashboardRoutes({
      dashboardService: options.dashboardService,
      lmsRepo: options.lmsRepo,
      platformOverview: options.platformOverview,
    }),
  );
  app.route('/', createOrgRoutes({ orgRepo: options.orgRepo, orgAdminRepo: options.orgAdminRepo }));
  app.route(
    '/',
    createTenantRoutes({
      tenantRepo: options.tenantRepo,
      authRepo: options.authRepo,
      orgRepo: options.orgRepo,
      menuRepo: options.menuRepo,
    }),
  );
  app.route(
    '/',
    createOrgUnitRoutes({
      tenantRepo: options.tenantRepo,
      unitRepo: options.unitRepo,
    }),
  );
  app.route('/', createMenuRoutes({ menuRepo: options.menuRepo }));
  app.route('/', createModuleRoutes({ entitlementRepo: options.entitlementRepo }));
  app.route('/', createAccessRoutes({ menuRepo: options.menuRepo }));
  app.route('/', createAuditRoutes());
  app.route('/', createCrmRoutes({ unitRepo: options.unitRepo }));
  app.route(
    '/',
    createPlatformUserRoutes({
      platformUserRepo: options.platformUserRepo,
      tenantRepo: options.tenantRepo,
    }),
  );
  app.route('/', createPlatformRoleRoutes({ platformRoleRepo: options.platformRoleRepo }));

  app.notFound((c) => {
    return c.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
        },
      },
      404,
    );
  });

  app.onError((err, c) => {
    const { status, body, retryAfterSec } = toErrorBody(err);
    if (typeof retryAfterSec === 'number' && retryAfterSec > 0) {
      c.header('Retry-After', String(Math.ceil(retryAfterSec)));
    }
    return c.json(body, status);
  });

  return app;
}

export type ApiApp = ReturnType<typeof createApp>;
