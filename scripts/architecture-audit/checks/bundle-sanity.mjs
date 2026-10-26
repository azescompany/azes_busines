/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/bundle-sanity.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Soft bundle/dist size sanity checks for platform packages
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { rel, walkFiles } from '../lib/fs.mjs';

/** Soft ceilings (bytes) for package dist trees after build — foundation packages. */
const LIMITS = {
  'packages/design-tokens/dist': 500_000,
  'packages/ui-web/dist': 1_500_000,
  'packages/ui-native/dist': 1_500_000,
  'packages/validation/dist': 200_000,
  'packages/permissions/dist': 200_000,
  'packages/testing/dist': 500_000,
};

function dirSizeBytes(dir) {
  if (!fs.existsSync(dir)) return null;
  let total = 0;
  for (const file of walkFiles(dir)) {
    total += fs.statSync(file).size;
  }
  return total;
}

export function auditBundleSanity(root) {
  const findings = [];
  const notes = [];

  for (const [relDir, limit] of Object.entries(LIMITS)) {
    const abs = path.join(root, relDir);
    const size = dirSizeBytes(abs);
    if (size === null) {
      findings.push(`${relDir}: missing (run pnpm build before architecture:verify)`);
      continue;
    }
    notes.push(
      `${relDir}: ${(size / 1024).toFixed(1)} KiB (limit ${(limit / 1024).toFixed(0)} KiB)`,
    );
    if (size > limit) {
      findings.push(
        `${relDir}: ${(size / 1024).toFixed(1)} KiB exceeds soft limit ${(limit / 1024).toFixed(0)} KiB`,
      );
    }
  }

  return {
    name: 'bundle/perf sanity',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? `Dist sizes within soft ceilings.\n${notes.map((n) => `  - ${n}`).join('\n')}`
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}

void rel;
