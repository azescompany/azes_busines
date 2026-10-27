/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/permissionMapper.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: CRUD flags → canonical permission codes (AC-D03)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type CrudFlags = {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type CrudAction = 'read' | 'create' | 'update' | 'delete';

const ACTION_FLAG: Record<CrudAction, keyof CrudFlags> = {
  read: 'canRead',
  create: 'canCreate',
  update: 'canUpdate',
  delete: 'canDelete',
};

/**
 * Map menu-bound permission codes through CRUD flags.
 * Codes ending in `.read|.create|.update|.delete` are included only when the
 * matching flag is true. Codes without a CRUD suffix are included when
 * `canRead` is true (nav/view capability).
 */
export function mapCrudFlagsToPermissionCodes(
  menuPermissionCodes: readonly string[],
  flags: CrudFlags,
): string[] {
  const out: string[] = [];
  for (const code of menuPermissionCodes) {
    const action = crudActionFromCode(code);
    if (action) {
      if (flags[ACTION_FLAG[action]]) out.push(code);
      continue;
    }
    if (flags.canRead) out.push(code);
  }
  return out;
}

export function crudActionFromCode(code: string): CrudAction | null {
  if (code.endsWith('.read')) return 'read';
  if (code.endsWith('.create')) return 'create';
  if (code.endsWith('.update')) return 'update';
  if (code.endsWith('.delete')) return 'delete';
  return null;
}

/** True if profile/flags are read-only (no mutating CRUD). */
export function isReadOnlyCrudFlags(flags: CrudFlags): boolean {
  return flags.canRead && !flags.canCreate && !flags.canUpdate && !flags.canDelete;
}
