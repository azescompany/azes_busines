/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/userAccess/models/crudPermissionLabels.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Map CRUD flags → {resource}.{action} codes (AC-D03 UX)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type CrudFlag = 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete';

const FLAG_SUFFIX: Record<CrudFlag, string> = {
  canRead: '.read',
  canCreate: '.create',
  canUpdate: '.update',
  canDelete: '.delete',
};

/** Prefer exact `{resource}.{action}` from menu permissionCodes. */
export function permissionCodeForCrudFlag(
  permissionCodes: readonly string[] | undefined,
  flag: CrudFlag,
): string | null {
  if (!permissionCodes || permissionCodes.length === 0) return null;
  const suffix = FLAG_SUFFIX[flag];
  const hit = permissionCodes.find((c) => c.endsWith(suffix));
  return hit ?? null;
}

export function formatCrudFlagLabel(baseLabel: string, code: string | null): string {
  return code ? `${baseLabel} (${code})` : baseLabel;
}
