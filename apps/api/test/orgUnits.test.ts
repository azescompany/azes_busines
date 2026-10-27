/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/orgUnits.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Organization Unit CRUD + isolation (AC-D02 A / Phase 03)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryOrgRepository } from '../src/org/repository.js';
import { createMemoryTenantRepository } from '../src/org/tenantRepository.js';
import { createMemoryUnitRepository } from '../src/org/unitRepository.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-units-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('organization units (AC-D02 A)', () => {
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
          id: 'user-oa-a',
          usernameNormalized: 'orgadmin.a',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
        },
        {
          id: 'user-oa-b',
          usernameNormalized: 'orgadmin.b',
          passwordHash,
          status: 'active',
          orgId: 'org-b',
        },
        {
          id: 'user-member-a',
          usernameNormalized: 'member.a',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
        },
      ],
      rolesByUser: {
        'user-oa-a': ['orgAdmin'],
        'user-oa-b': ['orgAdmin'],
        'user-member-a': ['member'],
      },
    });

    const orgRepo = createMemoryOrgRepository({
      organizations: [
        {
          id: 'org-a',
          name: 'Org A',
          slug: 'org-a',
          status: 'active',
          parentOrganizationId: null,
          createdBy: 'user-oa-a',
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: 'org-b',
          name: 'Org B',
          slug: 'org-b',
          status: 'active',
          parentOrganizationId: null,
          createdBy: 'user-oa-b',
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    });

    const tenantRepo = createMemoryTenantRepository({
      orgs: [
        { id: 'org-a', name: 'Org A', slug: 'org-a', status: 'active' },
        { id: 'org-b', name: 'Org B', slug: 'org-b', status: 'active' },
      ],
      memberships: [
        {
          orgId: 'org-a',
          userId: 'user-oa-a',
          username: 'orgadmin.a',
          role: 'orgAdmin',
        },
        {
          orgId: 'org-b',
          userId: 'user-oa-b',
          username: 'orgadmin.b',
          role: 'orgAdmin',
        },
        {
          orgId: 'org-a',
          userId: 'user-member-a',
          username: 'member.a',
          role: 'member',
        },
      ],
      activeOrgByUser: {
        'user-oa-a': 'org-a',
        'user-oa-b': 'org-b',
        'user-member-a': 'org-a',
      },
    });

    return createApp({
      authRepo,
      orgRepo,
      tenantRepo,
      unitRepo: createMemoryUnitRepository(),
      lmsRepo: createMemoryLmsRepository({ courses: [], curriculum: {} }),
      lmsMutations: createMemoryLmsMutations({ courses: [], curriculum: {} }),
    });
  }

  it('creates and lists units inside own org', async () => {
    const app = makeApp();
    const token = await login(app, 'orgadmin.a');
    const create = await app.request(
      '/api/v1/orgs/org-a/units',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Baku Branch', code: 'baku', kind: 'branch' }),
      },
      testEnv,
    );
    expect(create.status).toBe(201);
    const unit = (await create.json()) as { id: string; orgId: string; code: string };
    expect(unit.orgId).toBe('org-a');
    expect(unit.code).toBe('baku');

    const list = await app.request(
      '/api/v1/orgs/org-a/units',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(list.status).toBe(200);
    const body = (await list.json()) as { items: Array<{ id: string }> };
    expect(body.items.some((i) => i.id === unit.id)).toBe(true);
  });

  it('assigns unit membership only for active org members', async () => {
    const app = makeApp();
    const token = await login(app, 'orgadmin.a');
    const create = await app.request(
      '/api/v1/orgs/org-a/units',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Sales', code: 'sales', kind: 'department' }),
      },
      testEnv,
    );
    const unit = (await create.json()) as { id: string };

    const bad = await app.request(
      `/api/v1/orgs/org-a/units/${unit.id}/members`,
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user-oa-b', role: 'member' }),
      },
      testEnv,
    );
    expect(bad.status).toBe(400);

    const ok = await app.request(
      `/api/v1/orgs/org-a/units/${unit.id}/members`,
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user-member-a', role: 'manager' }),
      },
      testEnv,
    );
    expect(ok.status).toBe(200);
    const member = (await ok.json()) as { userId: string; role: string };
    expect(member.userId).toBe('user-member-a');
    expect(member.role).toBe('manager');
  });

  it('blocks cross-tenant unit list (IDOR)', async () => {
    const app = makeApp();
    const tokenA = await login(app, 'orgadmin.a');
    await app.request(
      '/api/v1/orgs/org-a/units',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${tokenA}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Secret', code: 'secret', kind: 'team' }),
      },
      testEnv,
    );

    const tokenB = await login(app, 'orgadmin.b');
    const res = await app.request(
      '/api/v1/orgs/org-a/units',
      { headers: { authorization: `Bearer ${tokenB}` } },
      testEnv,
    );
    expect(res.status).toBe(403);
  });

  it('does not treat child org as a unit — units are separate resources', async () => {
    const app = makeApp();
    const token = await login(app, 'orgadmin.a');
    const list = await app.request(
      '/api/v1/orgs/org-a/units',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(list.status).toBe(200);
    await expect(list.json()).resolves.toEqual({ items: [] });
  });
});
