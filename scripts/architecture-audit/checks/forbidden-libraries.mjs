/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/architecture-audit/checks/forbidden-libraries.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Reject second styling, icon, chart and animation systems in web workspaces
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';

import { listWorkspacePackageDirs, readJson, rel } from '../lib/fs.mjs';

/** Exact names or `prefix/*` scopes. See docs/styles/19-dependencies.md. */
const FORBIDDEN = [
  'tailwindcss',
  '@tailwindcss/*',
  '@radix-ui/*',
  'bootstrap',
  'react-bootstrap',
  '@chakra-ui/*',
  'antd',
  '@ant-design/*',
  '@mantine/*',
  'styled-components',
  '@vanilla-extract/*',
  'framer-motion',
  'motion',
  'apexcharts',
  'react-apexcharts',
  '@iconify/react',
  'simplebar-react',
  'sonner',
  'notistack',
  'minimal-shared',
  '@mui/lab',
];

function isForbidden(name) {
  return FORBIDDEN.some((rule) =>
    rule.endsWith('/*') ? name.startsWith(rule.slice(0, -1)) : name === rule,
  );
}

export function auditForbiddenLibraries(root) {
  const findings = [];
  const { apps, packages } = listWorkspacePackageDirs(root);

  for (const dir of [...apps, ...packages, root]) {
    const manifest = path.join(dir, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const pkg = readJson(manifest);
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies,
    };
    for (const name of Object.keys(deps)) {
      if (isForbidden(name)) findings.push(`${rel(root, manifest)} depends on forbidden ${name}`);
    }
  }

  return {
    name: 'forbidden libraries',
    ok: findings.length === 0,
    details:
      findings.length === 0
        ? 'No second styling, icon, chart, toast or animation systems in workspace manifests.'
        : findings.map((f) => `  - ${f}`).join('\n'),
  };
}
