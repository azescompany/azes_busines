/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: e2e/playwright.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-19
 * ║ Purpose: Playwright config for web shell smoke E2E
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

const isCi = Boolean(process.env.CI);
const only = process.env.PLAYWRIGHT_PROJECT;

type Shell = {
  name: string;
  url: string;
  command: string;
  testMatch: string;
};

const shells: Shell[] = [
  {
    name: 'account',
    url: 'http://127.0.0.1:4173',
    command:
      'pnpm --filter @azes/account exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
    testMatch: 'account.spec.ts',
  },
];

const selected = only ? shells.filter((s) => s.name === only) : shells;

if (only && selected.length === 0) {
  throw new Error(`Unknown PLAYWRIGHT_PROJECT="${only}"`);
}

const config: PlaywrightTestConfig = {
  testDir: './smoke',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  // Prefer one server at a time (set PLAYWRIGHT_PROJECT). Full suite uses e2e/run-smoke.mjs.
  webServer: selected.map((shell) => ({
    command: shell.command,
    url: shell.url,
    reuseExistingServer: !isCi,
    timeout: 180_000,
  })),
  projects: selected.map((shell) => ({
    name: shell.name,
    use: { baseURL: shell.url },
    testMatch: shell.testMatch,
  })),
};

export default defineConfig(config);
