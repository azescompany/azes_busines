/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest config for @azes/api
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createVitestConfig } from '@azes/vitest-config';

export default createVitestConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
