/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/entitlementPolicy.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Subscription lite + module entitlement policy (AC-D08)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Permission } from '../auth/permissions.js';

/** Platform module codes (not LMS curriculum modules). */
export type PlatformModuleCode = 'admin-core' | 'crm' | (string & {});

export type SubscriptionMode = 'full' | 'read_only' | 'blocked';

export type SubscriptionPolicyInput = {
  subscriptionStatus: 'active' | 'blocked';
  /** Unix seconds; null = no trial window. */
  trialEndsAt: number | null;
  /** AC-D08 optional read-only flag. */
  subscriptionReadOnly: boolean;
};

/**
 * Permissions gated by a platform module. Dual-read with Phase 06 resolver —
 * only module-bound codes are filtered here.
 */
export const MODULE_BOUND_PERMISSIONS: Record<string, readonly Permission[]> = {
  crm: [
    'crm.customers.read',
    'crm.customers.create',
    'crm.customers.update',
    'crm.customers.delete',
  ],
};

export const MODULE_BOUND_MENU_IDS: Record<string, readonly string[]> = {
  crm: ['menu-admin-customers'],
};

const WRITE_PERMISSIONS = new Set<Permission>([
  'crm.customers.create',
  'crm.customers.update',
  'crm.customers.delete',
]);

export function moduleCodeForPermission(permission: Permission): string | null {
  for (const [code, perms] of Object.entries(MODULE_BOUND_PERMISSIONS)) {
    if (perms.includes(permission)) return code;
  }
  return null;
}

export function isModuleWritePermission(permission: Permission): boolean {
  return WRITE_PERMISSIONS.has(permission);
}

/**
 * AC-D08 lite matrix:
 * - blocked status → blocked
 * - subscriptionReadOnly OR expired trial → read_only
 * - else → full
 */
export function evaluateSubscription(
  input: SubscriptionPolicyInput,
  nowSec: number,
): SubscriptionMode {
  if (input.subscriptionStatus === 'blocked') return 'blocked';
  if (input.subscriptionReadOnly) return 'read_only';
  if (input.trialEndsAt != null && input.trialEndsAt < nowSec) return 'read_only';
  return 'full';
}

export function subscriptionAllowsPermission(
  mode: SubscriptionMode,
  permission: Permission,
): boolean {
  if (mode === 'blocked') return false;
  if (mode === 'read_only' && isModuleWritePermission(permission)) return false;
  return true;
}

/** Strip module-bound permissions the org is not entitled to (or subscription denies). */
export function filterPermissionsByEntitlement(
  permissions: readonly Permission[],
  entitledModuleCodes: ReadonlySet<string>,
  subscriptionMode: SubscriptionMode,
): Permission[] {
  return permissions.filter((p) => {
    const moduleCode = moduleCodeForPermission(p);
    if (!moduleCode) return true;
    if (!entitledModuleCodes.has(moduleCode)) return false;
    return subscriptionAllowsPermission(subscriptionMode, p);
  });
}

export function filterNavByEntitlement<T extends { id: string }>(
  items: readonly T[],
  entitledModuleCodes: ReadonlySet<string>,
  subscriptionMode: SubscriptionMode,
): T[] {
  if (subscriptionMode === 'blocked') {
    // Hide all module-bound menus when org subscription is blocked.
    const blockedMenus = new Set(Object.values(MODULE_BOUND_MENU_IDS).flatMap((ids) => [...ids]));
    return items.filter((i) => !blockedMenus.has(i.id));
  }
  return items.filter((i) => {
    for (const [code, menuIds] of Object.entries(MODULE_BOUND_MENU_IDS)) {
      if (menuIds.includes(i.id) && !entitledModuleCodes.has(code)) {
        return false;
      }
    }
    return true;
  });
}
