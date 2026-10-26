/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/print-color-report.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: CLI entry that runs the ui-web color report via Vitest
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Usage (from repo root): pnpm color:report
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(
  'pnpm',
  ['--filter', '@azes/ui-web', 'exec', 'vitest', 'run', 'src/theme/color-report.test.ts'],
  {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, AZES_COLOR_REPORT: '1' },
  },
);

process.exit(result.status ?? 1);
