/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/orgAdmins.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: SuperAdmin OrgAdmin list/create (D1 + memory)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, eq } from 'drizzle-orm';

import { hashPassword } from '../auth/password.js';
import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import type { OrgAdminDto } from './types.js';

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export interface OrgAdminRepository {
  list(filter?: { orgId?: string }): Promise<OrgAdminDto[]>;
  create(input: {
    username: string;
    password: string;
    orgId: string;
  }): Promise<OrgAdminDto & { temporaryPassword: string }>;
  setStatus(userId: string, status: 'active' | 'disabled'): Promise<OrgAdminDto>;
}

async function resolveOrgAdminRoleId(db: ApiDb): Promise<string> {
  const [row] = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.name, 'orgAdmin'))
    .limit(1);
  if (!row) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'orgAdmin role is not seeded');
  }
  return row.id;
}

export function createDrizzleOrgAdminRepository(db: ApiDb): OrgAdminRepository {
  return {
    async list(filter) {
      const roleId = await resolveOrgAdminRoleId(db);
      const rows = await db
        .select({
          id: schema.users.id,
          username: schema.users.usernameNormalized,
          orgId: schema.users.orgId,
          status: schema.users.status,
          createdAt: schema.users.createdAt,
          orgName: schema.organizations.name,
        })
        .from(schema.userRoles)
        .innerJoin(schema.users, eq(schema.userRoles.userId, schema.users.id))
        .innerJoin(schema.organizations, eq(schema.users.orgId, schema.organizations.id))
        .where(
          filter?.orgId
            ? and(eq(schema.userRoles.roleId, roleId), eq(schema.users.orgId, filter.orgId))
            : eq(schema.userRoles.roleId, roleId),
        )
        .orderBy(asc(schema.users.usernameNormalized));

      return rows
        .filter((r) => r.orgId)
        .map((r) => ({
          id: r.id,
          username: r.username,
          orgId: r.orgId!,
          orgName: r.orgName,
          status: r.status as OrgAdminDto['status'],
          createdAt: r.createdAt,
        }));
    },

    async create(input) {
      const orgId = input.orgId.trim();
      const [org] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, orgId))
        .limit(1);
      if (!org) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
      }

      const username = normalizeUsername(input.username);
      if (!username || username.length < 3) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Username is too short');
      }
      const password = input.password.trim();
      if (password.length < 8) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Password must be at least 8 characters');
      }

      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.usernameNormalized, username))
        .limit(1);
      if (existing) {
        throw new ApiHttpError(409, 'CONFLICT', 'Username already exists');
      }

      const roleId = await resolveOrgAdminRoleId(db);
      const ts = nowSec();
      const id = newId();
      const passwordHash = await hashPassword(password);

      await db.insert(schema.users).values({
        id,
        usernameNormalized: username,
        passwordHash,
        status: 'active',
        orgId,
        createdAt: ts,
        updatedAt: ts,
      });
      await db.insert(schema.userRoles).values({
        userId: id,
        roleId,
        createdAt: ts,
      });

      // TAGET M1: keep membership in sync with legacy orgAdmin create.
      await db.insert(schema.organizationMemberships).values({
        id: newId(),
        orgId,
        userId: id,
        role: 'orgAdmin',
        status: 'active',
        createdAt: ts,
        updatedAt: ts,
      });

      return {
        id,
        username,
        orgId,
        orgName: org.name,
        status: 'active',
        createdAt: ts,
        temporaryPassword: password,
      };
    },

    async setStatus(userId, status) {
      const items = await this.list();
      const target = items.find((u) => u.id === userId);
      if (!target) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'OrgAdmin not found');
      }
      const ts = nowSec();
      await db
        .update(schema.users)
        .set({ status, updatedAt: ts })
        .where(eq(schema.users.id, userId));
      return { ...target, status };
    },
  };
}

export function createMemoryOrgAdminRepository(seed?: {
  orgAdmins?: OrgAdminDto[];
  orgNames?: Record<string, string>;
}): OrgAdminRepository {
  const rows = [...(seed?.orgAdmins ?? [])];
  const orgNames = { ...(seed?.orgNames ?? {}) };

  return {
    async list(filter) {
      return rows.filter((r) => (filter?.orgId ? r.orgId === filter.orgId : true));
    },
    async create(input) {
      const username = normalizeUsername(input.username);
      if (rows.some((r) => r.username === username)) {
        throw new ApiHttpError(409, 'CONFLICT', 'Username already exists');
      }
      const orgName = orgNames[input.orgId] ?? 'Org';
      const dto: OrgAdminDto = {
        id: newId(),
        username,
        orgId: input.orgId,
        orgName,
        status: 'active',
        createdAt: nowSec(),
      };
      rows.push(dto);
      return { ...dto, temporaryPassword: input.password };
    },
    async setStatus(userId, status) {
      const idx = rows.findIndex((r) => r.id === userId);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'OrgAdmin not found');
      rows[idx] = { ...rows[idx]!, status };
      return rows[idx]!;
    },
  };
}
