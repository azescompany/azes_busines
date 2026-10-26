/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/testing/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest config for @azes/testing (coverage gates)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { coverageThresholds, createVitestConfig } from '@azes/vitest-config';

export default createVitestConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      // Gate the shared coverage contract; web/native helpers are exercised by consumers.
      include: ['src/coverage/**', 'src/index.ts'],
      thresholds: { ...coverageThresholds },
    },
  },
});
