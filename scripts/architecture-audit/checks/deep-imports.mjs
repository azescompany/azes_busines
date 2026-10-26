/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/deep-imports.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Fail on deep imports into package src trees
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { listWorkspacePackageDirs, rel, walkFiles } from '../lib/fs.mjs';

const DEEP_IMPORT =
  /from\s+['"]@azes\/[^'"]+\/src(?:\/|['"])|require\(\s*['"]@azes\/[^'"]+\/src(?:\/|['"])/;

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

export function auditDeepImports(root) {
  const findings = [];
  const { apps, packages } = listWorkspacePackageDirs(root);
  const roots = [...apps, ...packages, path.join(root, 'scripts'), path.join(root, 'e2e')];

  for (const dir of roots) {
    if (!fs.existsSync(dir)) continue;
    for (const file of walkFiles(dir, { extensions: SOURCE_EXTS, skipGenerated: true })) {
      const text = fs.readFileSync(file, 'utf8');
      if (DEEP_IMPORT.test(text)) {
        findings.push(rel(root, file));
      }
    }
  }

  return {
    name: 'public-API / deep-import audit',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'No @azes/*/src deep imports found.'
        : `Deep imports in:\n${findings.map((f) => `  - ${f}`).join('\n')}`,
  };
}
