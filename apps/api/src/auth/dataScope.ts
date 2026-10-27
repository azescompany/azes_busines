/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/dataScope.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Data scope helpers — own/org + unit-aware subtree (AC-D02)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { UnitRepository } from '../org/unitRepository.js';

export type DataScope = 'org' | 'own' | 'subtree';

export function normalizeDataScope(raw: string | null | undefined): DataScope {
  if (raw === 'own' || raw === 'subtree') return raw;
  return 'org';
}

/**
 * Synchronous owner visibility for `own` / `org`.
 * For `subtree`, prefer `isOwnerVisibleInUnitSubtree` — this sync helper
 * fails closed (treats subtree like `own`) so it never expands to full-org.
 */
export function isOwnerVisible(
  scope: DataScope,
  viewerUserId: string,
  ownerUserId: string | null | undefined,
): boolean {
  if (scope === 'org') return true;
  // own + subtree (sync fallback): only own rows
  if (!ownerUserId) return true;
  return ownerUserId === viewerUserId;
}

/**
 * Unit-aware subtree (Phase 03 units / Phase 05 scope).
 * Visible when owner is the viewer, or both share a unit in the viewer's
 * unit subtree (viewer units + descendant units). No unit membership → own-only.
 */
export async function isOwnerVisibleInUnitSubtree(params: {
  scope: DataScope;
  viewerUserId: string;
  ownerUserId: string | null | undefined;
  orgId: string;
  unitRepo: UnitRepository | null | undefined;
}): Promise<boolean> {
  const { scope, viewerUserId, ownerUserId, orgId, unitRepo } = params;
  if (scope === 'org') return true;
  if (!ownerUserId) return true;
  if (ownerUserId === viewerUserId) return true;
  if (scope === 'own') return false;
  // subtree
  if (!unitRepo) return false;
  const visible = await listUserIdsInViewerUnitSubtree(unitRepo, orgId, viewerUserId);
  return visible.has(ownerUserId);
}

export async function listUserIdsInViewerUnitSubtree(
  unitRepo: UnitRepository,
  orgId: string,
  viewerUserId: string,
): Promise<Set<string>> {
  const units = await unitRepo.listUnits(orgId);
  const activeUnits = units.filter((u) => u.status === 'active');
  const childrenByParent = new Map<string | null, string[]>();
  for (const u of activeUnits) {
    const key = u.parentUnitId;
    const list = childrenByParent.get(key) ?? [];
    list.push(u.id);
    childrenByParent.set(key, list);
  }

  const viewerUnitIds = new Set<string>();
  for (const u of activeUnits) {
    const members = await unitRepo.listUnitMembers(orgId, u.id);
    if (members.some((m) => m.userId === viewerUserId && m.status === 'active')) {
      viewerUnitIds.add(u.id);
    }
  }

  const subtreeIds = new Set<string>();
  const queue = [...viewerUnitIds];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (subtreeIds.has(id)) continue;
    subtreeIds.add(id);
    for (const child of childrenByParent.get(id) ?? []) queue.push(child);
  }

  const userIds = new Set<string>([viewerUserId]);
  for (const unitId of subtreeIds) {
    const members = await unitRepo.listUnitMembers(orgId, unitId);
    for (const m of members) {
      if (m.status === 'active') userIds.add(m.userId);
    }
  }
  return userIds;
}
