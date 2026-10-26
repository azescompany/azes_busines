/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/tenantMembership.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: TAGET M1 tenant membership / invite / isolation tests
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

describe('tenant membership / invite / isolation', () => {
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
          id: 'user-multi',
          usernameNormalized: 'multi.member',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
        },
      ],
      rolesByUser: {
        'user-sa': ['superAdmin'],
        'user-oa-a': ['orgAdmin'],
        'user-oa-b': ['orgAdmin'],
        'user-multi': ['orgAdmin'],
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
              createdBy: 'user-sa',
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: 'org-b',
          name: 'Org B',
          slug: 'org-b',
          status: 'active',
              parentOrganizationId: null,
              createdBy: 'user-sa',
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
          userId: 'user-multi',
          username: 'multi.member',
          role: 'orgAdmin',
        },
        {
          orgId: 'org-b',
          userId: 'user-multi',
          username: 'multi.member',
          role: 'instructor',
        },
      ],
      activeOrgByUser: {
        'user-oa-a': 'org-a',
        'user-oa-b': 'org-b',
        'user-multi': 'org-a',
      },
    });

    return createApp({
      authRepo,
      orgRepo,
      tenantRepo,
      lmsRepo: createMemoryLmsRepository({ courses: [], curriculum: {} }),
      lmsMutations: createMemoryLmsMutations({ courses: [], curriculum: {} }),
    });
  }

  it('lists memberships for multi-org user', async () => {
    const app = makeApp();
    const token = await login(app, 'multi.member');
    const res = await app.request(
      '/api/v1/me/organizations',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ orgId: string; isActive: boolean }> };
    expect(body.items).toHaveLength(2);
    expect(body.items.find((i) => i.orgId === 'org-a')?.isActive).toBe(true);
  });

  it('switches active organization and returns new tokens', async () => {
    const app = makeApp();
    const token = await login(app, 'multi.member');
    const res = await app.request(
      '/api/v1/me/active-organization',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ orgId: 'org-b' }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      orgId: string;
      accessToken: string;
      role: string;
    };
    expect(body.orgId).toBe('org-b');
    expect(body.role).toBe('instructor');
    expect(body.accessToken).toBeTruthy();

    const me = await app.request(
      '/api/v1/me',
      { headers: { authorization: `Bearer ${body.accessToken}` } },
      testEnv,
    );
    const meBody = (await me.json()) as { orgId: string; roles: string[] };
    expect(meBody.orgId).toBe('org-b');
    expect(meBody.roles).toContain('instructor');
  });

  it('blocks OrgAdmin A from listing Org B members', async () => {
    const app = makeApp();
    const token = await login(app, 'orgadmin.a');
    const res = await app.request(
      '/api/v1/orgs/org-b/members',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(403);
  });

  it('allows OrgAdmin A to list own members', async () => {
    const app = makeApp();
    const token = await login(app, 'orgadmin.a');
    const res = await app.request(
      '/api/v1/orgs/org-a/members',
      { headers: { authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: unknown[] };
    expect(body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('invite + accept creates membership in second org', async () => {
    const app = makeApp();
    const sa = await login(app, 'super.admin');

    // SuperAdmin can invite into org-b (manage_all)
    const inviteRes = await app.request(
      '/api/v1/orgs/org-b/invitations',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: 'new.user@example.com', role: 'student' }),
      },
      testEnv,
    );
    expect(inviteRes.status).toBe(201);
    const invite = (await inviteRes.json()) as { token: string };

    const acceptRes = await app.request(
      '/api/v1/invitations/accept',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token: invite.token,
          password: 'LocalDevPass123!',
          username: 'new.user',
        }),
      },
      testEnv,
    );
    expect(acceptRes.status).toBe(201);
    const accepted = (await acceptRes.json()) as { orgId: string; accessToken: string };
    expect(accepted.orgId).toBe('org-b');

    const orgs = await app.request(
      '/api/v1/me/organizations',
      { headers: { authorization: `Bearer ${accepted.accessToken}` } },
      testEnv,
    );
    const orgsBody = (await orgs.json()) as { items: Array<{ orgId: string }> };
    expect(orgsBody.items.some((i) => i.orgId === 'org-b')).toBe(true);
  });

  it('rejects invite accept with reused token', async () => {
    const app = makeApp();
    const sa = await login(app, 'super.admin');
    const inviteRes = await app.request(
      '/api/v1/orgs/org-a/invitations',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${sa}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: 'once@example.com', role: 'instructor' }),
      },
      testEnv,
    );
    const invite = (await inviteRes.json()) as { token: string };

    const first = await app.request(
      '/api/v1/invitations/accept',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token: invite.token,
          password: 'LocalDevPass123!',
          username: 'once.user',
        }),
      },
      testEnv,
    );
    expect(first.status).toBe(201);

    const second = await app.request(
      '/api/v1/invitations/accept',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token: invite.token,
          password: 'LocalDevPass123!',
          username: 'once.user',
        }),
      },
      testEnv,
    );
    expect(second.status).toBe(409);
  });

  it('blocks switching to org without membership', async () => {
    const app = makeApp();
    const token = await login(app, 'orgadmin.a');
    const res = await app.request(
      '/api/v1/me/active-organization',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ orgId: 'org-b' }),
      },
      testEnv,
    );
    expect(res.status).toBe(403);
  });
});
