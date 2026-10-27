/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/env.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-27
 * ║ Purpose: Cloudflare Worker bindings + Zod env validation
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

import { ApiHttpError } from './errors.js';

const varsSchema = z.object({
  API_NAME: z.string().min(1).default('azes-api'),
  API_VERSION: z.string().min(1).default('v1'),
  /**
   * Runtime mode: `development` | `test` | `production` (also accepts `prod`).
   * Production disables localhost CORS fallback when CORS_ALLOWED_ORIGINS is unset.
   */
  API_ENV: z.string().optional(),
  /** HS256 secret for access JWTs — required for auth routes (Phase 2B). */
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  /** Comma-separated exact browser origins (Phase 2E). */
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  /** When "false", skip D1 auth rate limits (tests / emergency). Default on. */
  AUTH_RATE_LIMIT_ENABLED: z.string().optional(),
  /**
   * Access resolver mode (Phase 06/08): `legacy` | `unified` (default unified).
   * Rollback: ACCESS_RESOLVER_MODE=legacy (same deny/allow core through 2026-12-31).
   */
  ACCESS_RESOLVER_MODE: z.string().optional(),
});

export type ApiVars = z.infer<typeof varsSchema>;

/** Worker bindings — D1 / R2 may be unbound in pure unit tests. */
export type ApiEnv = ApiVars & {
  DB?: D1Database;
  /** R2 bucket for LMS file uploads (Mərhələ 2). */
  FILES?: R2Bucket;
  API_ENV?: string;
  JWT_ACCESS_SECRET?: string;
  CORS_ALLOWED_ORIGINS?: string;
  AUTH_RATE_LIMIT_ENABLED?: string;
  ACCESS_RESOLVER_MODE?: string;
};

export function parseApiVars(env: Record<string, unknown> | ApiEnv): ApiVars {
  return varsSchema.parse({
    API_NAME: env.API_NAME ?? 'azes-api',
    API_VERSION: env.API_VERSION ?? 'v1',
    API_ENV: typeof env.API_ENV === 'string' ? env.API_ENV : undefined,
    JWT_ACCESS_SECRET:
      typeof env.JWT_ACCESS_SECRET === 'string' && env.JWT_ACCESS_SECRET.length > 0
        ? env.JWT_ACCESS_SECRET
        : undefined,
    CORS_ALLOWED_ORIGINS:
      typeof env.CORS_ALLOWED_ORIGINS === 'string' ? env.CORS_ALLOWED_ORIGINS : undefined,
    AUTH_RATE_LIMIT_ENABLED:
      typeof env.AUTH_RATE_LIMIT_ENABLED === 'string' ? env.AUTH_RATE_LIMIT_ENABLED : undefined,
    ACCESS_RESOLVER_MODE:
      typeof env.ACCESS_RESOLVER_MODE === 'string' ? env.ACCESS_RESOLVER_MODE : undefined,
  });
}

/** True when Worker is configured as production (no localhost CORS fallback). */
export function isProductionApiEnv(env: Pick<ApiEnv, 'API_ENV'>): boolean {
  const mode = env.API_ENV?.trim().toLowerCase();
  return mode === 'production' || mode === 'prod';
}

export function requireJwtAccessSecret(env: ApiEnv): string {
  const secret = env.JWT_ACCESS_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new ApiHttpError(
      500,
      'INTERNAL',
      'JWT_ACCESS_SECRET is not configured (min 32 characters)',
    );
  }
  return secret;
}

export function isAuthRateLimitEnabled(env: ApiEnv): boolean {
  const raw = env.AUTH_RATE_LIMIT_ENABLED?.trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') {
    return false;
  }
  return true;
}
