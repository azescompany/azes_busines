/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/rateLimit.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: Auth + LMS endpoint rate limits (D1 + in-memory test store)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { eq } from 'drizzle-orm';

import { createDb, type ApiDb } from '../db/client.js';
import { authRateLimits } from '../db/schema.js';
import { isAuthRateLimitEnabled, type ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { nowSec } from './tokens.js';

/** Login: per-IP window. */
export const LOGIN_IP_LIMIT = 20;
export const LOGIN_IP_WINDOW_SEC = 15 * 60;

/** Login: per normalized username window. */
export const LOGIN_USER_LIMIT = 8;
export const LOGIN_USER_WINDOW_SEC = 15 * 60;

/** Refresh: per-IP window. */
export const REFRESH_IP_LIMIT = 60;
export const REFRESH_IP_WINDOW_SEC = 5 * 60;

/** Quiz submit: per-user window (abuse / brute force). */
export const QUIZ_SUBMIT_USER_LIMIT = 30;
export const QUIZ_SUBMIT_USER_WINDOW_SEC = 10 * 60;

/** File upload: per-user window. */
export const FILE_UPLOAD_USER_LIMIT = 20;
export const FILE_UPLOAD_USER_WINDOW_SEC = 15 * 60;

export type RateLimitHitResult = {
  allowed: boolean;
  retryAfterSec: number;
};

export interface RateLimitStore {
  hit(key: string, windowSec: number, limit: number, now: number): Promise<RateLimitHitResult>;
}

export function createMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, { windowStart: number; hitCount: number }>();

  return {
    async hit(key, windowSec, limit, now) {
      const current = buckets.get(key);
      if (!current || now >= current.windowStart + windowSec) {
        buckets.set(key, { windowStart: now, hitCount: 1 });
        return { allowed: true, retryAfterSec: 0 };
      }
      if (current.hitCount >= limit) {
        return {
          allowed: false,
          retryAfterSec: Math.max(1, current.windowStart + windowSec - now),
        };
      }
      current.hitCount += 1;
      buckets.set(key, current);
      return { allowed: true, retryAfterSec: 0 };
    },
  };
}

export function createD1RateLimitStore(db: ApiDb): RateLimitStore {
  return {
    async hit(key, windowSec, limit, now) {
      const rows = await db
        .select()
        .from(authRateLimits)
        .where(eq(authRateLimits.bucketKey, key))
        .limit(1);
      const row = rows[0];

      if (!row || now >= row.windowStart + windowSec) {
        if (row) {
          await db
            .update(authRateLimits)
            .set({ windowStart: now, hitCount: 1 })
            .where(eq(authRateLimits.bucketKey, key));
        } else {
          await db.insert(authRateLimits).values({
            bucketKey: key,
            windowStart: now,
            hitCount: 1,
          });
        }
        return { allowed: true, retryAfterSec: 0 };
      }

      if (row.hitCount >= limit) {
        return {
          allowed: false,
          retryAfterSec: Math.max(1, row.windowStart + windowSec - now),
        };
      }

      await db
        .update(authRateLimits)
        .set({ hitCount: row.hitCount + 1 })
        .where(eq(authRateLimits.bucketKey, key));
      return { allowed: true, retryAfterSec: 0 };
    },
  };
}

export function clientIpFromHeaders(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf;
  const xff = headers.get('x-forwarded-for')?.trim();
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

export async function enforceRateLimit(
  store: RateLimitStore,
  key: string,
  windowSec: number,
  limit: number,
): Promise<void> {
  const result = await store.hit(key, windowSec, limit, nowSec());
  if (!result.allowed) {
    throw new ApiHttpError(
      429,
      'RATE_LIMITED',
      'Too many requests. Please try again later.',
      result.retryAfterSec,
    );
  }
}

export function loginIpKey(ip: string): string {
  return `login:ip:${ip}`;
}

export function loginUserKey(usernameNormalized: string): string {
  return `login:user:${usernameNormalized}`;
}

export function refreshIpKey(ip: string): string {
  return `refresh:ip:${ip}`;
}

export function quizSubmitUserKey(userId: string): string {
  return `quiz-submit:user:${userId}`;
}

export function fileUploadUserKey(userId: string): string {
  return `file-upload:user:${userId}`;
}

/** Shared resolver — null when disabled or no store available. */
export function resolveRateLimitStore(
  env: ApiEnv,
  injected?: RateLimitStore,
): RateLimitStore | null {
  if (!isAuthRateLimitEnabled(env)) {
    return null;
  }
  if (injected) {
    return injected;
  }
  if (!env.DB) {
    return null;
  }
  return createD1RateLimitStore(createDb(env.DB));
}
