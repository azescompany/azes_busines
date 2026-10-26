/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest config for @azes/design-tokens (coverage gates)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { coverageThresholds, createVitestConfig } from '@azes/vitest-config';

export default createVitestConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      thresholds: { ...coverageThresholds },
    },
  },
});
