/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/generated-policy.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Generated-file policy audit for packages/api/generated
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { rel, walkFiles } from '../lib/fs.mjs';

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Orval custom mutator is the only allowed import from generated → packages/api/src. */
const ALLOWED_MUTATOR_IMPORT = /from\s+['"](?:\.\.\/)+src\/client\/mutator(?:\.js)?['"]/;

export function auditGeneratedPolicy(root) {
  const findings = [];
  const generatedDir = path.join(root, 'packages', 'api', 'generated');

  if (!fs.existsSync(generatedDir)) {
    return {
      name: 'generated-file policy audit',
      ok: false,
      details: 'packages/api/generated is missing (expected Orval output).',
    };
  }

  const files = walkFiles(generatedDir, { extensions: SOURCE_EXTS });
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    // Generated code must not import manually maintained app/package business paths.
    if (/from\s+['"]@azes\/(?!api)[^'"]+['"]/.test(text)) {
      findings.push(`${rel(root, file)}: imports non-api @azes package`);
    }
    if (
      /from\s+['"]\.\.\/(?!generated)[^'"]*\/(client|query|mutations|config)\//.test(text) &&
      !ALLOWED_MUTATOR_IMPORT.test(text)
    ) {
      findings.push(`${rel(root, file)}: suspicious import into hand-maintained api paths`);
    }
    // Hand-added AZES company headers should not appear in generated trees.
    if (text.includes('AZES COMPANY') && text.includes('Purpose:')) {
      findings.push(
        `${rel(root, file)}: looks hand-headered (generated files must not be hand-edited)`,
      );
    }
  }

  return {
    name: 'generated-file policy audit',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? `Generated tree OK (${files.length} files scanned).`
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}
