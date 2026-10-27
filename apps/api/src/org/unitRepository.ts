/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/unitRepository.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Organization Unit + unit_membership persistence
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, eq } from 'drizzle-orm';

import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import type {
  OrganizationUnitDto,
  UnitKind,
  UnitMembershipDto,
  UnitMembershipRole,
  UnitMembershipStatus,
  UnitStatus,
} from './unitTypes.js';

export interface UnitRepository {
  listUnits(orgId: string): Promise<OrganizationUnitDto[]>;
  getUnit(orgId: string, unitId: string): Promise<OrganizationUnitDto | null>;
  createUnit(input: {
    orgId: string;
    parentUnitId?: string | null;
    name: string;
    code: string;
    kind?: UnitKind;
  }): Promise<OrganizationUnitDto>;
  updateUnit(
    orgId: string,
    unitId: string,
    patch: {
      name?: string;
      code?: string;
      kind?: UnitKind;
      status?: UnitStatus;
      parentUnitId?: string | null;
    },
  ): Promise<OrganizationUnitDto>;
  listUnitMembers(orgId: string, unitId: string): Promise<UnitMembershipDto[]>;
  upsertUnitMember(input: {
    orgId: string;
    unitId: string;
    userId: string;
    role?: UnitMembershipRole;
    status?: UnitMembershipStatus;
  }): Promise<UnitMembershipDto>;
  removeUnitMember(orgId: string, unitId: string, userId: string): Promise<void>;
}

function mapUnit(row: typeof schema.organizationUnits.$inferSelect): OrganizationUnitDto {
  return {
    id: row.id,
    orgId: row.orgId,
    parentUnitId: row.parentUnitId ?? null,
    name: row.name,
    code: row.code,
    kind: row.kind as UnitKind,
    status: row.status as UnitStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapUnitMember(row: typeof schema.unitMemberships.$inferSelect): UnitMembershipDto {
  return {
    id: row.id,
    orgId: row.orgId,
    unitId: row.unitId,
    userId: row.userId,
    role: row.role as UnitMembershipRole,
    status: row.status as UnitMembershipStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createDrizzleUnitRepository(db: ApiDb): UnitRepository {
  return {
    async listUnits(orgId) {
      const rows = await db
        .select()
        .from(schema.organizationUnits)
        .where(eq(schema.organizationUnits.orgId, orgId))
        .orderBy(asc(schema.organizationUnits.code));
      return rows.map(mapUnit);
    },

    async getUnit(orgId, unitId) {
      const [row] = await db
        .select()
        .from(schema.organizationUnits)
        .where(
          and(eq(schema.organizationUnits.id, unitId), eq(schema.organizationUnits.orgId, orgId)),
        )
        .limit(1);
      return row ? mapUnit(row) : null;
    },

    async createUnit(input) {
      const ts = nowSec();
      if (input.parentUnitId) {
        const parent = await this.getUnit(input.orgId, input.parentUnitId);
        if (!parent || parent.status !== 'active') {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Parent unit not found in organization');
        }
      }
      const row = {
        id: newId(),
        orgId: input.orgId,
        parentUnitId: input.parentUnitId ?? null,
        name: input.name.trim(),
        code: input.code.trim().toLowerCase(),
        kind: input.kind ?? ('other' as UnitKind),
        status: 'active' as UnitStatus,
        createdAt: ts,
        updatedAt: ts,
      };
      try {
        await db.insert(schema.organizationUnits).values(row);
      } catch {
        throw new ApiHttpError(409, 'CONFLICT', 'Unit code already exists in organization');
      }
      return mapUnit(row);
    },

    async updateUnit(orgId, unitId, patch) {
      const existing = await this.getUnit(orgId, unitId);
      if (!existing) throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
      if (patch.parentUnitId) {
        if (patch.parentUnitId === unitId) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unit cannot be its own parent');
        }
        const parent = await this.getUnit(orgId, patch.parentUnitId);
        if (!parent) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Parent unit not found in organization');
        }
      }
      const ts = nowSec();
      const next = {
        name: patch.name?.trim() ?? existing.name,
        code: patch.code?.trim().toLowerCase() ?? existing.code,
        kind: patch.kind ?? existing.kind,
        status: patch.status ?? existing.status,
        parentUnitId: patch.parentUnitId !== undefined ? patch.parentUnitId : existing.parentUnitId,
        updatedAt: ts,
      };
      try {
        await db
          .update(schema.organizationUnits)
          .set(next)
          .where(
            and(eq(schema.organizationUnits.id, unitId), eq(schema.organizationUnits.orgId, orgId)),
          );
      } catch {
        throw new ApiHttpError(409, 'CONFLICT', 'Unit code already exists in organization');
      }
      const updated = await this.getUnit(orgId, unitId);
      if (!updated) throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
      return updated;
    },

    async listUnitMembers(orgId, unitId) {
      const rows = await db
        .select()
        .from(schema.unitMemberships)
        .where(
          and(eq(schema.unitMemberships.orgId, orgId), eq(schema.unitMemberships.unitId, unitId)),
        )
        .orderBy(asc(schema.unitMemberships.createdAt));
      return rows.map(mapUnitMember);
    },

    async upsertUnitMember(input) {
      const unit = await this.getUnit(input.orgId, input.unitId);
      if (!unit || unit.status !== 'active') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
      }
      const ts = nowSec();
      const [existing] = await db
        .select()
        .from(schema.unitMemberships)
        .where(
          and(
            eq(schema.unitMemberships.unitId, input.unitId),
            eq(schema.unitMemberships.userId, input.userId),
          ),
        )
        .limit(1);
      if (existing) {
        await db
          .update(schema.unitMemberships)
          .set({
            role: input.role ?? existing.role,
            status: input.status ?? 'active',
            updatedAt: ts,
          })
          .where(eq(schema.unitMemberships.id, existing.id));
        const [row] = await db
          .select()
          .from(schema.unitMemberships)
          .where(eq(schema.unitMemberships.id, existing.id))
          .limit(1);
        if (!row) throw new ApiHttpError(404, 'NOT_FOUND', 'Unit membership not found');
        return mapUnitMember(row);
      }
      const row = {
        id: newId(),
        orgId: input.orgId,
        unitId: input.unitId,
        userId: input.userId,
        role: input.role ?? ('member' as UnitMembershipRole),
        status: input.status ?? ('active' as UnitMembershipStatus),
        createdAt: ts,
        updatedAt: ts,
      };
      await db.insert(schema.unitMemberships).values(row);
      return mapUnitMember(row);
    },

    async removeUnitMember(orgId, unitId, userId) {
      const result = await db
        .delete(schema.unitMemberships)
        .where(
          and(
            eq(schema.unitMemberships.orgId, orgId),
            eq(schema.unitMemberships.unitId, unitId),
            eq(schema.unitMemberships.userId, userId),
          ),
        );
      void result;
    },
  };
}

export function createMemoryUnitRepository(seed?: {
  units?: OrganizationUnitDto[];
  memberships?: UnitMembershipDto[];
}): UnitRepository {
  const units: OrganizationUnitDto[] = [...(seed?.units ?? [])];
  const memberships: UnitMembershipDto[] = [...(seed?.memberships ?? [])];

  return {
    async listUnits(orgId) {
      return units.filter((u) => u.orgId === orgId).sort((a, b) => a.code.localeCompare(b.code));
    },

    async getUnit(orgId, unitId) {
      return units.find((u) => u.orgId === orgId && u.id === unitId) ?? null;
    },

    async createUnit(input) {
      if (input.parentUnitId) {
        const parent = await this.getUnit(input.orgId, input.parentUnitId);
        if (!parent || parent.status !== 'active') {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Parent unit not found in organization');
        }
      }
      const code = input.code.trim().toLowerCase();
      if (units.some((u) => u.orgId === input.orgId && u.code === code)) {
        throw new ApiHttpError(409, 'CONFLICT', 'Unit code already exists in organization');
      }
      const ts = nowSec();
      const row: OrganizationUnitDto = {
        id: newId(),
        orgId: input.orgId,
        parentUnitId: input.parentUnitId ?? null,
        name: input.name.trim(),
        code,
        kind: input.kind ?? 'other',
        status: 'active',
        createdAt: ts,
        updatedAt: ts,
      };
      units.push(row);
      return row;
    },

    async updateUnit(orgId, unitId, patch) {
      const idx = units.findIndex((u) => u.orgId === orgId && u.id === unitId);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
      if (patch.parentUnitId) {
        if (patch.parentUnitId === unitId) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unit cannot be its own parent');
        }
        const parent = await this.getUnit(orgId, patch.parentUnitId);
        if (!parent) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Parent unit not found in organization');
        }
      }
      const nextCode = patch.code?.trim().toLowerCase();
      if (
        nextCode &&
        units.some((u) => u.orgId === orgId && u.code === nextCode && u.id !== unitId)
      ) {
        throw new ApiHttpError(409, 'CONFLICT', 'Unit code already exists in organization');
      }
      units[idx] = {
        ...units[idx]!,
        name: patch.name?.trim() ?? units[idx]!.name,
        code: nextCode ?? units[idx]!.code,
        kind: patch.kind ?? units[idx]!.kind,
        status: patch.status ?? units[idx]!.status,
        parentUnitId:
          patch.parentUnitId !== undefined ? patch.parentUnitId : units[idx]!.parentUnitId,
        updatedAt: nowSec(),
      };
      return units[idx]!;
    },

    async listUnitMembers(orgId, unitId) {
      return memberships.filter((m) => m.orgId === orgId && m.unitId === unitId);
    },

    async upsertUnitMember(input) {
      const unit = await this.getUnit(input.orgId, input.unitId);
      if (!unit || unit.status !== 'active') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Unit not found');
      }
      const idx = memberships.findIndex(
        (m) => m.unitId === input.unitId && m.userId === input.userId,
      );
      const ts = nowSec();
      if (idx >= 0) {
        memberships[idx] = {
          ...memberships[idx]!,
          role: input.role ?? memberships[idx]!.role,
          status: input.status ?? 'active',
          updatedAt: ts,
        };
        return memberships[idx]!;
      }
      const row: UnitMembershipDto = {
        id: newId(),
        orgId: input.orgId,
        unitId: input.unitId,
        userId: input.userId,
        role: input.role ?? 'member',
        status: input.status ?? 'active',
        createdAt: ts,
        updatedAt: ts,
      };
      memberships.push(row);
      return row;
    },

    async removeUnitMember(orgId, unitId, userId) {
      const idx = memberships.findIndex(
        (m) => m.orgId === orgId && m.unitId === unitId && m.userId === userId,
      );
      if (idx >= 0) memberships.splice(idx, 1);
    },
  };
}
