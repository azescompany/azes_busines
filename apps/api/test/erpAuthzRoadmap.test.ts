/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/erpAuthzRoadmap.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: TAGET M2–M4 + Phase 04 entitlement / subscription smoke
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it, beforeEach } from 'vitest';

import { createMemoryEntitlementRepository } from '../src/access/entitlementRepository.js';
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

  function makeApp(opts?: { entitlement?: ReturnType<typeof createMemoryEntitlementRepository> }) {
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

    const entitlementRepo =
      opts?.entitlement ??
      createMemoryEntitlementRepository({
        orgs: [{ id: 'org-a', subscriptionStatus: 'active', subscriptionReadOnly: false }],
        orgModules: [
          { orgId: 'org-a', moduleId: 'pmod-admin-core', status: 'active' },
          { orgId: 'org-a', moduleId: 'pmod-crm', status: 'active' },
        ],
      });

    return createApp({
      authRepo,
      menuRepo: createMemoryMenuRepository(),
      entitlementRepo,
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
            subscriptionStatus: 'active',
            subscriptionReadOnly: false,
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

  it('Phase 04: orgAdmin cannot activate org modules (org.manage_all only)', async () => {
    const app = makeApp();
    const oa = await login(app, 'orgadmin.a');
    const res = await app.request(
      '/api/v1/orgs/org-a/modules',
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${oa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ moduleIds: ['pmod-crm'] }),
      },
      testEnv,
    );
    expect(res.status).toBe(403);
  });

  it('Phase 04: disabled CRM module denies CRM API; soft-disable keeps assignment row', async () => {
    const entitlement = createMemoryEntitlementRepository({
      orgs: [{ id: 'org-a', subscriptionStatus: 'active' }],
      orgModules: [
        { orgId: 'org-a', moduleId: 'pmod-admin-core', status: 'active' },
        { orgId: 'org-a', moduleId: 'pmod-crm', status: 'active' },
      ],
    });
    const app = makeApp({ entitlement });
    const sa = await login(app, 'super.admin');

    const disable = await app.request(
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
    expect(disable.status).toBe(200);

    // Soft-disable: CRM still listed as inactive assignment (not hard-deleted)
    expect(await entitlement.isModuleActiveForOrg('org-a', 'crm')).toBe(false);

    const oa = await login(app, 'orgadmin.a');
    const crm = await app.request(
      '/api/v1/crm/customers',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(crm.status).toBe(403);

    // Re-enable without inventing a new row id — same pmod-crm
    const enable = await app.request(
      '/api/v1/orgs/org-a/modules',
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ moduleIds: ['pmod-admin-core', 'pmod-crm'] }),
      },
      testEnv,
    );
    expect(enable.status).toBe(200);
    expect(await entitlement.isModuleActiveForOrg('org-a', 'crm')).toBe(true);
  });

  it('Phase 04: blocked subscription denies CRM', async () => {
    const entitlement = createMemoryEntitlementRepository({
      orgs: [{ id: 'org-a', subscriptionStatus: 'blocked' }],
      orgModules: [{ orgId: 'org-a', moduleId: 'pmod-crm', status: 'active' }],
    });
    const app = makeApp({ entitlement });
    const oa = await login(app, 'orgadmin.a');
    const crm = await app.request(
      '/api/v1/crm/customers',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(crm.status).toBe(403);
  });

  it('Phase 04: read-only subscription allows CRM GET but denies POST', async () => {
    const entitlement = createMemoryEntitlementRepository({
      orgs: [{ id: 'org-a', subscriptionStatus: 'active', subscriptionReadOnly: true }],
      orgModules: [{ orgId: 'org-a', moduleId: 'pmod-crm', status: 'active' }],
    });
    const app = makeApp({ entitlement });
    const oa = await login(app, 'orgadmin.a');

    const list = await app.request(
      '/api/v1/crm/customers',
      { headers: { authorization: `Bearer ${oa}` } },
      testEnv,
    );
    expect(list.status).toBe(200);

    const create = await app.request(
      '/api/v1/crm/customers',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${oa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Acme' }),
      },
      testEnv,
    );
    expect(create.status).toBe(403);
  });
});
