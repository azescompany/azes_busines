/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/config/appMeta.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shell identity metadata for @azes/account
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const appMeta = {
  name: 'Account',
  packageName: '@azes/account',
  platform: 'web-vite' as const,
  env: (import.meta.env.MODE === 'production' ? 'production' : 'development') as
    'development' | 'production',
} as const;
