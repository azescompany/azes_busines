/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/permissions/src/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: resource.action permission types
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Canonical permission string: `resource.action` (e.g. `listing.read`).
 * Frontend checks are UX/navigation only — backend authorization is authoritative.
 */
export type Permission = `${string}.${string}`;

export type PermissionParts = {
  resource: string;
  action: string;
};
