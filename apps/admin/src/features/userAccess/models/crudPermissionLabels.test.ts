/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/userAccess/models/crudPermissionLabels.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: AC-D03 CRUD → permission code label helpers
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { formatCrudFlagLabel, permissionCodeForCrudFlag } from './crudPermissionLabels.js';

describe('crudPermissionLabels', () => {
  it('maps flags to matching menu permission codes', () => {
    const codes = ['crm.customers.read', 'crm.customers.create', 'org.manage'];
    expect(permissionCodeForCrudFlag(codes, 'canRead')).toBe('crm.customers.read');
    expect(permissionCodeForCrudFlag(codes, 'canCreate')).toBe('crm.customers.create');
    expect(permissionCodeForCrudFlag(codes, 'canUpdate')).toBeNull();
  });

  it('formats labels with optional code', () => {
    expect(formatCrudFlagLabel('Read', 'crm.customers.read')).toBe('Read (crm.customers.read)');
    expect(formatCrudFlagLabel('Read', null)).toBe('Read');
  });
});
