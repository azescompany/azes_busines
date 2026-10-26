/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: tooling/vitest/index.js
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shared Vitest configuration factory with coverage baseline
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { defineConfig, mergeConfig } from 'vitest/config';

/** Baseline coverage thresholds (kept in sync with @azes/testing coverageThresholds). */
export const coverageThresholds = {
  lines: 40,
  functions: 40,
  branches: 30,
  statements: 40,
};

/**
 * @param {import('vitest/config').UserConfig} [overrides]
 * @returns {import('vitest/config').UserConfig}
 */
export function createVitestConfig(overrides = {}) {
  const base = defineConfig({
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/.turbo/**', '**/e2e/**'],
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html'],
        reportsDirectory: './coverage',
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/*.config.*',
          '**/vitest.config.*',
          '**/e2e/**',
          '**/*.test.*',
          '**/*.spec.*',
          '**/test/**',
        ],
      },
    },
  });

  return mergeConfig(base, overrides);
}

export default createVitestConfig();
