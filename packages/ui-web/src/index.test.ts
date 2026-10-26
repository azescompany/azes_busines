/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Public API export smoke test
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as ui from './index';

describe('@azes/ui-web public API', () => {
  it('exports the Phase 4 starter set', () => {
    expect(ui.AzesThemeProvider).toBeTypeOf('function');
    expect(ui.Box).toBeTypeOf('object');
    expect(ui.Stack).toBeTypeOf('object');
    expect(ui.Text).toBeTypeOf('object');
    expect(ui.Button).toBeTypeOf('object');
    expect(ui.createAzesTheme).toBeTypeOf('function');
    expect(ui.Container).toBeTypeOf('object');
    expect(ui.Grid).toBeTypeOf('object');
  });

  it('depends on design-tokens and does not depend on api/state/auth', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };

    expect(packageJson.dependencies?.['@azes/design-tokens']).toBeDefined();
    expect(packageJson.dependencies?.['@mui/material']).toBeDefined();
    expect(packageJson.dependencies?.['@radix-ui/react-slot']).toBeUndefined();
    expect(packageJson.dependencies?.['@azes/api']).toBeUndefined();
    expect(packageJson.dependencies?.['@azes/state']).toBeUndefined();
    expect(packageJson.dependencies?.['@azes/auth']).toBeUndefined();
    expect(packageJson.peerDependencies?.react).toBeDefined();
  });
});
