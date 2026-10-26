/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/ui-web-subpaths.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Enforce import direction between @azes/ui-web core and its subpaths (ADR-010)
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { readJson, rel, walkFiles } from '../lib/fs.mjs';

const SUBPATHS = ['settings', 'navigation', 'layout', 'icons', 'data-grid', 'charts', 'forms'];

/** Subpath -> subpaths it may import. Core may import none. */
const ALLOWED = {
  core: [],
  settings: [],
  navigation: [],
  layout: ['navigation', 'settings'],
  icons: [],
  'data-grid': [],
  charts: [],
  forms: [],
};

const FORBIDDEN_PACKAGES = [
  /^@azes\/(api|state|auth|permissions|i18n)(\/|$)/,
  /^react-router/,
  /^next(\/|$)/,
  /^@tanstack\//,
];

const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function areaOf(srcDir, file) {
  const first = path.relative(srcDir, file).split(path.sep)[0];
  return SUBPATHS.includes(first) ? first : 'core';
}

export function auditUiWebSubpaths(root) {
  const findings = [];
  const pkgDir = path.join(root, 'packages', 'ui-web');
  const srcDir = path.join(pkgDir, 'src');
  if (!fs.existsSync(srcDir)) {
    return { name: 'ui-web subpaths', ok: false, details: '  - packages/ui-web/src missing' };
  }

  const exportsMap = readJson(path.join(pkgDir, 'package.json')).exports ?? {};
  for (const sub of SUBPATHS) {
    const hasFolder = fs.existsSync(path.join(srcDir, sub, 'index.ts'));
    const hasExport = Object.prototype.hasOwnProperty.call(exportsMap, `./${sub}`);
    if (hasFolder && !hasExport)
      findings.push(`src/${sub} exists but package.json exports lacks "./${sub}"`);
    if (hasExport && !hasFolder) findings.push(`exports "./${sub}" has no src/${sub}/index.ts`);
  }

  for (const file of walkFiles(srcDir, { extensions: new Set(['.ts', '.tsx']) })) {
    const from = areaOf(srcDir, file);
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(IMPORT_RE)) {
      const spec = match[1] ?? match[2];
      if (FORBIDDEN_PACKAGES.some((re) => re.test(spec))) {
        findings.push(`${rel(root, file)} imports forbidden ${spec}`);
        continue;
      }
      if (!spec.startsWith('.')) continue;
      const target = path.resolve(path.dirname(file), spec);
      if (!target.startsWith(srcDir)) continue;
      const to = areaOf(srcDir, target);
      if (to === from || to === 'core') continue;
      if (!ALLOWED[from].includes(to)) findings.push(`${rel(root, file)} (${from}) imports ${to}`);
    }
  }

  return {
    name: 'ui-web subpaths',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'Core imports no subpath; subpaths follow ADR-010 direction; exports map matches folders.'
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}
