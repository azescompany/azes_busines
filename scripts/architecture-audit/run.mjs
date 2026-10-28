/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/run.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-28
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

/**
 * Known Phase-12 debt — still reported, does not fail CI until remediations land.
 * Hard gates remain: edges, deep-imports, public-api, generated, docs-sync, styles, etc.
 */
const SOFT_FAIL_NAMES = new Set([
  'header-policy audit',
  'ui-web subpaths',
  'layout hard-coded values',
]);

let failed = 0;
let softFailed = 0;

process.stdout.write('\nAZES architecture verification (Phase 12)\n');
process.stdout.write(`Root: ${root}\n\n`);

for (const check of checks) {
  const result = check(root);
  const soft = !result.ok && SOFT_FAIL_NAMES.has(result.name);
  const mark = result.ok ? 'PASS' : soft ? 'WARN' : 'FAIL';
  process.stdout.write(`[${mark}] ${result.name}\n`);
  process.stdout.write(`${result.details}\n\n`);
  if (!result.ok && soft) softFailed += 1;
  else if (!result.ok) failed += 1;
}

if (softFailed > 0) {
  process.stdout.write(`Architecture soft warnings: ${softFailed} (non-blocking).\n`);
}

if (failed > 0) {
  process.stdout.write(`Architecture verification FAILED (${failed} check(s)).\n`);
  process.exit(1);
}

process.stdout.write('Architecture verification PASSED.\n');
