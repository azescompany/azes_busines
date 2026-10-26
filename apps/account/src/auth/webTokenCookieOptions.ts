/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/auth/webTokenCookieOptions.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-05
 * ║ Purpose: Env-driven cookie domain/options for shared account ↔ admin SSO
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { WebTokenCookieOptions } from '@azes/auth';

import { accountEnv } from '../config/env.js';

export function accountWebTokenCookieOptions(): Partial<WebTokenCookieOptions> {
  return {
    ...(accountEnv.authCookieDomain ? { domain: accountEnv.authCookieDomain } : {}),
  };
}
