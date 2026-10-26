/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/menuRoleRbac.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: TAGET M1.5 menu ↔ role binding + 403 tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryMenuRepository } from '../src/menu/repository.js';
import { createMemoryOrgRepository } from '../src/org/repository.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-menu-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('menu role RBAC', () => {
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
      ],
      rolesByUser: {
        'user-sa': ['superAdmin'],
        'user-oa': ['orgAdmin'],
      },
    });
    const menuRepo = createMemoryMenuRepository();
    return {
      app: createApp({
        authRepo,
        menuRepo,
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
      menuRepo,
    };
  }

  it('GET /me returns Admin nav for orgAdmin defaults', async () => {
    const { app } = makeApp();
    const token = await login(app, 'orgadmin.a');
    const res = await app.request(
      '/api/v1/me',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      nav: Array<{ id: string; path: string }>;
      permissions: string[];
    };
    expect(body.nav.map((n) => n.id)).toEqual(
      expect.arrayContaining(['home', 'organizations', 'users']),
    );
    expect(body.nav.map((n) => n.id)).not.toContain('role-menus');
    expect(body.permissions).toContain('org.manage');
    expect(body.permissions).not.toContain('org.manage_all');
  });

  it('unassigning organizations menu removes org.manage and blocks GET /orgs', async () => {
    const { app } = makeApp();
    const sa = await login(app, 'super.admin');

    const put = await app.request(
      '/api/v1/roles/orgAdmin/menus',
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
    expect(put.status).toBe(200);

    const oa = await login(app, 'orgadmin.a');
    const me = await app.request(
      '/api/v1/me',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    const meBody = (await me.json()) as {
      nav: Array<{ id: string }>;
      permissions: string[];
    };
    expect(meBody.nav.map((n) => n.id)).toEqual(['home']);
    expect(meBody.permissions).not.toContain('org.manage');

    const orgs = await app.request(
      '/api/v1/orgs',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(orgs.status).toBe(403);
  });

  it('M1.6 live authz: same JWT gets 403 after unassign without re-login', async () => {
    const { app } = makeApp();
    const oa = await login(app, 'orgadmin.a');

    const before = await app.request(
      '/api/v1/permission-profiles',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(before.status).toBe(200);

    const sa = await login(app, 'super.admin');
    const put = await app.request(
      '/api/v1/roles/orgAdmin/menus',
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
    expect(put.status).toBe(200);

    // Same access JWT may still claim org.manage — live DB requirePermission → 403
    const after = await app.request(
      '/api/v1/permission-profiles',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(after.status).toBe(403);
  });

  it('superAdmin lists menus and cannot rebind superAdmin role', async () => {
    const { app } = makeApp();
    const sa = await login(app, 'super.admin');
    const list = await app.request(
      '/api/v1/menus',
      { headers: { authorization: `Bearer ${sa}` } },
      testEnv,
    );
    expect(list.status).toBe(200);
    const body = (await list.json()) as { items: unknown[] };
    expect(body.items.length).toBeGreaterThanOrEqual(4);

    const bad = await app.request(
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
    expect(bad.status).toBe(400);
  });
});
