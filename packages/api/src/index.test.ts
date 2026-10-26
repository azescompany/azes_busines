/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-20
 * ║ Purpose: Public export and boundary checks for @azes/api
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as api from './index';
import { apiQueryKeys } from './query/keys';

describe('@azes/api public API', () => {
  it('exports the hand-written foundation surface', () => {
    expect(api.azesMutator).toBeTypeOf('function');
    expect(api.configureApi).toBeTypeOf('function');
    expect(api.setAccessTokenGetter).toBeTypeOf('function');
    expect(api.setAccessTokenRefreshHandler).toBeTypeOf('function');
    expect(api.setAuthSessionInvalidatedHandler).toBeTypeOf('function');
    expect(api.setPaymentRequiredHandler).toBeTypeOf('function');
    expect(api.refreshAccessTokens).toBeTypeOf('function');
    expect(api.getOrCreateDeviceMeta).toBeTypeOf('function');
    expect(api.seedDeviceId).toBeTypeOf('function');
    expect(api.AzesApiError).toBeTypeOf('function');

    expect(api.apiQueryKeys.all).toEqual(['azes-api']);
    expect(api.apiQueryKeys.admin()).toEqual(['azes-api', 'admin']);
    expect(api.invalidateAdminQueries).toBeTypeOf('function');
    expect(api.apiQueryDefaultOptions.queries?.staleTime).toBe(30_000);
    expect(apiQueryKeys.resource('example')).toEqual(['azes-api', 'resource', 'example']);
  });

  it('does not depend on UI, state, or auth packages', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      exports?: Record<string, unknown>;
    };

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies,
    };

    expect(deps['@azes/ui-web']).toBeUndefined();
    expect(deps['@azes/ui-native']).toBeUndefined();
    expect(deps['@azes/state']).toBeUndefined();
    expect(deps['@azes/auth']).toBeUndefined();
    expect(deps['@tanstack/react-query']).toBeDefined();
    expect(packageJson.exports?.['.']).toBeDefined();
    expect(packageJson.exports?.['./admin']).toBeDefined();
  });

  // Dynamic admin facade import is heavy under parallel turbo workers.
  it('exposes ADMIN facade modules from src/admin', async () => {
    const admin = await import('./admin/index');
    expect(admin.usePostApiV1AccountsLogin).toBeTypeOf('function');
    expect(admin.useGetApiV1Roles).toBeTypeOf('function');
    expect(admin.useGetApiV1AdminbudgetOverdue).toBeTypeOf('function');
    expect(admin.useGetApiV1RolesMenus).toBeTypeOf('function');
    expect(admin.useGetApiV1RolesDropdown).toBeTypeOf('function');
  }, 60_000);
});
