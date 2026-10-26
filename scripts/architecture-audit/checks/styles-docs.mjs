/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/styles-docs.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Guard the docs/styles set, the frozen legacy folder and retired folder names
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { walkFiles } from '../lib/fs.mjs';

const EXPECTED_DOCS = [
  'README.md',
  '00-overview.md',
  '01-principles.md',
  '02-architecture.md',
  '03-design-tokens.md',
  '04-theme.md',
  '05-color-system.md',
  '06-typography.md',
  '07-components.md',
  '08-layout.md',
  '09-navigation.md',
  '10-settings.md',
  '11-responsive.md',
  '12-accessibility.md',
  '13-mui-x.md',
  '14-forms.md',
  '15-testing.md',
  '16-performance.md',
  '17-migration.md',
  '18-azes-ui.md',
  '19-dependencies.md',
  '20-definition-of-done.md',
];

const FROZEN_LEGACY = [
  'README.md',
  'INDEX-v1.md',
  'ACCESSIBILITY.md',
  'ARCHITECTURE.md',
  'BASELINE.md',
  'COLOR.md',
  'COMPONENTS.md',
  'CROSS-APP.md',
  'LAYOUT.md',
  'NAVIGATION.md',
  'RESPONSIVE.md',
  'ROADMAP.md',
  'SHOWCASE.md',
  'THEME.md',
  'TYPOGRAPHY.md',
  'VISION.md',
  'migration/00-current-state-audit.md',
  'migration/01-architecture.md',
  'migration/02-theme-system.md',
  'migration/03-color-system.md',
  'migration/04-light-dark-mode.md',
  'migration/05-global-styles.md',
  'migration/06-ssr-nextjs.md',
  'migration/07-react-vite.md',
  'migration/08-components.md',
  'migration/09-design-tokens-migration.md',
  'migration/10-azes-ui-demo.md',
  'migration/11-migration-plan.md',
  'migration/12-testing-qa.md',
  'migration/13-deprecation.md',
];

// Built from parts so this file does not match its own pattern.
const RETIRED_NAME = `\\b${'d'}(s)?${'tyles'}\\b`;

/**
 * Tracked and untracked-but-not-ignored text files. `git grep` is used because reading files
 * one by one from Node is very slow on Windows hosts with on-access scanning.
 */
function findRetiredNameReferences(root) {
  try {
    const output = execFileSync(
      'git',
      [
        'grep',
        '--untracked',
        '-l',
        '-I',
        '-E',
        RETIRED_NAME,
        '--',
        '.',
        ':(exclude)packages/api/generated',
      ],
      { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
    );
    return output.split('\n').filter(Boolean);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
}

export function auditStylesDocs(root) {
  const findings = [];
  const stylesDir = path.join(root, 'docs', 'styles');

  for (const doc of EXPECTED_DOCS) {
    if (!fs.existsSync(path.join(stylesDir, doc))) findings.push(`Missing docs/styles/${doc}`);
  }

  const legacyDir = path.join(stylesDir, 'legacy');
  if (fs.existsSync(legacyDir)) {
    const frozen = new Set(FROZEN_LEGACY);
    for (const file of walkFiles(legacyDir)) {
      const relative = path.relative(legacyDir, file).split(path.sep).join('/');
      if (!frozen.has(relative))
        findings.push(`Unexpected file in frozen legacy folder: ${relative}`);
    }
  }

  for (const file of findRetiredNameReferences(root)) {
    findings.push(`Retired styles folder name referenced in ${file}`);
  }

  return {
    name: 'styles docs',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? `docs/styles has ${EXPECTED_DOCS.length} expected files; legacy is frozen; no retired folder names.`
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}
