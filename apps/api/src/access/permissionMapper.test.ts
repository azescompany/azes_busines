/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/permissionMapper.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: AC-D03 CRUD → permission code mapper tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { isReadOnlyCrudFlags, mapCrudFlagsToPermissionCodes } from './permissionMapper.js';

describe('mapCrudFlagsToPermissionCodes (AC-D03)', () => {
  const crmCodes = [
    'crm.customers.read',
    'crm.customers.create',
    'crm.customers.update',
    'crm.customers.delete',
  ];

  it('maps read-only profile to only .read', () => {
    const codes = mapCrudFlagsToPermissionCodes(crmCodes, {
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    });
    expect(codes).toEqual(['crm.customers.read']);
    expect(
      isReadOnlyCrudFlags({
        canRead: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      }),
    ).toBe(true);
  });

  it('maps full CRUD flags', () => {
    const codes = mapCrudFlagsToPermissionCodes(crmCodes, {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    });
    expect(codes).toEqual(crmCodes);
  });
});
