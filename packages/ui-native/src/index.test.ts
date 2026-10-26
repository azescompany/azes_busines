/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Public export surface checks for @azes/ui-native
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as uiNative from './index.js';

describe('@azes/ui-native public API', () => {
  it('exports the Phase 5 starter set', () => {
    expect(uiNative.ThemeProvider).toBeTypeOf('function');
    expect(uiNative.useTheme).toBeTypeOf('function');
    expect(uiNative.Box).toBeTypeOf('object');
    expect(uiNative.Stack).toBeTypeOf('object');
    expect(uiNative.Text).toBeTypeOf('object');
    expect(uiNative.Button).toBeTypeOf('object');
  });

  it('does not depend on ui-web, api, or state', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies,
    };

    expect(deps['@azes/ui-web']).toBeUndefined();
    expect(deps['@azes/api']).toBeUndefined();
    expect(deps['@azes/state']).toBeUndefined();
    expect(deps['@azes/auth']).toBeUndefined();
    expect(deps['@azes/design-tokens']).toBeDefined();
  });
});
