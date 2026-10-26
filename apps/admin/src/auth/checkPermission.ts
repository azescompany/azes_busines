/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/checkPermission.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Client permission helper (UX only — backend still authorizes)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export function checkPermission(
  permissions: readonly string[] | undefined,
  code: string,
): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.includes(code);
}
