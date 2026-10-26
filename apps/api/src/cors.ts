/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/cors.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Exact-origin CORS; local fallback only outside production
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

import type { ApiEnv } from './env.js';
import { isProductionApiEnv } from './env.js';

/** Local Vite SPAs (Account :100, Academy :200) — development/test fallback only. */
export const DEFAULT_CORS_ALLOWED_ORIGINS = [
  'http://localhost:100',
  'http://127.0.0.1:100',
  'http://localhost:200',
  'http://127.0.0.1:200',
] as const;

export type ParseCorsOptions = {
  /** When true and allowlist empty/unset, use DEFAULT_CORS_ALLOWED_ORIGINS. */
  allowLocalFallback: boolean;
};

/**
 * Parse comma-separated exact origins.
 * Production must set CORS_ALLOWED_ORIGINS — empty allowlist denies all browser origins.
 */
export function parseCorsAllowedOrigins(
  raw: string | undefined,
  options: ParseCorsOptions,
): Set<string> {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const origins = raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (origins.length > 0) {
      return new Set(origins);
    }
  }
  if (options.allowLocalFallback) {
    return new Set(DEFAULT_CORS_ALLOWED_ORIGINS);
  }
  return new Set();
}

export function createCorsMiddleware(): MiddlewareHandler<{ Bindings: ApiEnv }> {
  return async (c, next) => {
    const env = c.env ?? ({} as ApiEnv);
    const allowLocalFallback = !isProductionApiEnv(env);
    const allowed = parseCorsAllowedOrigins(env.CORS_ALLOWED_ORIGINS, { allowLocalFallback });
    const middleware = cors({
      origin: (origin) => (origin && allowed.has(origin) ? origin : null),
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Device-Id', 'DeviceId'],
      exposeHeaders: ['Content-Type', 'Retry-After'],
      maxAge: 600,
    });
    return middleware(c, next);
  };
}
