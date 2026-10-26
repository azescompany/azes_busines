/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/auth.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Phase 2B/2E auth route tests (memory AuthRepository)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createRefreshSecret, hashRefreshToken, newId, nowSec } from '../src/auth/tokens.js';
import type { ApiEnv } from '../src/env.js';
import { ACCESS_TOKEN_TTL_SEC } from '../src/auth/types.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';

const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-test-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('auth routes', () => {
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
  });

  function repoWithUser(status: 'active' | 'disabled' | 'pending' = 'active') {
    return createMemoryAuthRepository({
      users: [
        {
          id: 'user-local-1',
          usernameNormalized: 'local.dev',
          passwordHash,
          status,
          orgId: null,
        },
      ],
      rolesByUser: {
        'user-local-1': ['member'],
      },
    });
  }

  function appWithUser(status: 'active' | 'disabled' | 'pending' = 'active') {
    return createApp({ authRepo: repoWithUser(status) });
  }

  async function login(app: ReturnType<typeof createApp>) {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    return (await res.json()) as { accessToken: string; refreshToken: string };
  }

  async function refresh(app: ReturnType<typeof createApp>, refreshToken: string) {
    return app.request(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          refreshToken,
          deviceId: deviceBody.deviceId,
        }),
      },
      testEnv,
    );
  }

  it('POST /api/v1/auth/login returns token pair for active user', async () => {
    const app = appWithUser('active');
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'Local.Dev',
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
    };
    expect(json.tokenType).toBe('Bearer');
    expect(json.expiresIn).toBe(ACCESS_TOKEN_TTL_SEC);
    expect(json.accessToken.length).toBeGreaterThan(20);
    expect(json.refreshToken.length).toBeGreaterThan(20);
  });

  it('POST /api/v1/auth/login rejects bad password', async () => {
    const app = appWithUser();
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'wrong',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      },
    });
  });

  it('POST /api/v1/auth/login rejects disabled account', async () => {
    const app = appWithUser('disabled');
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: 'ACCOUNT_DISABLED' },
    });
  });

  it('refresh rotates tokens; old refresh is revoked', async () => {
    const app = appWithUser();
    const loginRes = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    const loginJson = (await loginRes.json()) as {
      refreshToken: string;
      accessToken: string;
    };

    const refreshRes = await app.request(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginJson.refreshToken,
          deviceId: deviceBody.deviceId,
        }),
      },
      testEnv,
    );
    expect(refreshRes.status).toBe(200);
    const refreshed = (await refreshRes.json()) as {
      refreshToken: string;
      accessToken: string;
    };
    expect(refreshed.refreshToken).not.toBe(loginJson.refreshToken);

    const reuse = await app.request(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginJson.refreshToken,
          deviceId: deviceBody.deviceId,
        }),
      },
      testEnv,
    );
    expect(reuse.status).toBe(401);
    await expect(reuse.json()).resolves.toMatchObject({
      error: { code: 'TOKEN_REVOKED' },
    });
  });

  it('logout with refreshToken revokes session', async () => {
    const app = appWithUser();
    const loginRes = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    const loginJson = (await loginRes.json()) as { refreshToken: string };

    const logoutRes = await app.request(
      '/api/v1/auth/logout',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: loginJson.refreshToken }),
      },
      testEnv,
    );
    expect(logoutRes.status).toBe(200);
    await expect(logoutRes.json()).resolves.toEqual({ ok: true });

    const refreshRes = await app.request(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginJson.refreshToken,
          deviceId: deviceBody.deviceId,
        }),
      },
      testEnv,
    );
    expect(refreshRes.status).toBe(401);
  });

  it('logout with Bearer access token succeeds', async () => {
    const app = appWithUser();
    const loginRes = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    const loginJson = (await loginRes.json()) as {
      accessToken: string;
      refreshToken: string;
    };

    const logoutRes = await app.request(
      '/api/v1/auth/logout',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${loginJson.accessToken}`,
        },
      },
      testEnv,
    );
    expect(logoutRes.status).toBe(200);

    const refreshRes = await app.request(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginJson.refreshToken,
          deviceId: deviceBody.deviceId,
        }),
      },
      testEnv,
    );
    expect(refreshRes.status).toBe(401);
  });

  it('login validation error for missing fields', async () => {
    const app = appWithUser();
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'x' }),
      },
      testEnv,
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('refresh of expired session returns TOKEN_EXPIRED', async () => {
    const repo = repoWithUser();
    const app = createApp({ authRepo: repo });
    const secret = createRefreshSecret();
    const tokenHash = await hashRefreshToken(secret);
    const past = nowSec() - 60;
    await repo.createRefreshSession({
      id: newId(),
      userId: 'user-local-1',
      tokenHash,
      expiresAt: past,
      createdAt: past - 100,
      userAgent: 'vitest',
    });

    const res = await refresh(app, secret);
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: 'TOKEN_EXPIRED' },
    });
  });

  it('parallel refresh of the same token allows at most one success', async () => {
    const app = appWithUser();
    const { refreshToken } = await login(app);

    const [a, b] = await Promise.all([refresh(app, refreshToken), refresh(app, refreshToken)]);
    const statuses = [a.status, b.status].sort((x, y) => x - y);
    expect(statuses).toEqual([200, 401]);
  });

  it('GET /api/v1/me returns identity for valid access token', async () => {
    const app = appWithUser();
    const { accessToken } = await login(app);
    const res = await app.request(
      '/api/v1/me',
      {
        method: 'GET',
        headers: { authorization: `Bearer ${accessToken}` },
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      userId: 'user-local-1',
      username: 'local.dev',
      roles: ['member'],
      role: 'member',
      orgId: null,
      permissions: [],
      nav: [{ id: 'overview', path: '/', i18nKey: 'nav.overview' }],
      activeTracks: [],
      status: 'active',
    });
  });

  it('GET /api/v1/me rejects missing or invalid Bearer token', async () => {
    const app = appWithUser();
    const missing = await app.request('/api/v1/me', { method: 'GET' }, testEnv);
    expect(missing.status).toBe(401);

    const bad = await app.request(
      '/api/v1/me',
      {
        method: 'GET',
        headers: { authorization: 'Bearer not-a-jwt' },
      },
      testEnv,
    );
    expect(bad.status).toBe(401);
    await expect(bad.json()).resolves.toMatchObject({
      error: { code: 'TOKEN_REVOKED' },
    });
  });

  it('GET /api/v1/me rejects access after logout revoked the session', async () => {
    const app = appWithUser();
    const { accessToken, refreshToken } = await login(app);
    await app.request(
      '/api/v1/auth/logout',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
      testEnv,
    );
    const res = await app.request(
      '/api/v1/me',
      {
        method: 'GET',
        headers: { authorization: `Bearer ${accessToken}` },
      },
      testEnv,
    );
    expect(res.status).toBe(401);
  });

  it('reuse of rotated refresh revokes all sessions for the user', async () => {
    const app = appWithUser();
    const first = await login(app);
    const second = await login(app);

    const rotatedRes = await refresh(app, first.refreshToken);
    expect(rotatedRes.status).toBe(200);
    const rotated = (await rotatedRes.json()) as { refreshToken: string };

    const reuse = await refresh(app, first.refreshToken);
    expect(reuse.status).toBe(401);
    await expect(reuse.json()).resolves.toMatchObject({
      error: { code: 'TOKEN_REVOKED' },
    });

    const sibling = await refresh(app, second.refreshToken);
    expect(sibling.status).toBe(401);

    const winner = await refresh(app, rotated.refreshToken);
    expect(winner.status).toBe(401);
  });
});
