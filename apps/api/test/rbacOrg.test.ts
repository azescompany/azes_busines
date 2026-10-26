/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/rbacOrg.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: M1b RBAC / Org / Track cross-org tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { can, normalizeRoleName, permissionsForRoles } from '../src/auth/permissions.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryOrgRepository } from '../src/org/repository.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-rbac-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('permissions helpers', () => {
  it('maps legacy admin to orgAdmin (not superAdmin)', () => {
    expect(normalizeRoleName('admin')).toBe('orgAdmin');
    expect(can(['admin'], 'org.manage')).toBe(true);
    expect(can(['admin'], 'org.create')).toBe(false);
  });

  it('instructor has track.write but not org.create', () => {
    const perms = permissionsForRoles(['instructor']);
    expect(perms).toContain('track.write');
    expect(perms).not.toContain('org.create');
  });

  it('staff roles include personal learn/progress permissions', () => {
    for (const role of ['superAdmin', 'orgAdmin', 'instructor'] as const) {
      const perms = permissionsForRoles([role]);
      expect(perms).toContain('course.learn');
      expect(perms).toContain('progress.read_own');
    }
  });
});

describe('org / track APIs', () => {
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
          id: 'user-ins-a',
          usernameNormalized: 'instructor.a',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
        },
        {
          id: 'user-ins-b',
          usernameNormalized: 'instructor.b',
          passwordHash,
          status: 'active',
          orgId: 'org-b',
        },
        {
          id: 'user-stu-a',
          usernameNormalized: 'student.a',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
        },
      ],
      rolesByUser: {
        'user-sa': ['superAdmin'],
        'user-oa-a': ['orgAdmin'],
        'user-ins-a': ['instructor'],
        'user-ins-b': ['instructor'],
        'user-stu-a': ['student'],
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
    const courses: never[] = [];
    const curriculum: Record<string, never[]> = {};
    return createApp({
      authRepo,
      orgRepo,
      lmsRepo: createMemoryLmsRepository({ courses, curriculum }),
      lmsMutations: createMemoryLmsMutations({ courses, curriculum }),
    });
  }

  it('superAdmin creates organization', async () => {
    const app = makeApp();
    const token = await login(app, 'super.admin');
    const res = await app.request(
      '/api/v1/orgs',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Yeni Məktəb', slug: 'yeni-mekteb' }),
      },
      testEnv,
    );
    expect(res.status).toBe(201);
    const org = (await res.json()) as { slug: string };
    expect(org.slug).toBe('yeni-mekteb');
  });

  it('superAdmin lists tracks without orgId (platform-wide)', async () => {
    const app = makeApp();
    const tokenIns = await login(app, 'instructor.a');
    const created = await app.request(
      '/api/v1/tracks',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenIns}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Platform list seed' }),
      },
      testEnv,
    );
    expect(created.status).toBe(201);

    const tokenSa = await login(app, 'super.admin');
    const list = await app.request(
      '/api/v1/tracks',
      { headers: { Authorization: `Bearer ${tokenSa}` } },
      testEnv,
    );
    expect(list.status).toBe(200);
    const body = (await list.json()) as { items: { name: string }[] };
    expect(body.items.some((t) => t.name === 'Platform list seed')).toBe(true);
  });

  it('instructor creates track in own org; cannot list other org tracks', async () => {
    const app = makeApp();
    const tokenA = await login(app, 'instructor.a');
    const created = await app.request(
      '/api/v1/tracks',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenA}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: '5-ci sinif' }),
      },
      testEnv,
    );
    expect(created.status).toBe(201);

    const tokenB = await login(app, 'instructor.b');
    const cross = await app.request(
      '/api/v1/tracks?orgId=org-a',
      { headers: { Authorization: `Bearer ${tokenB}` } },
      testEnv,
    );
    expect(cross.status).toBe(403);
  });

  it('GET /me includes permissions and orgId for instructor', async () => {
    const app = makeApp();
    const token = await login(app, 'instructor.a');
    const res = await app.request(
      '/api/v1/me',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const me = (await res.json()) as {
      role: string;
      orgId: string | null;
      permissions: string[];
      nav: { id: string; path: string; i18nKey: string }[];
    };
    expect(me.role).toBe('instructor');
    expect(me.orgId).toBe('org-a');
    expect(me.permissions).toContain('track.write');
    expect(me.nav.some((n) => n.id === 'home')).toBe(true);
    expect(me.nav.some((n) => n.id === 'organizations')).toBe(false);
    expect(me.nav.some((n) => n.id === 'role-menus')).toBe(false);
  });

  it('GET /me nav differs for superAdmin vs student (Admin menus M1.5)', async () => {
    const app = makeApp();
    const saToken = await login(app, 'super.admin');
    const saRes = await app.request(
      '/api/v1/me',
      { headers: { Authorization: `Bearer ${saToken}` } },
      testEnv,
    );
    expect(saRes.status).toBe(200);
    const sa = (await saRes.json()) as { nav: { id: string }[] };
    expect(sa.nav.some((n) => n.id === 'organizations')).toBe(true);
    expect(sa.nav.some((n) => n.id === 'role-menus')).toBe(true);
    expect(sa.nav.some((n) => n.id === 'home')).toBe(true);

    const stuToken = await login(app, 'student.a');
    const stuRes = await app.request(
      '/api/v1/me',
      { headers: { Authorization: `Bearer ${stuToken}` } },
      testEnv,
    );
    expect(stuRes.status).toBe(200);
    const stu = (await stuRes.json()) as { nav: { id: string }[] };
    expect(stu.nav.some((n) => n.id === 'home')).toBe(true);
    expect(stu.nav.some((n) => n.id === 'organizations')).toBe(false);
    expect(stu.nav.some((n) => n.id === 'role-menus')).toBe(false);
  });

  it('superAdmin can PATCH org status; instructor cannot', async () => {
    const app = makeApp();
    const saToken = await login(app, 'super.admin');
    const patch = await app.request(
      '/api/v1/orgs/org-a',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${saToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ status: 'disabled' }),
      },
      testEnv,
    );
    expect(patch.status).toBe(200);
    const body = (await patch.json()) as { status: string };
    expect(body.status).toBe('disabled');

    const instToken = await login(app, 'instructor.a');
    const forbidden = await app.request(
      '/api/v1/orgs/org-a',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${instToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' }),
      },
      testEnv,
    );
    expect(forbidden.status).toBe(403);
  });

  it('superAdmin can create OrgAdmin via memory repo; student cannot list', async () => {
    const { createMemoryOrgAdminRepository } = await import('../src/org/orgAdmins.js');
    const orgAdminRepo = createMemoryOrgAdminRepository({
      orgNames: { 'org-a': 'Org A' },
    });
    const app = createApp({
      authRepo: createMemoryAuthRepository({
        users: [
          {
            id: 'user-sa',
            usernameNormalized: 'super.admin',
            passwordHash,
            status: 'active',
            orgId: null,
          },
          {
            id: 'user-stu',
            usernameNormalized: 'student.a',
            passwordHash,
            status: 'active',
            orgId: 'org-a',
          },
        ],
        rolesByUser: {
          'user-sa': ['superAdmin'],
          'user-stu': ['student'],
        },
      }),
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
      orgAdminRepo,
      platformOverview: {
        organizationCount: 1,
        activeOrganizationCount: 1,
        userCount: 2,
        instructorCount: 0,
        studentCount: 1,
        orgAdminCount: 0,
        publishedCourseCount: 0,
        trackCount: 0,
      },
    });

    const saToken = await login(app, 'super.admin');
    const created = await app.request(
      '/api/v1/org-admins',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${saToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          username: 'new.oa',
          password: 'TempPass123!',
          orgId: 'org-a',
        }),
      },
      testEnv,
    );
    expect(created.status).toBe(201);
    const dto = (await created.json()) as { username: string; temporaryPassword: string };
    expect(dto.username).toBe('new.oa');
    expect(dto.temporaryPassword).toBe('TempPass123!');

    const overview = await app.request(
      '/api/v1/manage/platform-overview',
      { headers: { Authorization: `Bearer ${saToken}` } },
      testEnv,
    );
    expect(overview.status).toBe(200);

    const stuToken = await login(app, 'student.a');
    const list = await app.request(
      '/api/v1/org-admins',
      { headers: { Authorization: `Bearer ${stuToken}` } },
      testEnv,
    );
    expect(list.status).toBe(403);
  });

  it('instructor B cannot edit course owned by instructor A (other owner)', async () => {
    const app = makeApp();
    const tokenA = await login(app, 'instructor.a');
    const created = await app.request(
      '/api/v1/manage/courses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenA}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Org A Course' }),
      },
      testEnv,
    );
    expect(created.status).toBe(201);
    const course = (await created.json()) as { id: string };
    const tokenB = await login(app, 'instructor.b');
    const patch = await app.request(
      `/api/v1/manage/courses/${course.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${tokenB}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Hijack' }),
      },
      testEnv,
    );
    expect(patch.status).toBe(403);
  });
});
