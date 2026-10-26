/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/docs-sync.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-19
 * ║ Purpose: Docs/ADR sync checks against repo reality
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { listWorkspacePackageDirs, rel } from '../lib/fs.mjs';

const EXPECTED_ADRS = [
  'ADR-001-monorepo.md',
  'ADR-002-state-management.md',
  'ADR-003-api-generation.md',
  'ADR-004-ui-architecture.md',
  'ADR-005-rn-runtime-expo.md',
  'ADR-006-lint-format-toolchain.md',
  'ADR-007-package-layout.md',
  'ADR-008-design-tokens.md',
  'ADR-009-mui-web-theme.md',
  'ADR-010-ui-web-platform-subpaths.md',
  'ADR-011-layout-navigation-engine.md',
  'ADR-012-settings-engine.md',
  'ADR-013-mui-x-community.md',
  'ADR-014-forms.md',
  'ADR-015-rtl-and-icons.md',
  'ADR-016-styles-docs-rebuild.md',
];

const EXPECTED_APPS = ['account', 'academy', 'azes-ui', 'api'];

const EXPECTED_PACKAGES = [
  'design-tokens',
  'ui-web',
  'ui-native',
  'api',
  'state',
  'auth',
  'validation',
  'i18n',
  'permissions',
  'testing',
];

export function auditDocsSync(root) {
  const findings = [];

  const adrDir = path.join(root, 'docs', 'decisions');
  for (const adr of EXPECTED_ADRS) {
    if (!fs.existsSync(path.join(adrDir, adr))) {
      findings.push(`Missing ADR: docs/decisions/${adr}`);
    }
  }

  const { apps, packages } = listWorkspacePackageDirs(root);
  const appNames = new Set(apps.map((d) => path.basename(d)));
  const pkgNames = new Set(packages.map((d) => path.basename(d)));

  for (const app of EXPECTED_APPS) {
    if (!appNames.has(app)) findings.push(`Documented app missing on disk: apps/${app}`);
  }
  for (const name of appNames) {
    if (!EXPECTED_APPS.includes(name)) {
      findings.push(`Undocumented app directory: apps/${name}`);
    }
  }

  for (const pkg of EXPECTED_PACKAGES) {
    if (!pkgNames.has(pkg)) findings.push(`Expected package missing: packages/${pkg}`);
  }

  // Cursor rules present
  const rulesDir = path.join(root, '.cursor', 'rules');
  if (!fs.existsSync(rulesDir)) {
    findings.push('Missing .cursor/rules');
  } else {
    const rules = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.mdc'));
    if (rules.length < 8) {
      findings.push(`.cursor/rules has only ${rules.length} .mdc files (expected ≥ 8)`);
    }
  }

  // Sign-off document must exist after Phase 12 tooling lands
  const signoff = path.join(root, 'docs', 'architecture', 'verification-signoff.md');
  if (!fs.existsSync(signoff)) {
    findings.push('Missing docs/architecture/verification-signoff.md');
  }

  // docs/README should not claim zero implementation after phases completed
  const docsReadme = path.join(root, 'docs', 'README.md');
  if (fs.existsSync(docsReadme)) {
    const text = fs.readFileSync(docsReadme, 'utf8');
    if (text.includes('Nothing here is implemented yet')) {
      findings.push('docs/README.md still claims nothing is implemented (docs/ADR sync stale)');
    }
  }

  return {
    name: 'docs/ADR sync',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'ADRs, apps, packages, and verification sign-off are in sync.'
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}

void rel;
