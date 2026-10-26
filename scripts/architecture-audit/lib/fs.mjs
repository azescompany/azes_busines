/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/lib/fs.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shared filesystem helpers for architecture audits
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IGNORE_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.next',
  '.expo',
  'playwright-report',
  'test-results',
  '.git',
]);

/** Resolve monorepo root from a module URL under scripts/architecture-audit/. */
export function rootFromModule(moduleUrl) {
  const filePath = path.dirname(fileURLToPath(moduleUrl));
  return path.resolve(filePath, '../..');
}

export function walkFiles(dir, { extensions = null, skipGenerated = false } = {}) {
  const results = [];

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (IGNORE_DIR_NAMES.has(entry.name)) continue;
        if (skipGenerated && entry.name === 'generated') continue;
        walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (extensions) {
        const ext = path.extname(entry.name);
        if (!extensions.has(ext)) continue;
      }
      results.push(full);
    }
  }

  walk(dir);
  return results;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function rel(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

export function listWorkspacePackageDirs(root) {
  const apps = fs
    .readdirSync(path.join(root, 'apps'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(root, 'apps', d.name));
  const packages = fs
    .readdirSync(path.join(root, 'packages'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(root, 'packages', d.name));
  return { apps, packages };
}
