/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/phase06Resolver.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Phase 06 — unified resolver, /me additive fields, menu≠mutation
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getResolverMode, setResolverMode } from '../src/access/effectiveAccess.js';
import { createMemoryEntitlementRepository } from '../src/access/entitlementRepository.js';
import { createApp } from '../src/app.js';
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
  deviceId: 'device-p06-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('Phase 06 Effective Access Resolver', () => {
  let passwordHash: string;
  const suiteStartMode = getResolverMode();

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
    setResolverMode('unified');
  });

  afterEach(() => {
    setResolverMode(suiteStartMode);
  });

  async function login(app: ReturnType<typeof createApp>, username: string) {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username,
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    return ((await res.json()) as { accessToken: string }).accessToken;
  }

  function makeApp(mode?: 'legacy' | 'unified') {
    const menuRepo = createMemoryMenuRepository();
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-oa',
          usernameNormalized: 'orgadmin.a',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
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
        'user-oa': ['orgAdmin'],
        'user-member': ['member'],
      },
    });
    const entitlementRepo = createMemoryEntitlementRepository({
      orgs: [{ id: 'org-a', subscriptionStatus: 'active' }],
      orgModules: [
        { orgId: 'org-a', moduleId: 'pmod-admin-core', status: 'active' },
        { orgId: 'org-a', moduleId: 'pmod-crm', status: 'active' },
      ],
    });
    return {
      menuRepo,
      app: createApp({
        authRepo,
        menuRepo,
        entitlementRepo,
        accessResolverMode: mode,
        platformRoleRepo: createMemoryPlatformRoleRepository(),
        orgRepo: createMemoryOrgRepository({
          organizations: [
            {
              id: 'org-a',
              name: 'Org A',
              slug: 'org-a',
              status: 'active',
              parentOrganizationId: null,
              createdBy: 'user-oa',
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

  it('GET /me returns additive modules, scopeSummary, accessVersion', async () => {
    const { app } = makeApp();
    const token = await login(app, 'orgadmin.a');
    const me = await app.request(
      '/api/v1/me',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(me.status).toBe(200);
    const body = (await me.json()) as {
      permissions: string[];
      modules: { code: string; enabled: boolean }[];
      scopeSummary: { dataScope: string; unitIds?: string[] } | null;
      accessVersion: number;
    };
    expect(body.modules.some((m) => m.code === 'crm' && m.enabled)).toBe(true);
    expect(body.scopeSummary).toEqual({ dataScope: 'org', unitIds: [] });
    expect(body.accessVersion).toBeGreaterThan(0);
    expect(body.permissions.length).toBeGreaterThan(0);

    const me2 = await app.request(
      '/api/v1/me',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    const body2 = (await me2.json()) as { accessVersion: number };
    expect(body2.accessVersion).toBe(body.accessVersion);
  });

  it('nav customers does not authorize CRM create (menu ≠ mutation)', async () => {
    const { app, menuRepo } = makeApp();
    await menuRepo.setUserAccess?.(
      'user-member',
      'org-a',
      ['menu-admin-customers'],
      [
        {
          menuId: 'menu-admin-customers',
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      ],
    );
    const token = await login(app, 'member.a');
    const me = await app.request(
      '/api/v1/me',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    const body = (await me.json()) as { permissions: string[]; nav: { id: string }[] };
    expect(body.nav.some((n) => n.id === 'customers')).toBe(true);
    expect(body.permissions).toContain('crm.customers.read');
    expect(body.permissions).not.toContain('crm.customers.create');

    const create = await app.request(
      '/api/v1/crm/customers',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Nope' }),
      },
      testEnv,
    );
    expect(create.status).toBe(403);
  });

  it('legacy mode keeps requirePermission + /me deny/allow aligned', async () => {
    const { app } = makeApp('legacy');
    expect(getResolverMode()).toBe('legacy');
    const token = await login(app, 'member.a');
    const me = await app.request(
      '/api/v1/me',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(me.status).toBe(200);
    const body = (await me.json()) as { accessVersion: number; modules: unknown[] };
    expect(body.accessVersion).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.modules)).toBe(true);

    const crm = await app.request(
      '/api/v1/crm/customers',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(crm.status).toBe(403);
  });
});
