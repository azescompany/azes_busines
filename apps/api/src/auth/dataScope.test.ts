/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/dataScope.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Unit-aware subtree scope tests (Phase 05 / AC-D02)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { createMemoryUnitRepository } from '../org/unitRepository.js';
import { isOwnerVisible, isOwnerVisibleInUnitSubtree, normalizeDataScope } from './dataScope.js';

describe('dataScope', () => {
  it('normalize + own/org sync helpers', () => {
    expect(normalizeDataScope('own')).toBe('own');
    expect(normalizeDataScope('subtree')).toBe('subtree');
    expect(normalizeDataScope(undefined)).toBe('org');
    expect(isOwnerVisible('own', 'u1', 'u2')).toBe(false);
    expect(isOwnerVisible('org', 'u1', 'u2')).toBe(true);
    // subtree sync fails closed (own-like), not full org
    expect(isOwnerVisible('subtree', 'u1', 'u2')).toBe(false);
  });

  it('subtree visibility uses unit tree (not org-wide)', async () => {
    const unitRepo = createMemoryUnitRepository();
    const branch = await unitRepo.createUnit({
      orgId: 'org-a',
      name: 'Branch',
      code: 'branch',
      kind: 'branch',
    });
    const team = await unitRepo.createUnit({
      orgId: 'org-a',
      name: 'Team',
      code: 'team',
      kind: 'team',
      parentUnitId: branch.id,
    });
    await unitRepo.upsertUnitMember({
      orgId: 'org-a',
      unitId: branch.id,
      userId: 'manager-1',
      role: 'manager',
    });
    await unitRepo.upsertUnitMember({
      orgId: 'org-a',
      unitId: team.id,
      userId: 'member-1',
      role: 'member',
    });
    await unitRepo.upsertUnitMember({
      orgId: 'org-a',
      unitId: team.id,
      userId: 'outsider',
      role: 'member',
      status: 'disabled',
    });

    // Manager sees team member (descendant unit)
    await expect(
      isOwnerVisibleInUnitSubtree({
        scope: 'subtree',
        viewerUserId: 'manager-1',
        ownerUserId: 'member-1',
        orgId: 'org-a',
        unitRepo,
      }),
    ).resolves.toBe(true);

    // Member does not see manager (ancestor only — not in member's subtree downward)
    await expect(
      isOwnerVisibleInUnitSubtree({
        scope: 'subtree',
        viewerUserId: 'member-1',
        ownerUserId: 'manager-1',
        orgId: 'org-a',
        unitRepo,
      }),
    ).resolves.toBe(false);

    // Disabled unit membership not visible
    await expect(
      isOwnerVisibleInUnitSubtree({
        scope: 'subtree',
        viewerUserId: 'manager-1',
        ownerUserId: 'outsider',
        orgId: 'org-a',
        unitRepo,
      }),
    ).resolves.toBe(false);
  });
});
