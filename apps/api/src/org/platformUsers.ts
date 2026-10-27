/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/platformUsers.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: SuperAdmin/orgAdmin user create + list (M5.0-lite)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { asc, eq } from 'drizzle-orm';

import { hashPassword } from '../auth/password.js';
import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import { seedUserAccessFromProfile } from './seedUserAccess.js';
import type { MembershipRole } from './tenantTypes.js';
import type { PlatformUserDto } from './types.js';

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Map platform role name → organization_memberships.role. */
export function membershipRoleForPlatformRole(roleName: string): MembershipRole {
  if (roleName === 'orgAdmin') return 'orgAdmin';
  if (roleName === 'instructor') return 'instructor';
  if (roleName === 'student') return 'student';
  if (roleName === 'guest') return 'guest';
  return 'member';
}

export interface PlatformUserRepository {
  list(filter?: { orgId?: string }): Promise<PlatformUserDto[]>;
  create(input: {
    username: string;
    password: string;
    orgId: string;
    roleName: string;
  }): Promise<PlatformUserDto & { temporaryPassword: string }>;
}

async function ensureRoleId(db: ApiDb, roleName: string): Promise<string> {
  const [existing] = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.name, roleName))
    .limit(1);
  if (existing) return existing.id;
  if (roleName === 'superAdmin') {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Cannot assign superAdmin via this API');
  }
  const id = newId();
  await db.insert(schema.roles).values({ id, name: roleName, createdAt: nowSec() });
  return id;
}

export function createDrizzlePlatformUserRepository(db: ApiDb): PlatformUserRepository {
  return {
    async list(filter) {
      const base = db
        .select({
          id: schema.users.id,
          username: schema.users.usernameNormalized,
          orgId: schema.users.orgId,
          status: schema.users.status,
          createdAt: schema.users.createdAt,
          orgName: schema.organizations.name,
          orgColorCode: schema.organizations.colorCode,
          roleName: schema.roles.name,
        })
        .from(schema.users)
        .innerJoin(schema.organizations, eq(schema.users.orgId, schema.organizations.id))
        .leftJoin(schema.userRoles, eq(schema.userRoles.userId, schema.users.id))
        .leftJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id));
      const rows = filter?.orgId
        ? await base
            .where(eq(schema.users.orgId, filter.orgId))
            .orderBy(asc(schema.users.usernameNormalized))
        : await base.orderBy(asc(schema.users.usernameNormalized));

      const byUser = new Map<string, PlatformUserDto>();
      for (const r of rows) {
        if (!r.orgId) continue;
        const prev = byUser.get(r.id);
        if (prev) {
          // Prefer non-superAdmin role display if multiple.
          if (r.roleName && r.roleName !== 'superAdmin' && prev.roleName === 'superAdmin') {
            prev.roleName = r.roleName;
          }
          continue;
        }
        byUser.set(r.id, {
          id: r.id,
          username: r.username,
          orgId: r.orgId,
          orgName: r.orgName,
          orgColorCode: r.orgColorCode ?? '#2563EB',
          roleName: r.roleName ?? 'member',
          status: r.status as PlatformUserDto['status'],
          createdAt: r.createdAt,
        });
      }
      return [...byUser.values()];
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

      const roleName = input.roleName.trim();
      if (!roleName || roleName === 'superAdmin') {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Invalid roleName');
      }

      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.usernameNormalized, username))
        .limit(1);
      if (existing) {
        throw new ApiHttpError(409, 'CONFLICT', 'Username already exists');
      }

      const roleId = await ensureRoleId(db, roleName);
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
      await db.insert(schema.organizationMemberships).values({
        id: newId(),
        orgId,
        userId: id,
        role: membershipRoleForPlatformRole(roleName),
        status: 'active',
        createdAt: ts,
        updatedAt: ts,
      });

      await seedUserAccessFromProfile(db, { userId: id, orgId, roleName });

      return {
        id,
        username,
        orgId,
        orgName: org.name,
        orgColorCode: org.colorCode ?? '#2563EB',
        roleName,
        status: 'active',
        createdAt: ts,
        temporaryPassword: password,
      };
    },
  };
}

export function createMemoryPlatformUserRepository(seed?: {
  users?: PlatformUserDto[];
}): PlatformUserRepository {
  const rows = [...(seed?.users ?? [])];
  return {
    async list(filter) {
      return rows.filter((r) => (filter?.orgId ? r.orgId === filter.orgId : true));
    },
    async create(input) {
      const username = normalizeUsername(input.username);
      if (rows.some((r) => r.username === username)) {
        throw new ApiHttpError(409, 'CONFLICT', 'Username already exists');
      }
      const roleName = input.roleName.trim();
      if (!roleName || roleName === 'superAdmin') {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Invalid roleName');
      }
      const dto: PlatformUserDto = {
        id: newId(),
        username,
        orgId: input.orgId,
        orgName: 'Org',
        orgColorCode: '#2563EB',
        roleName,
        status: 'active',
        createdAt: nowSec(),
      };
      rows.push(dto);
      return { ...dto, temporaryPassword: input.password };
    },
  };
}
