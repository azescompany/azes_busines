/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/dataScope.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Data scope helpers (TAGET M3.5)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type DataScope = 'org' | 'own' | 'subtree';

export function normalizeDataScope(raw: string | null | undefined): DataScope {
  if (raw === 'own' || raw === 'subtree') return raw;
  return 'org';
}

/** Whether a row owned by `ownerUserId` is visible under scope. */
export function isOwnerVisible(
  scope: DataScope,
  viewerUserId: string,
  ownerUserId: string | null | undefined,
): boolean {
  if (scope === 'org' || scope === 'subtree') return true;
  if (!ownerUserId) return true;
  return ownerUserId === viewerUserId;
}
