/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Vitest config for @azes/api-server
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createVitestConfig } from '@azes/vitest-config';

export default createVitestConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
  },
});
