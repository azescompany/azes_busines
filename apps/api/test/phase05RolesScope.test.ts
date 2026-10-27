/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/phase05RolesScope.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Phase 05 — overrides, delegation ceiling, SuperAdmin guard
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

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
  deviceId: 'device-p05-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('Phase 05 roles / overrides / ceiling', () => {
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
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
    const menuRepo = createMemoryMenuRepository();
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
        'user-sa': ['superAdmin'],
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

  it('user override grants CRM read into /me permissions', async () => {
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
    expect(me.status).toBe(200);
    const body = (await me.json()) as { permissions: string[]; nav: { id: string }[] };
    expect(body.permissions).toContain('crm.customers.read');
    expect(body.permissions).not.toContain('crm.customers.create');
    expect(body.nav.some((n) => n.id === 'customers')).toBe(true);

    const crm = await app.request(
      '/api/v1/crm/customers',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(crm.status).toBe(200);

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

  it('delegation ceiling blocks orgAdmin granting org.manage_all menu', async () => {
    const { app } = makeApp();
    const oa = await login(app, 'orgadmin.a');
    const res = await app.request(
      '/api/v1/users/user-member/access?orgId=org-a',
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${oa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          menuIds: ['menu-admin-role-menus'],
          permissions: [
            {
              menuId: 'menu-admin-role-menus',
              canRead: true,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
            },
          ],
        }),
      },
      testEnv,
    );
    expect(res.status).toBe(403);
  });

  it('cannot create superAdmin via platform-roles API', async () => {
    const { app } = makeApp();
    const sa = await login(app, 'super.admin');
    const res = await app.request(
      '/api/v1/platform-roles',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'superAdmin' }),
      },
      testEnv,
    );
    expect(res.status).toBe(400);
  });

  it('cannot rebind menus for superAdmin role', async () => {
    const { app } = makeApp();
    const sa = await login(app, 'super.admin');
    const res = await app.request(
      '/api/v1/roles/superAdmin/menus',
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ menuIds: ['menu-admin-home'] }),
      },
      testEnv,
    );
    expect(res.status).toBe(400);
  });
});
