/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Public export and dependency-boundary checks for @azes/auth
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as auth from './index.js';

describe('@azes/auth public API', () => {
  it('exports the foundation surface', () => {
    expect(auth.createAuthClient).toBeTypeOf('function');
    expect(auth.connectAuthToApi).toBeTypeOf('function');
    expect(auth.createWebAuthAdapter).toBeTypeOf('function');
    expect(auth.createNativeAuthAdapter).toBeTypeOf('function');
    expect(auth.createMemorySecureStorage).toBeTypeOf('function');
    expect(auth.AuthProvider).toBeTypeOf('function');
    expect(auth.useAuthSession).toBeTypeOf('function');
    expect(auth.useAuthSessionReady).toBeTypeOf('function');
    expect(auth.decodeAccessToken).toBeTypeOf('function');
    expect(auth.sessionFromTokens).toBeTypeOf('function');
    expect(auth.roleFlagsFromClaims).toBeTypeOf('function');
  });

  it('does not depend on UI, api, or state packages', () => {
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
    expect(deps['@azes/ui-native']).toBeUndefined();
    expect(deps['@azes/api']).toBeUndefined();
    expect(deps['@azes/state']).toBeUndefined();
    expect(deps['@tanstack/react-query']).toBeUndefined();
    expect(deps['@reduxjs/toolkit']).toBeUndefined();
  });
});
