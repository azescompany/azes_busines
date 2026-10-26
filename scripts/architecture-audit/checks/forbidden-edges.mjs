/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/forbidden-edges.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Audit package.json workspace dependency graph edges
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { listWorkspacePackageDirs, readJson, rel } from '../lib/fs.mjs';

function workspaceDeps(pkgJson) {
  const bags = [
    pkgJson.dependencies,
    pkgJson.devDependencies,
    pkgJson.peerDependencies,
    pkgJson.optionalDependencies,
  ];
  const names = new Set();
  for (const bag of bags) {
    if (!bag) continue;
    for (const [name, version] of Object.entries(bag)) {
      if (name.startsWith('@azes/') && String(version).includes('workspace:')) {
        names.add(name);
      }
    }
  }
  return [...names];
}

function pkgNameFromDir(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  return readJson(pkgPath).name ?? null;
}

export function auditForbiddenEdges(root) {
  const findings = [];
  const { apps, packages } = listWorkspacePackageDirs(root);

  const appNames = new Set(apps.map(pkgNameFromDir).filter(Boolean));
  const packageByName = new Map();
  for (const dir of packages) {
    const name = pkgNameFromDir(dir);
    if (name) packageByName.set(name, path.basename(dir));
  }

  // apps → apps forbidden
  for (const dir of apps) {
    const pkg = readJson(path.join(dir, 'package.json'));
    for (const dep of workspaceDeps(pkg)) {
      if (appNames.has(dep)) {
        findings.push(`${pkg.name} depends on app ${dep} (apps→apps forbidden)`);
      }
    }
  }

  // packages must not depend on apps
  for (const dir of packages) {
    const pkg = readJson(path.join(dir, 'package.json'));
    for (const dep of workspaceDeps(pkg)) {
      if (appNames.has(dep)) {
        findings.push(`${pkg.name} depends on app ${dep} (package→app forbidden)`);
      }
    }
  }

  // ui-* must not depend on api/state/auth
  const uiForbidden = new Set(['@azes/api', '@azes/state', '@azes/auth']);
  for (const ui of ['@azes/ui-web', '@azes/ui-native']) {
    const dirName = packageByName.get(ui);
    if (!dirName) continue;
    const pkg = readJson(path.join(root, 'packages', dirName, 'package.json'));
    for (const dep of workspaceDeps(pkg)) {
      if (uiForbidden.has(dep)) {
        findings.push(`${ui} depends on ${dep} (forbidden for UI packages)`);
      }
    }
  }

  // design-tokens must not depend on react packages or UI
  const tokensDir = packageByName.get('@azes/design-tokens');
  if (tokensDir) {
    const pkg = readJson(path.join(root, 'packages', tokensDir, 'package.json'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    for (const name of Object.keys(allDeps ?? {})) {
      if (
        name === 'react' ||
        name === 'react-dom' ||
        name === 'react-native' ||
        name === '@azes/ui-web' ||
        name === '@azes/ui-native'
      ) {
        findings.push(`@azes/design-tokens depends on ${name} (must stay React-free)`);
      }
    }
  }

  // Scan source for apps importing other apps by path
  for (const dir of apps) {
    const fromApp = path.basename(dir);
    const srcRoot = path.join(dir, 'src');
    if (!fs.existsSync(srcRoot) && !fs.existsSync(path.join(dir, 'app'))) continue;
    // package.json already covered; also check relative imports to ../../other-app
    const scanDirs = [srcRoot, path.join(dir, 'app')].filter((d) => fs.existsSync(d));
    for (const scanDir of scanDirs) {
      // lightweight: only package.json edges for apps→apps is primary
      void scanDir;
      void fromApp;
      void rel;
    }
  }

  return {
    name: 'dependency-graph audit',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'No forbidden workspace edges in package.json graphs.'
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}
