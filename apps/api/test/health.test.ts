/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/health.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Health + not-found + error envelope unit tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { DEFAULT_CORS_ALLOWED_ORIGINS, parseCorsAllowedOrigins } from '../src/cors.js';
import { ApiHttpError } from '../src/errors.js';
import type { ApiEnv } from '../src/env.js';

const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
};

describe('health routes', () => {
  const app = createApp();

  it('GET /health returns minimal ok payload', async () => {
    const res = await app.request('/health', {}, testEnv);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      service: 'azes-api',
    });
  });

  it('GET /api/v1/health returns versioned status', async () => {
    const res = await app.request('/api/v1/health', {}, testEnv);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      service: 'azes-api',
      apiVersion: 'v1',
      status: 'up',
    });
  });

  it('unknown path returns documented NOT_FOUND JSON', async () => {
    const res = await app.request('/no-such-route', {}, testEnv);
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    });
  });

  it('OPTIONS preflight from Account origin succeeds (CORS)', async () => {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:100',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,x-device-id,deviceid',
        },
      },
      testEnv,
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:100');
    expect(res.headers.get('Access-Control-Allow-Methods') ?? '').toMatch(/POST/i);
  });

  it('OPTIONS preflight from unknown origin omits Allow-Origin (CORS deny)', async () => {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://evil.example',
          'Access-Control-Request-Method': 'POST',
        },
      },
      testEnv,
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('CORS_ALLOWED_ORIGINS env allowlist is respected', async () => {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://account.example.test',
          'Access-Control-Request-Method': 'POST',
        },
      },
      {
        ...testEnv,
        CORS_ALLOWED_ORIGINS: 'https://account.example.test,https://academy.example.test',
      },
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://account.example.test');

    const denied = await app.request(
      '/api/v1/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:100',
          'Access-Control-Request-Method': 'POST',
        },
      },
      {
        ...testEnv,
        CORS_ALLOWED_ORIGINS: 'https://account.example.test',
      },
    );
    expect(denied.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('parseCorsAllowedOrigins: production empty allowlist has no localhost fallback', () => {
    const prodEmpty = parseCorsAllowedOrigins(undefined, { allowLocalFallback: false });
    expect(prodEmpty.size).toBe(0);
    expect(prodEmpty.has('http://localhost:100')).toBe(false);

    const prodBlank = parseCorsAllowedOrigins('  ,  ', { allowLocalFallback: false });
    expect(prodBlank.size).toBe(0);

    const devFallback = parseCorsAllowedOrigins(undefined, { allowLocalFallback: true });
    for (const origin of DEFAULT_CORS_ALLOWED_ORIGINS) {
      expect(devFallback.has(origin)).toBe(true);
    }
  });

  it('production API_ENV denies localhost when CORS_ALLOWED_ORIGINS unset', async () => {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:100',
          'Access-Control-Request-Method': 'POST',
        },
      },
      {
        ...testEnv,
        API_ENV: 'production',
        // explicit unset — do not inherit local wrangler defaults in this request env
        CORS_ALLOWED_ORIGINS: undefined,
      },
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('production API_ENV allows only exact configured origins', async () => {
    const env: ApiEnv = {
      ...testEnv,
      API_ENV: 'production',
      CORS_ALLOWED_ORIGINS: 'https://account.prod.test,https://academy.prod.test',
    };
    const allow = await app.request(
      '/api/v1/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://account.prod.test',
          'Access-Control-Request-Method': 'POST',
        },
      },
      env,
    );
    expect(allow.headers.get('Access-Control-Allow-Origin')).toBe('https://account.prod.test');

    const denyLocal = await app.request(
      '/api/v1/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:100',
          'Access-Control-Request-Method': 'POST',
        },
      },
      env,
    );
    expect(denyLocal.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('onError does not leak internal exception messages', async () => {
    const leaking = createApp();
    leaking.get('/boom', () => {
      throw new Error('secret stack detail');
    });
    leaking.get('/controlled', () => {
      throw new ApiHttpError(400, 'BAD_REQUEST', 'Invalid input');
    });

    const boom = await leaking.request('/boom', {}, testEnv);
    expect(boom.status).toBe(500);
    await expect(boom.json()).resolves.toEqual({
      error: {
        code: 'INTERNAL',
        message: 'An unexpected error occurred',
      },
    });

    const controlled = await leaking.request('/controlled', {}, testEnv);
    expect(controlled.status).toBe(400);
    await expect(controlled.json()).resolves.toEqual({
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid input',
      },
    });
  });
});
