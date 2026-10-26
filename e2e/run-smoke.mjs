/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: e2e/run-smoke.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-19
 * ║ Purpose: Sequential Playwright smoke runner (one shell at a time)
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projects = ['account'];
const playwrightCli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');

if (!fs.existsSync(playwrightCli)) {
  process.stderr.write(`Playwright CLI not found at ${playwrightCli}\n`);
  process.exit(1);
}

for (const project of projects) {
  process.stdout.write(`\n=== E2E smoke: ${project} ===\n\n`);
  const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', '--config=e2e/playwright.config.ts', `--project=${project}`],
    {
      cwd: root,
      env: { ...process.env, PLAYWRIGHT_PROJECT: project },
      stdio: 'inherit',
    },
  );

  if (result.error) {
    process.stderr.write(`${result.error.message}\n`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

process.stdout.write('\n=== All web shell smoke E2E passed ===\n\n');
