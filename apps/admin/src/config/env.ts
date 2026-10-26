/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/config/env.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Runtime env — API base + Account login origin
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

function trimEnv(value: string | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8787';
const DEFAULT_ACCOUNT_APP_URL = 'http://localhost:100';

export const adminEnv = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, ''),
  /** Account login SPA — redirect target when Admin has no session. */
  accountAppUrl: (import.meta.env.VITE_ACCOUNT_APP_URL ?? DEFAULT_ACCOUNT_APP_URL).replace(
    /\/$/,
    '',
  ),
  authCookieDomain: trimEnv(import.meta.env.VITE_AUTH_COOKIE_DOMAIN),
} as const;
