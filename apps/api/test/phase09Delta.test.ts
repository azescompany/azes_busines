/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/phase09Delta.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Phase 09 — soft LMS de-authz, GeneralAdmin, seed gates
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  assertLmsRoleMenusExcludeErp,
  assertNotProtectedPlatformRole,
} from '../src/access/delegation.js';
import { createApp } from '../src/app.js';
import {
  can,
  GENERAL_ADMIN_CAPABILITY_PERMISSIONS,
  permissionsForRoles,
} from '../src/auth/permissions.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryMenuRepository } from '../src/menu/repository.js';
import { createMemoryOrgRepository } from '../src/org/repository.js';
import { createMemoryPlatformRoleRepository } from '../src/org/platformRoles.js';
import type { ApiEnv } from '../src/env.js';
import { ApiHttpError } from '../src/errors.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-p09-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('Phase 09 — LMS soft de-authz', () => {
  it('instructor/student/guest baselines exclude platform/ERP permissions', () => {
    for (const role of ['instructor', 'student', 'guest'] as const) {
      const perms = permissionsForRoles([role]);
      expect(perms).not.toContain('org.manage_all');
      expect(perms).not.toContain('org.create');
      expect(perms).not.toContain('org.manage');
      expect(perms).not.toContain('modules.manage');
      expect(perms).not.toContain('audit.read');
      expect(perms).not.toContain('crm.customers.read');
      expect(perms).not.toContain('dashboard.read');
    }
    expect(can(['instructor'], 'course.write')).toBe(true);
    expect(can(['student'], 'catalog.read')).toBe(true);
  });

  it('rejects binding LMS role to ERP menus', () => {
    expect(() =>
      assertLmsRoleMenusExcludeErp({
        role: 'instructor',
        menuPermissionCodes: ['crm.customers.read'],
      }),
    ).toThrow(ApiHttpError);

    expect(() =>
      assertLmsRoleMenusExcludeErp({
        role: 'instructor',
        menuPermissionCodes: ['catalog.read'],
      }),
    ).not.toThrow();
  });
});

describe('Phase 09 — GeneralAdmin capability (AC-D01 A)', () => {
  it('grants capability set without org.manage_all or CRM write', () => {
    const perms = permissionsForRoles(['generalAdmin']);
    for (const p of GENERAL_ADMIN_CAPABILITY_PERMISSIONS) {
      expect(perms).toContain(p);
    }
    expect(perms).not.toContain('org.manage_all');
    expect(perms).not.toContain('crm.customers.create');
    expect(can(['generalAdmin'], 'audit.read')).toBe(true);
    expect(can(['generalAdmin'], 'org.manage_all')).toBe(false);
  });

  it('protects superAdmin from ordinary role APIs', () => {
    expect(() => assertNotProtectedPlatformRole('superAdmin')).toThrow(ApiHttpError);
    expect(() => assertNotProtectedPlatformRole('generalAdmin')).not.toThrow();
  });

  it('HTTP: generalAdmin can read audit; member cannot; SA has manage_all', async () => {
    const passwordHash = await hashPassword('LocalDevPass123!');
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-sa',
          usernameNormalized: 'sa.p09',
          passwordHash,
          status: 'active',
          orgId: null,
        },
        {
          id: 'user-ga',
          usernameNormalized: 'ga.p09',
          passwordHash,
          status: 'active',
          orgId: null,
        },
        {
          id: 'user-member',
          usernameNormalized: 'member.p09',
          passwordHash,
          status: 'active',
          orgId: 'org-a',
        },
      ],
      rolesByUser: {
        'user-sa': ['superAdmin'],
        'user-ga': ['generalAdmin'],
        'user-member': ['member'],
      },
    });
    const menuRepo = createMemoryMenuRepository();
    const app = createApp({
      authRepo,
      menuRepo,
      orgRepo: createMemoryOrgRepository(),
      platformRoleRepo: createMemoryPlatformRoleRepository(),
      lmsRepo: createMemoryLmsRepository({ courses: [], curriculum: {} }),
      lmsMutations: createMemoryLmsMutations({ courses: [], curriculum: {} }),
    });

    async function login(username: string) {
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

    const gaToken = await login('ga.p09');
    const memberToken = await login('member.p09');
    const saToken = await login('sa.p09');

    const gaAudit = await app.request(
      '/api/v1/audit-logs',
      { headers: { authorization: `Bearer ${gaToken}` } },
      testEnv,
    );
    expect(gaAudit.status).toBe(200);

    const memberAudit = await app.request(
      '/api/v1/audit-logs',
      { headers: { authorization: `Bearer ${memberToken}` } },
      testEnv,
    );
    expect(memberAudit.status).toBe(403);

    const saMenus = await app.request(
      '/api/v1/menus',
      { headers: { authorization: `Bearer ${saToken}` } },
      testEnv,
    );
    expect(saMenus.status).toBe(200);

    const gaMenus = await app.request(
      '/api/v1/menus',
      { headers: { authorization: `Bearer ${gaToken}` } },
      testEnv,
    );
    expect(gaMenus.status).toBe(403);
  });
});

describe('Phase 09 — demo seed production safeguard', () => {
  it('refuses without AZES_ALLOW_DEMO_SEED', () => {
    const script = join(dirname(fileURLToPath(import.meta.url)), '../scripts/seed-demo-env.mjs');
    const r = spawnSync(process.execPath, [script], {
      env: { ...process.env, AZES_ALLOW_DEMO_SEED: undefined, NODE_ENV: 'development' },
      encoding: 'utf8',
    });
    expect(r.status).not.toBe(0);
    expect(`${r.stderr}${r.stdout}`).toMatch(/REFUSED/i);
  });

  it('refuses when NODE_ENV=production even with allow flag', () => {
    const script = join(dirname(fileURLToPath(import.meta.url)), '../scripts/seed-demo-env.mjs');
    const r = spawnSync(process.execPath, [script], {
      env: { ...process.env, AZES_ALLOW_DEMO_SEED: '1', NODE_ENV: 'production' },
      encoding: 'utf8',
    });
    expect(r.status).not.toBe(0);
    expect(`${r.stderr}${r.stdout}`).toMatch(/production/i);
  });
});
