/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/public-api.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Ensure packages declare controlled public exports
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import path from 'node:path';

import { listWorkspacePackageDirs, readJson, rel } from '../lib/fs.mjs';

export function auditPublicApi(root) {
  const findings = [];
  const { packages } = listWorkspacePackageDirs(root);

  for (const dir of packages) {
    const pkgPath = path.join(dir, 'package.json');
    const pkg = readJson(pkgPath);
    if (!pkg.exports) {
      findings.push(`${rel(root, pkgPath)}: missing "exports" map`);
      continue;
    }
    const exportKeys = Object.keys(pkg.exports);
    if (!exportKeys.includes('.')) {
      findings.push(`${pkg.name}: "exports" must include "." entry`);
    }
  }

  return {
    name: 'public-API exports audit',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'All packages declare a public exports map with ".".'
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}
