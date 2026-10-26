/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: e2e/playwright.visual.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-26
 * ║ Purpose: Local-only visual regression matrix for apps/azes-ui (not part of CI)
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { defineConfig, devices } from '@playwright/test';

const url = 'http://127.0.0.1:700';

// Screenshot baselines are platform-specific, so this suite runs locally only (docs/styles/15-testing.md).
export default defineConfig({
  testDir: './visual',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.001, animations: 'disabled' },
  },
  use: { ...devices['Desktop Chrome'], baseURL: url, trace: 'retain-on-failure' },
  webServer: {
    command:
      'pnpm --filter @azes/azes-ui exec vite preview --host 127.0.0.1 --port 700 --strictPort',
    url,
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [{ name: 'azes-ui-visual', testMatch: 'azes-ui.spec.ts' }],
});
