/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/config/appMeta.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-09-29
 * ║ Purpose: Identity metadata for the design-system showcase
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const appMeta = {
  name: 'UI',
  packageName: '@azes/azes-ui',
  platform: 'web-vite' as const,
  env: (import.meta.env.MODE === 'production' ? 'production' : 'development') as
    'development' | 'production',
} as const;
