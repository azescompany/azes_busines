/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/repository.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Auth persistence — Drizzle D1 (+ transactional rotate) + memory double
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, eq, isNull } from 'drizzle-orm';

import type { ApiDb } from '../db/client.js';
import { refreshSessions, roles, userRoles, users } from '../db/schema.js';
import { normalizeRoles } from './permissions.js';
import type { AuthUser, RefreshSessionRow, UserStatus } from './types.js';

export type CreateRefreshSessionInput = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: number;
  createdAt: number;
  userAgent: string | null;
};

export interface AuthRepository {
  findUserByUsername(usernameNormalized: string): Promise<AuthUser | null>;
  findUserById(id: string): Promise<AuthUser | null>;
  getUserRoles(userId: string): Promise<string[]>;
  /** Active organization pointer (`users.org_id`). */
  setUserOrgId(userId: string, orgId: string | null): Promise<void>;
  /**
   * Replace role set for a user. Role names must already exist in `roles`.
   * Used when switching active org (membership role) while preserving platform roles
   * that the caller includes in `roleNames`.
   */
  setUserRoles(userId: string, roleNames: string[]): Promise<void>;
  createUser(input: {
    id: string;
    usernameNormalized: string;
    passwordHash: string;
    status: UserStatus;
    orgId: string | null;
    createdAt: number;
    updatedAt: number;
  }): Promise<AuthUser>;
  createRefreshSession(input: CreateRefreshSessionInput): Promise<void>;
  /** Active (non-revoked) session by token hash. */
  findActiveRefreshSessionByHash(tokenHash: string): Promise<RefreshSessionRow | null>;
  /** Any session by token hash (including revoked) — reuse detection. */
  findRefreshSessionByHash(tokenHash: string): Promise<RefreshSessionRow | null>;
  findRefreshSessionById(id: string): Promise<RefreshSessionRow | null>;
  revokeSession(id: string, revokedAt: number): Promise<void>;
  /** Revoke every active refresh session for a user (theft / reuse response). */
  revokeAllSessionsForUser(userId: string, revokedAt: number): Promise<void>;
  /**
   * Atomically revoke old session (only if still active) and insert replacement.
   * @returns false when old session was already revoked (parallel refresh / race).
   */
  rotateRefreshSession(params: {
    oldSessionId: string;
    revokedAt: number;
    newSession: CreateRefreshSessionInput;
  }): Promise<boolean>;
}

function mapUser(row: typeof users.$inferSelect): AuthUser {
  return {
    id: row.id,
    usernameNormalized: row.usernameNormalized,
    passwordHash: row.passwordHash,
    status: row.status as UserStatus,
    orgId: row.orgId ?? null,
  };
}

function mapSession(row: typeof refreshSessions.$inferSelect): RefreshSessionRow {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt ?? null,
    replacedById: row.replacedById ?? null,
    createdAt: row.createdAt,
    userAgent: row.userAgent ?? null,
  };
}

export function createDrizzleAuthRepository(db: ApiDb): AuthRepository {
  return {
    async findUserByUsername(usernameNormalized) {
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.usernameNormalized, usernameNormalized))
        .limit(1);
      const row = rows[0];
      return row ? mapUser(row) : null;
    },

    async findUserById(id) {
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      const row = rows[0];
      return row ? mapUser(row) : null;
    },

    async getUserRoles(userId) {
      const rows = await db
        .select({ name: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));
      return normalizeRoles(rows.map((r) => r.name));
    },

    async setUserOrgId(userId, orgId) {
      const ts = Math.floor(Date.now() / 1000);
      await db.update(users).set({ orgId, updatedAt: ts }).where(eq(users.id, userId));
    },

    async setUserRoles(userId, roleNames) {
      const normalized = normalizeRoles(roleNames);
      const ts = Math.floor(Date.now() / 1000);
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
      for (const name of normalized) {
        const [roleRow] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
        if (!roleRow) continue;
        await db.insert(userRoles).values({
          userId,
          roleId: roleRow.id,
          createdAt: ts,
        });
      }
    },

    async createUser(input) {
      await db.insert(users).values({
        id: input.id,
        usernameNormalized: input.usernameNormalized,
        passwordHash: input.passwordHash,
        status: input.status,
        orgId: input.orgId,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      });
      const [row] = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      return mapUser(row!);
    },

    async createRefreshSession(input) {
      await db.insert(refreshSessions).values({
        id: input.id,
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        createdAt: input.createdAt,
        userAgent: input.userAgent,
        revokedAt: null,
        replacedById: null,
      });
    },

    async findActiveRefreshSessionByHash(tokenHash) {
      const rows = await db
        .select()
        .from(refreshSessions)
        .where(and(eq(refreshSessions.tokenHash, tokenHash), isNull(refreshSessions.revokedAt)))
        .limit(1);
      const row = rows[0];
      return row ? mapSession(row) : null;
    },

    async findRefreshSessionByHash(tokenHash) {
      const rows = await db
        .select()
        .from(refreshSessions)
        .where(eq(refreshSessions.tokenHash, tokenHash))
        .limit(1);
      const row = rows[0];
      return row ? mapSession(row) : null;
    },

    async findRefreshSessionById(id) {
      const rows = await db
        .select()
        .from(refreshSessions)
        .where(eq(refreshSessions.id, id))
        .limit(1);
      const row = rows[0];
      return row ? mapSession(row) : null;
    },

    async revokeSession(id, revokedAt) {
      await db
        .update(refreshSessions)
        .set({ revokedAt })
        .where(and(eq(refreshSessions.id, id), isNull(refreshSessions.revokedAt)));
    },

    async revokeAllSessionsForUser(userId, revokedAt) {
      await db
        .update(refreshSessions)
        .set({ revokedAt })
        .where(and(eq(refreshSessions.userId, userId), isNull(refreshSessions.revokedAt)));
    },

    async rotateRefreshSession({ oldSessionId, revokedAt, newSession }) {
      // Drizzle D1 session supports BEGIN/COMMIT/ROLLBACK (see drizzle-orm/d1 session).
      // Keeps revoke + insert atomic: insert failure rolls back the revoke.
      return db.transaction(async (tx) => {
        const updated = await tx
          .update(refreshSessions)
          .set({ revokedAt, replacedById: newSession.id })
          .where(and(eq(refreshSessions.id, oldSessionId), isNull(refreshSessions.revokedAt)))
          .returning({ id: refreshSessions.id });

        if (updated.length === 0) {
          return false;
        }

        await tx.insert(refreshSessions).values({
          id: newSession.id,
          userId: newSession.userId,
          tokenHash: newSession.tokenHash,
          expiresAt: newSession.expiresAt,
          createdAt: newSession.createdAt,
          userAgent: newSession.userAgent,
          revokedAt: null,
          replacedById: null,
        });
        return true;
      });
    },
  };
}

/** In-memory AuthRepository for unit tests (no D1). */
export function createMemoryAuthRepository(seed?: {
  users?: AuthUser[];
  rolesByUser?: Record<string, string[]>;
}): AuthRepository {
  const byUsername = new Map<string, AuthUser>();
  const byId = new Map<string, AuthUser>();
  for (const u of seed?.users ?? []) {
    byUsername.set(u.usernameNormalized, u);
    byId.set(u.id, u);
  }
  const rolesByUser = new Map<string, string[]>(Object.entries(seed?.rolesByUser ?? {}));
  const sessions = new Map<string, RefreshSessionRow>();

  return {
    async findUserByUsername(usernameNormalized) {
      return byUsername.get(usernameNormalized) ?? null;
    },

    async findUserById(id) {
      return byId.get(id) ?? null;
    },

    async getUserRoles(userId) {
      return normalizeRoles(rolesByUser.get(userId) ?? []);
    },

    async setUserOrgId(userId, orgId) {
      const user = byId.get(userId);
      if (!user) return;
      const next = { ...user, orgId };
      byId.set(userId, next);
      byUsername.set(user.usernameNormalized, next);
    },

    async setUserRoles(userId, roleNames) {
      rolesByUser.set(userId, normalizeRoles(roleNames));
    },

    async createUser(input) {
      const user: AuthUser = {
        id: input.id,
        usernameNormalized: input.usernameNormalized,
        passwordHash: input.passwordHash,
        status: input.status,
        orgId: input.orgId,
      };
      byId.set(user.id, user);
      byUsername.set(user.usernameNormalized, user);
      return user;
    },

    async createRefreshSession(input) {
      sessions.set(input.id, {
        id: input.id,
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        revokedAt: null,
        replacedById: null,
        createdAt: input.createdAt,
        userAgent: input.userAgent,
      });
    },

    async findActiveRefreshSessionByHash(tokenHash) {
      for (const row of sessions.values()) {
        if (row.tokenHash === tokenHash && row.revokedAt == null) {
          return row;
        }
      }
      return null;
    },

    async findRefreshSessionByHash(tokenHash) {
      for (const row of sessions.values()) {
        if (row.tokenHash === tokenHash) {
          return row;
        }
      }
      return null;
    },

    async findRefreshSessionById(id) {
      return sessions.get(id) ?? null;
    },

    async revokeSession(id, revokedAt) {
      const row = sessions.get(id);
      if (row && row.revokedAt == null) {
        sessions.set(id, { ...row, revokedAt });
      }
    },

    async revokeAllSessionsForUser(userId, revokedAt) {
      for (const [id, row] of sessions) {
        if (row.userId === userId && row.revokedAt == null) {
          sessions.set(id, { ...row, revokedAt });
        }
      }
    },

    async rotateRefreshSession({ oldSessionId, revokedAt, newSession }) {
      const old = sessions.get(oldSessionId);
      if (!old || old.revokedAt != null) {
        return false;
      }
      sessions.set(oldSessionId, {
        ...old,
        revokedAt,
        replacedById: newSession.id,
      });
      sessions.set(newSession.id, {
        id: newSession.id,
        userId: newSession.userId,
        tokenHash: newSession.tokenHash,
        expiresAt: newSession.expiresAt,
        revokedAt: null,
        replacedById: null,
        createdAt: newSession.createdAt,
        userAgent: newSession.userAgent,
      });
      return true;
    },
  };
}
