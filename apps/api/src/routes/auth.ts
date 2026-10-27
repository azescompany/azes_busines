/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/auth.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: Phase 2B/2E/2F auth HTTP routes (login / refresh / logout / me)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { requireJwtAccessSecret } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { normalizeUsername } from '../auth/password.js';
import {
  clientIpFromHeaders,
  enforceRateLimit,
  LOGIN_IP_LIMIT,
  LOGIN_IP_WINDOW_SEC,
  LOGIN_USER_LIMIT,
  LOGIN_USER_WINDOW_SEC,
  loginIpKey,
  loginUserKey,
  REFRESH_IP_LIMIT,
  REFRESH_IP_WINDOW_SEC,
  refreshIpKey,
  resolveRateLimitStore,
  type RateLimitStore,
} from '../auth/rateLimit.js';
import { createDrizzleAuthRepository, type AuthRepository } from '../auth/repository.js';
import {
  getMeFromAccessToken,
  loginWithPassword,
  logoutSession,
  refreshTokens,
} from '../auth/service.js';
import type { EntitlementRepository } from '../access/entitlementRepository.js';
import {
  createDrizzleMenuRepository,
  createMemoryMenuRepository,
  type MenuRepository,
} from '../menu/repository.js';

export type AuthRouteEnv = {
  Bindings: ApiEnv;
  Variables: {
    authRepo: AuthRepository;
    entitlementRepo?: EntitlementRepository | null;
  };
};

const loginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  deviceId: z.string().min(1),
  userAgent: z.string().min(1),
  platform: z.string().min(1),
  language: z.string().min(1),
});

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
  deviceId: z.string().min(1),
});

const logoutBodySchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .optional();

function parseJsonBody(schema: z.ZodTypeAny, raw: unknown) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

function resolveAuthRepo(c: {
  env: ApiEnv;
  get: (key: 'authRepo') => AuthRepository | undefined;
}): AuthRepository {
  const injected = c.get('authRepo');
  if (injected) {
    return injected;
  }
  if (!c.env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleAuthRepository(createDb(c.env.DB));
}

function resolveMenuRepo(env: ApiEnv, injected?: MenuRepository): MenuRepository {
  if (injected) return injected;
  if (!env.DB) return createMemoryMenuRepository();
  return createDrizzleMenuRepository(createDb(env.DB));
}

export function createAuthRoutes(options?: {
  authRepo?: AuthRepository;
  rateLimitStore?: RateLimitStore;
  menuRepo?: MenuRepository;
}) {
  const routes = new Hono<AuthRouteEnv>();

  routes.use('*', async (c, next) => {
    if (options?.authRepo) {
      c.set('authRepo', options.authRepo);
    }
    await next();
  });

  routes.get('/api/v1/me', async (c) => {
    const jwtSecret = requireJwtAccessSecret(c.env);
    const authHeader = c.req.header('authorization') ?? '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!bearer) {
      throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Access token is required');
    }
    const repo = options?.authRepo ?? resolveAuthRepo(c);
    const menuRepo = resolveMenuRepo(c.env, options?.menuRepo);
    const entitlementRepo = c.get('entitlementRepo');
    const result = await getMeFromAccessToken(repo, jwtSecret, bearer, menuRepo, entitlementRepo);
    return c.json(result, 200);
  });

  routes.post('/api/v1/auth/login', async (c) => {
    const jwtSecret = requireJwtAccessSecret(c.env);
    const store = resolveRateLimitStore(c.env, options?.rateLimitStore);
    const ip = clientIpFromHeaders(c.req.raw.headers);

    if (store) {
      await enforceRateLimit(store, loginIpKey(ip), LOGIN_IP_WINDOW_SEC, LOGIN_IP_LIMIT);
    }

    const body = parseJsonBody(loginBodySchema, await c.req.json());

    if (store) {
      const userKey = loginUserKey(normalizeUsername(body.username));
      await enforceRateLimit(store, userKey, LOGIN_USER_WINDOW_SEC, LOGIN_USER_LIMIT);
    }

    const repo = options?.authRepo ?? resolveAuthRepo(c);
    const menuRepo = resolveMenuRepo(c.env, options?.menuRepo);
    const entitlementRepo = c.get('entitlementRepo');
    const result = await loginWithPassword(repo, jwtSecret, body, menuRepo, entitlementRepo);
    return c.json(result, 200);
  });

  routes.post('/api/v1/auth/refresh', async (c) => {
    const jwtSecret = requireJwtAccessSecret(c.env);
    const store = resolveRateLimitStore(c.env, options?.rateLimitStore);
    const ip = clientIpFromHeaders(c.req.raw.headers);

    if (store) {
      await enforceRateLimit(store, refreshIpKey(ip), REFRESH_IP_WINDOW_SEC, REFRESH_IP_LIMIT);
    }

    const body = parseJsonBody(refreshBodySchema, await c.req.json());
    const repo = options?.authRepo ?? resolveAuthRepo(c);
    const menuRepo = resolveMenuRepo(c.env, options?.menuRepo);
    const entitlementRepo = c.get('entitlementRepo');
    const result = await refreshTokens(repo, jwtSecret, body, menuRepo, entitlementRepo);
    return c.json(result, 200);
  });

  routes.post('/api/v1/auth/logout', async (c) => {
    const jwtSecret = requireJwtAccessSecret(c.env);
    let body: { refreshToken?: string } = {};
    const contentType = c.req.header('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const raw = await c.req.json().catch(() => ({}));
      body = parseJsonBody(logoutBodySchema, raw) ?? {};
    }

    const authHeader = c.req.header('authorization') ?? '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;

    const repo = options?.authRepo ?? resolveAuthRepo(c);
    const result = await logoutSession(repo, jwtSecret, {
      refreshToken: body.refreshToken,
      accessToken: bearer,
    });
    return c.json(result, 200);
  });

  return routes;
}
