/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Public export and dependency-boundary checks for @azes/state
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as state from './index';

describe('@azes/state public API', () => {
  it('exports the foundation surface', () => {
    expect(state.createAzesStore).toBeTypeOf('function');
    expect(state.AzesStoreProvider).toBeTypeOf('function');
    expect(state.useAppDispatch).toBeTypeOf('function');
    expect(state.useAppSelector).toBeTypeOf('function');
    expect(state.setTheme).toBeTypeOf('function');
    expect(state.selectThemePreference).toBeTypeOf('function');
    expect(state.createMemoryStorageAdapter).toBeTypeOf('function');
    expect(state.createWebStorageAdapter).toBeTypeOf('function');
    expect(state.loadPersistedPreferences).toBeTypeOf('function');
    expect(state.MUST_NOT_ENTER_REDUX.length).toBeGreaterThan(0);
    expect(state.REDUX_MAY_OWN.length).toBeGreaterThan(0);
  });

  it('depends on Redux Toolkit and not on @azes/api or UI packages', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies,
    };

    expect(deps['@reduxjs/toolkit']).toBeDefined();
    expect(deps['react-redux']).toBeDefined();
    expect(deps['@azes/api']).toBeUndefined();
    expect(deps['@tanstack/react-query']).toBeUndefined();
    expect(deps['@azes/ui-web']).toBeUndefined();
    expect(deps['@azes/ui-native']).toBeUndefined();
    expect(deps['@azes/auth']).toBeUndefined();
  });
});
