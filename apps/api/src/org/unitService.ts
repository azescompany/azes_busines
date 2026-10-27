/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/unitService.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Organization Unit business rules (AC-D02 A)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { claimHasPermission } from '../auth/permissions.js';
import { ApiHttpError } from '../errors.js';
import type { TenantRepository } from './tenantRepository.js';
import { assertCanManageOrg } from './tenantService.js';
import type { UnitRepository } from './unitRepository.js';
import type {
  OrganizationUnitDto,
  UnitKind,
  UnitMembershipDto,
  UnitMembershipRole,
  UnitStatus,
} from './unitTypes.js';

type OrgActor = {
  sub: string;
  roles: readonly string[];
  orgId: string | null;
  permissions?: readonly string[];
};

/** Read units: platform staff OR active membership in the org. */
export async function assertCanReadOrgUnits(
  tenant: TenantRepository,
  user: OrgActor,
  orgId: string,
): Promise<void> {
  if (claimHasPermission(user, 'org.manage_all')) return;
  const membership = await tenant.getMembership(orgId, user.sub);
  if (!membership || membership.status !== 'active') {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Cross-organization access denied');
  }
}

export async function listOrganizationUnits(
  tenant: TenantRepository,
  units: UnitRepository,
  actor: OrgActor,
  orgId: string,
): Promise<OrganizationUnitDto[]> {
  await assertCanReadOrgUnits(tenant, actor, orgId);
  return units.listUnits(orgId);
}

export async function getOrganizationUnit(
  tenant: TenantRepository,
  units: UnitRepository,
  actor: OrgActor,
  orgId: string,
  unitId: string,
): Promise<OrganizationUnitDto> {
  await assertCanReadOrgUnits(tenant, actor, orgId);
  const unit = await units.getUnit(orgId, unitId);
  if (!unit) throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
  return unit;
}

export async function createOrganizationUnit(
  tenant: TenantRepository,
  units: UnitRepository,
  actor: OrgActor,
  orgId: string,
  input: {
    name: string;
    code: string;
    kind?: UnitKind;
    parentUnitId?: string | null;
  },
): Promise<OrganizationUnitDto> {
  await assertCanManageOrg(tenant, actor, orgId);
  return units.createUnit({
    orgId,
    name: input.name,
    code: input.code,
    kind: input.kind,
    parentUnitId: input.parentUnitId,
  });
}

export async function updateOrganizationUnit(
  tenant: TenantRepository,
  units: UnitRepository,
  actor: OrgActor,
  orgId: string,
  unitId: string,
  patch: {
    name?: string;
    code?: string;
    kind?: UnitKind;
    status?: UnitStatus;
    parentUnitId?: string | null;
  },
): Promise<OrganizationUnitDto> {
  await assertCanManageOrg(tenant, actor, orgId);
  return units.updateUnit(orgId, unitId, patch);
}

export async function listUnitMemberships(
  tenant: TenantRepository,
  units: UnitRepository,
  actor: OrgActor,
  orgId: string,
  unitId: string,
): Promise<UnitMembershipDto[]> {
  await assertCanManageOrg(tenant, actor, orgId);
  const unit = await units.getUnit(orgId, unitId);
  if (!unit) throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
  return units.listUnitMembers(orgId, unitId);
}

export async function upsertUnitMembership(
  tenant: TenantRepository,
  units: UnitRepository,
  actor: OrgActor,
  orgId: string,
  unitId: string,
  input: { userId: string; role?: UnitMembershipRole },
): Promise<UnitMembershipDto> {
  await assertCanManageOrg(tenant, actor, orgId);
  const orgMembership = await tenant.getMembership(orgId, input.userId);
  if (!orgMembership || orgMembership.status !== 'active') {
    throw new ApiHttpError(
      400,
      'VALIDATION_ERROR',
      'User must have an active organization membership before unit assignment',
    );
  }
  return units.upsertUnitMember({
    orgId,
    unitId,
    userId: input.userId,
    role: input.role,
  });
}

export async function removeUnitMembership(
  tenant: TenantRepository,
  units: UnitRepository,
  actor: OrgActor,
  orgId: string,
  unitId: string,
  userId: string,
): Promise<{ ok: true }> {
  await assertCanManageOrg(tenant, actor, orgId);
  const unit = await units.getUnit(orgId, unitId);
  if (!unit) throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
  await units.removeUnitMember(orgId, unitId, userId);
  return { ok: true };
}
