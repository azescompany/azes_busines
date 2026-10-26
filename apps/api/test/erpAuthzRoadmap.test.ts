/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/erpAuthzRoadmap.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: TAGET M2–M4 smoke — modules, hierarchy, CRM, audit, scope
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it, beforeEach } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { isOwnerVisible, normalizeDataScope } from '../src/auth/dataScope.js';
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
  deviceId: 'device-erp-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('ERP authz roadmap smoke', () => {
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
      lmsRepo: createMemoryLmsRepository({ courses: [], curriculum: {} }),
      lmsMutations: createMemoryLmsMutations({ courses: [], curriculum: {} }),
    });
  }

  it('M2: SuperAdmin lists platform modules', async () => {
    const app = makeApp();
    const sa = await login(app, 'super.admin');
    const res = await app.request(
      '/api/v1/modules',
      { headers: { authorization: `Bearer ${sa}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { code: string }[] };
    expect(body.items.some((i) => i.code === 'admin-core')).toBe(true);
  });

  it('M2.5: orgAdmin cannot create root org; SuperAdmin can', async () => {
    const app = makeApp();
    const oa = await login(app, 'orgadmin.a');
    const denied = await app.request(
      '/api/v1/orgs',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${oa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Root Fail', slug: 'root-fail' }),
      },
      testEnv,
    );
    expect(denied.status).toBe(403);

    const sa = await login(app, 'super.admin');
    const ok = await app.request(
      '/api/v1/orgs',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Root Ok', slug: 'root-ok' }),
      },
      testEnv,
    );
    expect(ok.status).toBe(201);
  });

  it('M3: orgAdmin lists permission profiles', async () => {
    const app = makeApp();
    const oa = await login(app, 'orgadmin.a');
    const res = await app.request(
      '/api/v1/permission-profiles',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
  });

  it('M3.5: data scope helpers', () => {
    expect(normalizeDataScope('own')).toBe('own');
    expect(normalizeDataScope(undefined)).toBe('org');
    expect(isOwnerVisible('own', 'u1', 'u2')).toBe(false);
    expect(isOwnerVisible('own', 'u1', 'u1')).toBe(true);
    expect(isOwnerVisible('org', 'u1', 'u2')).toBe(true);
  });

  it('M4: CRM customers + audit logs require authz', async () => {
    const app = makeApp();
    const oa = await login(app, 'orgadmin.a');
    const list = await app.request(
      '/api/v1/crm/customers',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(list.status).toBe(200);

    const sa = await login(app, 'super.admin');
    const audit = await app.request(
      '/api/v1/audit-logs',
      { headers: { authorization: `Bearer ${sa}` } },
      testEnv,
    );
    expect(audit.status).toBe(200);

    const denied = await app.request(
      '/api/v1/audit-logs',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(denied.status).toBe(403);
  });
});
