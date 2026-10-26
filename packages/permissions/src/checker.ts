/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/permissions/src/checker.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Permission checker for UX/nav gating
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { isPermission } from './parse.js';
import type { Permission } from './types.js';

export type PermissionChecker = {
  /** Exact grant match. */
  can: (permission: Permission | string) => boolean;
  canAny: (permissions: readonly (Permission | string)[]) => boolean;
  canAll: (permissions: readonly (Permission | string)[]) => boolean;
  /** Snapshot of grants (for debug/tests — not a security boundary). */
  list: () => readonly Permission[];
};

/**
 * Creates a checker from a grant list. Does not call the network and does not
 * authorize server actions — backend remains authoritative.
 */
export function createPermissionChecker(grants: Iterable<string> = []): PermissionChecker {
  const set = new Set<Permission>();
  for (const grant of grants) {
    if (isPermission(grant)) {
      set.add(grant);
    }
  }

  return {
    can: (permission) => isPermission(permission) && set.has(permission),
    canAny: (permissions) => permissions.some((p) => isPermission(p) && set.has(p)),
    canAll: (permissions) =>
      permissions.length > 0 && permissions.every((p) => isPermission(p) && set.has(p)),
    list: () => [...set],
  };
}
