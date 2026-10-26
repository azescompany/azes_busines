/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/webTokenCookieOptions.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Env-driven cookie domain for Account ↔ Admin SSO
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { WebTokenCookieOptions } from '@azes/auth';

import { adminEnv } from '../config/env.js';

export function adminWebTokenCookieOptions(): Partial<WebTokenCookieOptions> {
  return {
    ...(adminEnv.authCookieDomain ? { domain: adminEnv.authCookieDomain } : {}),
  };
}
