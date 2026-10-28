/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/permissions.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-28
 * ║ Purpose: AC-D05 claim hygiene + Phase 09 soft de-authz / GA
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import {
  claimHasPermission,
  GENERAL_ADMIN_CAPABILITY_PERMISSIONS,
  permissionsForRoles,
} from './permissions.js';
import { trustedRequestContext } from './requestContext.js';

describe('claimHasPermission (AC-D05)', () => {
  it('ignores elevated JWT permissions claim; uses roles only', () => {
    const user = {
      roles: ['member'],
      permissions: ['org.manage_all', 'modules.manage'],
    };
    expect(claimHasPermission(user, 'org.manage_all')).toBe(false);
    expect(claimHasPermission(user, 'modules.manage')).toBe(false);
  });

  it('grants via static role map when role includes permission', () => {
    expect(claimHasPermission({ roles: ['superAdmin'], permissions: [] }, 'org.manage_all')).toBe(
      true,
    );
    expect(claimHasPermission({ roles: ['orgAdmin'] }, 'org.manage')).toBe(true);
  });
});

describe('Phase 09 soft de-authz / GeneralAdmin', () => {
  it('LMS roles never include ERP codes from baseline', () => {
    expect(permissionsForRoles(['instructor'])).not.toContain('crm.customers.read');
    expect(permissionsForRoles(['student'])).not.toContain('org.manage');
  });

  it('generalAdmin capability set is exact AC-D01 profile', () => {
    expect(permissionsForRoles(['generalAdmin']).sort()).toEqual(
      [...GENERAL_ADMIN_CAPABILITY_PERMISSIONS].sort(),
    );
  });
});

describe('trustedRequestContext', () => {
  it('maps JWT identity claims and does not invent fields', () => {
    expect(
      trustedRequestContext({
        sub: 'user-1',
        sid: 'sess-1',
        roles: ['member'],
        orgId: 'org-a',
        permissions: ['org.manage_all'],
      }),
    ).toEqual({
      userId: 'user-1',
      sessionId: 'sess-1',
      orgId: 'org-a',
      roles: ['member'],
    });
  });
});
