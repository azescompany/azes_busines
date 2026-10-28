/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/platformRoles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Elastic platform role catalog CRUD (M5.0-lite)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { asc, eq } from 'drizzle-orm';

import { assertNotProtectedPlatformRole } from '../access/delegation.js';
import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import type { PlatformRoleDto } from './types.js';

const SYSTEM_ROLES = new Set([
  'superAdmin',
  'generalAdmin',
  'orgAdmin',
  'member',
  'instructor',
  'student',
  'guest',
]);

export interface PlatformRoleRepository {
  list(): Promise<PlatformRoleDto[]>;
  create(name: string): Promise<PlatformRoleDto>;
  rename(id: string, name: string): Promise<PlatformRoleDto>;
  remove(id: string): Promise<void>;
}

function normalizeRoleName(name: string): string {
  return name.trim();
}

export function createDrizzlePlatformRoleRepository(db: ApiDb): PlatformRoleRepository {
  return {
    async list() {
      const rows = await db.select().from(schema.roles).orderBy(asc(schema.roles.name));
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        createdAt: r.createdAt,
        system: SYSTEM_ROLES.has(r.name),
      }));
    },

    async create(rawName) {
      const name = normalizeRoleName(rawName);
      if (!name || name.length < 2) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Role name is too short');
      }
      assertNotProtectedPlatformRole(name);
      const [existing] = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, name))
        .limit(1);
      if (existing) {
        throw new ApiHttpError(409, 'CONFLICT', 'Role already exists');
      }
      const ts = nowSec();
      const id = newId();
      await db.insert(schema.roles).values({ id, name, createdAt: ts });
      return { id, name, createdAt: ts, system: SYSTEM_ROLES.has(name) };
    },

    async rename(id, rawName) {
      const name = normalizeRoleName(rawName);
      if (!name || name.length < 2) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Role name is too short');
      }
      const [row] = await db.select().from(schema.roles).where(eq(schema.roles.id, id)).limit(1);
      if (!row) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Role not found');
      }
      if (row.name === 'superAdmin' || name === 'superAdmin') {
        throw new ApiHttpError(403, 'FORBIDDEN', 'superAdmin role is protected');
      }
      const [dup] = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, name))
        .limit(1);
      if (dup && dup.id !== id) {
        throw new ApiHttpError(409, 'CONFLICT', 'Role already exists');
      }
      await db.update(schema.roles).set({ name }).where(eq(schema.roles.id, id));
      return {
        id: row.id,
        name,
        createdAt: row.createdAt,
        system: SYSTEM_ROLES.has(name),
      };
    },

    async remove(id) {
      const [row] = await db.select().from(schema.roles).where(eq(schema.roles.id, id)).limit(1);
      if (!row) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Role not found');
      }
      if (SYSTEM_ROLES.has(row.name)) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'System roles cannot be deleted');
      }
      await db.delete(schema.roles).where(eq(schema.roles.id, id));
    },
  };
}

export function createMemoryPlatformRoleRepository(seed?: {
  roles?: PlatformRoleDto[];
}): PlatformRoleRepository {
  const rows = [
    ...(seed?.roles ?? [
      { id: 'r-sa', name: 'superAdmin', createdAt: 1, system: true },
      { id: 'r-oa', name: 'orgAdmin', createdAt: 1, system: true },
      { id: 'r-m', name: 'member', createdAt: 1, system: true },
    ]),
  ];
  return {
    async list() {
      return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    },
    async create(rawName) {
      const name = normalizeRoleName(rawName);
      if (!name || name.length < 2) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Role name is too short');
      }
      assertNotProtectedPlatformRole(name);
      if (rows.some((r) => r.name === name)) {
        throw new ApiHttpError(409, 'CONFLICT', 'Role already exists');
      }
      const dto: PlatformRoleDto = {
        id: newId(),
        name,
        createdAt: nowSec(),
        system: SYSTEM_ROLES.has(name),
      };
      rows.push(dto);
      return dto;
    },
    async rename(id, rawName) {
      const name = normalizeRoleName(rawName);
      const idx = rows.findIndex((r) => r.id === id);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'Role not found');
      const current = rows[idx]!;
      if (current.name === 'superAdmin' || name === 'superAdmin') {
        throw new ApiHttpError(403, 'FORBIDDEN', 'superAdmin role is protected');
      }
      if (rows.some((r) => r.name === name && r.id !== id)) {
        throw new ApiHttpError(409, 'CONFLICT', 'Role already exists');
      }
      rows[idx] = { ...current, name, system: SYSTEM_ROLES.has(name) };
      return rows[idx]!;
    },
    async remove(id) {
      const idx = rows.findIndex((r) => r.id === id);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'Role not found');
      if (SYSTEM_ROLES.has(rows[idx]!.name)) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'System roles cannot be deleted');
      }
      rows.splice(idx, 1);
    },
  };
}
