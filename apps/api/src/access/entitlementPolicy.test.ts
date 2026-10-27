/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/entitlementPolicy.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: AC-D08 subscription lite + entitlement filter unit tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import {
  evaluateSubscription,
  filterNavByEntitlement,
  filterPermissionsByEntitlement,
  subscriptionAllowsPermission,
} from './entitlementPolicy.js';

describe('evaluateSubscription (AC-D08)', () => {
  const now = 1_700_000_000;

  it('blocks when subscriptionStatus is blocked', () => {
    expect(
      evaluateSubscription(
        { subscriptionStatus: 'blocked', trialEndsAt: null, subscriptionReadOnly: false },
        now,
      ),
    ).toBe('blocked');
  });

  it('read_only when flag set', () => {
    expect(
      evaluateSubscription(
        { subscriptionStatus: 'active', trialEndsAt: null, subscriptionReadOnly: true },
        now,
      ),
    ).toBe('read_only');
  });

  it('read_only when trial expired', () => {
    expect(
      evaluateSubscription(
        { subscriptionStatus: 'active', trialEndsAt: now - 1, subscriptionReadOnly: false },
        now,
      ),
    ).toBe('read_only');
  });

  it('full when active and trial future', () => {
    expect(
      evaluateSubscription(
        { subscriptionStatus: 'active', trialEndsAt: now + 100, subscriptionReadOnly: false },
        now,
      ),
    ).toBe('full');
  });
});

describe('filterPermissionsByEntitlement', () => {
  it('strips CRM perms when crm not entitled', () => {
    const out = filterPermissionsByEntitlement(
      ['org.manage', 'crm.customers.read', 'crm.customers.create'],
      new Set(['admin-core']),
      'full',
    );
    expect(out).toEqual(['org.manage']);
  });

  it('keeps CRM read but not write in read_only', () => {
    const out = filterPermissionsByEntitlement(
      ['crm.customers.read', 'crm.customers.create'],
      new Set(['crm']),
      'read_only',
    );
    expect(out).toEqual(['crm.customers.read']);
  });

  it('subscriptionAllowsPermission respects modes', () => {
    expect(subscriptionAllowsPermission('blocked', 'crm.customers.read')).toBe(false);
    expect(subscriptionAllowsPermission('read_only', 'crm.customers.read')).toBe(true);
    expect(subscriptionAllowsPermission('read_only', 'crm.customers.create')).toBe(false);
  });

  it('hides CRM nav when not entitled', () => {
    const items = filterNavByEntitlement(
      [{ id: 'menu-admin-home' }, { id: 'menu-admin-customers' }],
      new Set(),
      'full',
    );
    expect(items.map((i) => i.id)).toEqual(['menu-admin-home']);
  });
});
