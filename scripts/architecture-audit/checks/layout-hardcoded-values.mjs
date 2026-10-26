/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/layout-hardcoded-values.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Reject literal px sizes and raw px media queries in ui-web layout/navigation code
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { rel, walkFiles } from '../lib/fs.mjs';

const SCOPES = [
  'packages/ui-web/src/layout',
  'packages/ui-web/src/navigation',
  'packages/ui-web/src/settings',
];
const PX_LITERAL = /['"`][^'"`\n]*\b\d+px\b[^'"`\n]*['"`]/;
const RAW_MEDIA = /@media[^{]*\d+px/;

export function auditLayoutHardcodedValues(root) {
  const findings = [];

  for (const scope of SCOPES) {
    const dir = path.join(root, scope);
    if (!fs.existsSync(dir)) continue;
    for (const file of walkFiles(dir, { extensions: new Set(['.ts', '.tsx']) })) {
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (PX_LITERAL.test(line) || RAW_MEDIA.test(line)) {
          findings.push(`${rel(root, file)}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }

  return {
    name: 'layout hard-coded values',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'Layout, navigation and settings code uses tokens and --azes-layout-* variables.'
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}
