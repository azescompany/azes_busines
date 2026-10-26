/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/scripts/check-generated-drift.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Fail CI when Orval output drifts from committed generated/
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  const tracked = execSync('git ls-files -- generated', {
    cwd: packageRoot,
    encoding: 'utf8',
  }).trim();

  if (!tracked) {
    console.warn(
      'Bootstrap: no tracked files under generated/ yet. Commit Orval output, then CI drift checks apply.',
    );
    process.exit(0);
  }

  const porcelain = execSync('git status --porcelain -- generated', {
    cwd: packageRoot,
    encoding: 'utf8',
  }).trim();

  if (porcelain.length > 0) {
    console.error('Generated OpenAPI client is out of date. Run `pnpm api:generate` and commit.');
    console.error(porcelain);
    process.exit(1);
  }

  console.warn('Generated OpenAPI client is up to date.');
} catch (error) {
  console.error('Failed to check generated/ drift.', error);
  process.exit(1);
}
