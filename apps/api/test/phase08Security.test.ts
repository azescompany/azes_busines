/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/phase08Security.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Phase 08 — security acceptance smoke (matrix AUTO anchors)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  getResolverMode,
  initResolverModeFromEnv,
  setResolverMode,
} from '../src/access/effectiveAccess.js';
import { createMemoryEntitlementRepository } from '../src/access/entitlementRepository.js';
import { createApp } from '../src/app.js';
import { claimHasPermission } from '../src/auth/permissions.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryMenuRepository } from '../src/menu/repository.js';
import { createMemoryOrgRepository } from '../src/org/repository.js';
import { createMemoryPlatformRoleRepository } from '../src/org/platformRoles.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-p08-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

/**
 * Anchors for SECURITY_MATRIX.md AUTO cases that must not regress.
 * Full case map lives in docs — this file only locks Phase 08 deprecation semantics
 * and modules-update path (audit no-ops without DB).
 */
describe('Phase 08 security acceptance', () => {
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
    setResolverMode('unified');
  });

  async function login(app: ReturnType<typeof createApp>, username: string) {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password: 'LocalDevPass123!', ...deviceBody }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    return ((await res.json()) as { accessToken: string }).accessToken;
  }

  function makeApp() {
    const entitlementRepo = createMemoryEntitlementRepository({
      orgs: [{ id: 'org-a', subscriptionStatus: 'active' }],
      orgModules: [
        { orgId: 'org-a', moduleId: 'pmod-admin-core', status: 'active' },
        { orgId: 'org-a', moduleId: 'pmod-crm', status: 'active' },
      ],
    });
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-sa',
          usernameNormalized: 'super.admin',
          passwordHash,
          status: 'active',
          orgId: null,
        },
        {
          id: 'user-member',
          usernameNormalized: 'member.a',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
        },
      ],
      rolesByUser: {
        'user-sa': ['superAdmin'],
        'user-member': ['member'],
      },
    });
    return {
      entitlementRepo,
      app: createApp({
        authRepo,
        menuRepo: createMemoryMenuRepository(),
        entitlementRepo,
        platformRoleRepo: createMemoryPlatformRoleRepository(),
        orgRepo: createMemoryOrgRepository({
          organizations: [
            {
              id: 'org-a',
              name: 'Org A',
              slug: 'org-a',
              status: 'active',
              parentOrganizationId: null,
              createdBy: 'user-sa',
              createdAt: 1,
              updatedAt: 1,
            },
          ],
        }),
        lmsRepo: createMemoryLmsRepository({ courses: [], curriculum: {} }),
        lmsMutations: createMemoryLmsMutations({ courses: [], curriculum: {} }),
      }),
    };
  }

  it('JWT permissions[] claim is not authoritative (matrix #19 / AC-D05)', () => {
    expect(
      claimHasPermission(
        { roles: ['member'], permissions: ['org.manage_all', 'crm.customers.create'] },
        'org.manage_all',
      ),
    ).toBe(false);
  });

  it('legacy resolver mode remains a rollback alias (same default deny)', async () => {
    initResolverModeFromEnv({ ACCESS_RESOLVER_MODE: 'legacy' });
    expect(getResolverMode()).toBe('legacy');
    const { app } = makeApp();
    const token = await login(app, 'member.a');
    const crm = await app.request(
      '/api/v1/crm/customers',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(crm.status).toBe(403);
  });

  it('modules PUT succeeds for SuperAdmin without throwing (audit path wired)', async () => {
    const { app, entitlementRepo } = makeApp();
    const sa = await login(app, 'super.admin');
    const res = await app.request(
      '/api/v1/orgs/org-a/modules',
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ moduleIds: ['pmod-admin-core'] }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    expect(await entitlementRepo.isModuleActiveForOrg('org-a', 'crm')).toBe(false);
  });

  it('unauthenticated protected route rejects (matrix #1)', async () => {
    const { app } = makeApp();
    const res = await app.request('/api/v1/me', {}, testEnv);
    expect(res.status).toBe(401);
  });
});
