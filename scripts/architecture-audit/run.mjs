/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/run.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Phase 12 architecture verification runner
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { auditBundleSanity } from './checks/bundle-sanity.mjs';
import { auditDeepImports } from './checks/deep-imports.mjs';
import { auditDocsSync } from './checks/docs-sync.mjs';
import { auditForbiddenEdges } from './checks/forbidden-edges.mjs';
import { auditGeneratedPolicy } from './checks/generated-policy.mjs';
import { auditHeaders } from './checks/headers.mjs';
import { auditForbiddenLibraries } from './checks/forbidden-libraries.mjs';
import { auditLayoutHardcodedValues } from './checks/layout-hardcoded-values.mjs';
import { auditPublicApi } from './checks/public-api.mjs';
import { auditStylesDocs } from './checks/styles-docs.mjs';
import { auditUiWebSubpaths } from './checks/ui-web-subpaths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const checks = [
  auditForbiddenEdges,
  auditDeepImports,
  auditPublicApi,
  auditGeneratedPolicy,
  auditHeaders,
  auditBundleSanity,
  auditDocsSync,
  auditForbiddenLibraries,
  auditUiWebSubpaths,
  auditLayoutHardcodedValues,
  auditStylesDocs,
];

let failed = 0;

process.stdout.write('\nAZES architecture verification (Phase 12)\n');
process.stdout.write(`Root: ${root}\n\n`);

for (const check of checks) {
  const result = check(root);
  const mark = result.ok ? 'PASS' : 'FAIL';
  process.stdout.write(`[${mark}] ${result.name}\n`);
  process.stdout.write(`${result.details}\n\n`);
  if (!result.ok) failed += 1;
}

if (failed > 0) {
  process.stdout.write(`Architecture verification FAILED (${failed} check(s)).\n`);
  process.exit(1);
}

process.stdout.write('Architecture verification PASSED.\n');
