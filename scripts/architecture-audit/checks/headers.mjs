/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/headers.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: AZES file-header policy audit (comment-supporting files)
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { rel, walkFiles } from '../lib/fs.mjs';

const REQUIRED = ['AZES COMPANY', 'File:', 'Author:', 'Created:', 'Updated:', 'Purpose:', 'Layer:'];

const HEADER_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.md',
  '.mdc',
  '.yml',
  '.yaml',
]);

const SKIP_BASENAMES = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'next-env.d.ts',
  'expo-env.d.ts',
]);

function isExempt(relPath) {
  if (relPath.includes('/generated/')) return true;
  if (relPath.includes('/dist/')) return true;
  if (relPath.endsWith('pnpm-lock.yaml')) return true;
  if (SKIP_BASENAMES.has(path.basename(relPath))) return true;
  // Strict JSON never gets headers
  if (relPath.endsWith('.json')) return true;
  return false;
}

function hasHeader(text, ext) {
  const head = text.slice(0, 1200);
  // .mdc: header after frontmatter
  if (ext === '.mdc') {
    return REQUIRED.every((token) => head.includes(token));
  }
  return REQUIRED.every((token) => head.includes(token));
}

export function auditHeaders(root) {
  const findings = [];
  const scopes = [
    path.join(root, 'apps'),
    path.join(root, 'packages'),
    path.join(root, 'tooling'),
    path.join(root, 'scripts'),
    path.join(root, 'e2e'),
    path.join(root, 'docs'),
    path.join(root, '.cursor', 'rules'),
    path.join(root, '.github', 'workflows'),
  ];

  for (const scope of scopes) {
    if (!fs.existsSync(scope)) continue;
    for (const file of walkFiles(scope, { extensions: HEADER_EXTS, skipGenerated: true })) {
      const relative = rel(root, file);
      if (isExempt(relative)) continue;
      // Skip pure type declaration ambient files without implementation
      if (relative.endsWith('.d.ts') && !relative.includes('src/')) continue;

      const text = fs.readFileSync(file, 'utf8');
      const ext = path.extname(file);
      if (!hasHeader(text, ext)) {
        findings.push(relative);
      }
    }
  }

  // Also check root WORKER.md and README.md
  for (const rootDoc of ['WORKER.md', 'README.md']) {
    const file = path.join(root, rootDoc);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (!hasHeader(text, '.md')) findings.push(rootDoc);
  }

  return {
    name: 'header-policy audit',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'Comment-supporting files carry AZES headers.'
        : `Missing/incomplete headers (${findings.length}):\n${findings
            .slice(0, 40)
            .map((f) => `  - ${f}`)
            .join('\n')}${findings.length > 40 ? `\n  … +${findings.length - 40} more` : ''}`,
  };
}
