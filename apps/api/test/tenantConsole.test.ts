/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/tenantConsole.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: M5.0-lite org subscription + users + roles smoke
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryMenuRepository } from '../src/menu/repository.js';
import { createMemoryOrgRepository } from '../src/org/repository.js';
import { createMemoryPlatformRoleRepository } from '../src/org/platformRoles.js';
import { createMemoryPlatformUserRepository } from '../src/org/platformUsers.js';
import { createMemoryTenantRepository } from '../src/org/tenantRepository.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-tenant-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('Tenant console M5.0-lite', () => {
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
    return createApp({
      authRepo,
      menuRepo: createMemoryMenuRepository(),
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
      tenantRepo: createMemoryTenantRepository({
        orgs: [{ id: 'org-a', name: 'Org A', slug: 'org-a', status: 'active' }],
        memberships: [
          {
            id: 'm-oa',
            orgId: 'org-a',
            userId: 'user-oa',
            role: 'orgAdmin',
            status: 'active',
            username: 'orgadmin.a',
          },
        ],
      }),
      platformUserRepo: createMemoryPlatformUserRepository(),
      platformRoleRepo: createMemoryPlatformRoleRepository(),
    });
  }

  it('SuperAdmin creates org with color + trial + can block subscription', async () => {
    const app = makeApp();
    const token = await login(app, 'super.admin');
    const created = await app.request(
      '/api/v1/orgs',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Color Org',
          description: 'Demo',
          colorCode: '#16A34A',
        }),
      },
      testEnv,
    );
    expect(created.status).toBe(201);
    const org = (await created.json()) as {
      id: string;
      colorCode: string;
      subscriptionStatus: string;
      trialEndsAt: number;
      description: string;
    };
    expect(org.colorCode).toBe('#16A34A');
    expect(org.subscriptionStatus).toBe('active');
    expect(org.description).toBe('Demo');
    expect(org.trialEndsAt).toBeGreaterThan(0);

    const patched = await app.request(
      `/api/v1/orgs/${org.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ subscriptionStatus: 'blocked' }),
      },
      testEnv,
    );
    expect(patched.status).toBe(200);
    await expect(patched.json()).resolves.toMatchObject({ subscriptionStatus: 'blocked' });
  });

  it('SuperAdmin creates orgAdmin user; orgAdmin create forces member', async () => {
    const app = makeApp();
    const sa = await login(app, 'super.admin');
    const adminRes = await app.request(
      '/api/v1/users',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          username: 'new.admin',
          password: 'LocalDevPass123!',
          orgId: 'org-a',
          roleName: 'orgAdmin',
        }),
      },
      testEnv,
    );
    expect(adminRes.status).toBe(201);
    await expect(adminRes.json()).resolves.toMatchObject({ roleName: 'orgAdmin' });

    const oa = await login(app, 'orgadmin.a');
    const memberRes = await app.request(
      '/api/v1/users',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${oa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          username: 'new.member',
          password: 'LocalDevPass123!',
          orgId: 'org-a',
          roleName: 'orgAdmin',
        }),
      },
      testEnv,
    );
    expect(memberRes.status).toBe(201);
    await expect(memberRes.json()).resolves.toMatchObject({ roleName: 'member' });
  });

  it('SuperAdmin can create elastic platform role', async () => {
    const app = makeApp();
    const token = await login(app, 'super.admin');
    const res = await app.request(
      '/api/v1/platform-roles',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'agent' }),
      },
      testEnv,
    );
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({ name: 'agent', system: false });

    const oa = await login(app, 'orgadmin.a');
    const denied = await app.request(
      '/api/v1/platform-roles',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${oa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'teacher' }),
      },
      testEnv,
    );
    expect(denied.status).toBe(403);
  });
});
