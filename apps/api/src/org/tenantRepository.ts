/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/tenantRepository.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Membership + invitation persistence (D1 + memory)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, eq, ne } from 'drizzle-orm';

import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import type {
  InvitationCreatedDto,
  InvitationDto,
  InviteRole,
  MeOrganizationDto,
  MembershipDto,
  MembershipRole,
  MembershipStatus,
} from './tenantTypes.js';

const INVITE_TTL_SEC = 60 * 60 * 24 * 7;

export interface TenantRepository {
  listMembershipsForUser(userId: string): Promise<MeOrganizationDto[]>;
  getMembership(orgId: string, userId: string): Promise<MembershipDto | null>;
  listMembers(orgId: string): Promise<MembershipDto[]>;
  upsertMembership(input: {
    orgId: string;
    userId: string;
    role: MembershipRole;
    status?: MembershipStatus;
    username?: string;
  }): Promise<MembershipDto>;
  updateMembership(
    orgId: string,
    userId: string,
    patch: { role?: MembershipRole; status?: MembershipStatus },
  ): Promise<MembershipDto>;
  createInvitation(input: {
    orgId: string;
    email: string;
    role: InviteRole;
    createdBy: string;
    tokenHash: string;
  }): Promise<InvitationDto>;
  listInvitations(orgId: string): Promise<InvitationDto[]>;
  findInvitationByTokenHash(tokenHash: string): Promise<InvitationDto | null>;
  markInvitationAccepted(id: string): Promise<InvitationDto>;
  getOrganizationMeta(
    orgId: string,
  ): Promise<{ id: string; name: string; slug: string; status: 'active' | 'disabled' } | null>;
  /**
   * Memory-repo helper: sync listed `isActive` with users.org_id.
   * Drizzle implementation is a no-op (joins users.org_id at read time).
   */
  noteActiveOrganization?(userId: string, orgId: string | null): Promise<void>;
}

function mapInvite(row: typeof schema.organizationInvitations.$inferSelect): InvitationDto {
  return {
    id: row.id,
    orgId: row.orgId,
    email: row.email,
    role: row.role as InviteRole,
    status: row.status as InvitationDto['status'],
    expiresAt: row.expiresAt,
    acceptedAt: row.acceptedAt ?? null,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createDrizzleTenantRepository(db: ApiDb): TenantRepository {
  return {
    async getOrganizationMeta(orgId) {
      const [row] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, orgId))
        .limit(1);
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        status: row.status as 'active' | 'disabled',
      };
    },

    async listMembershipsForUser(userId) {
      try {
        const rows = await db
          .select({
            orgId: schema.organizationMemberships.orgId,
            role: schema.organizationMemberships.role,
            membershipStatus: schema.organizationMemberships.status,
            name: schema.organizations.name,
            slug: schema.organizations.slug,
            status: schema.organizations.status,
            userOrgId: schema.users.orgId,
          })
          .from(schema.organizationMemberships)
          .innerJoin(
            schema.organizations,
            eq(schema.organizationMemberships.orgId, schema.organizations.id),
          )
          .innerJoin(schema.users, eq(schema.organizationMemberships.userId, schema.users.id))
          .where(
            and(
              eq(schema.organizationMemberships.userId, userId),
              ne(schema.organizationMemberships.status, 'revoked'),
            ),
          )
          .orderBy(asc(schema.organizations.name));

        return rows.map((r) => ({
          orgId: r.orgId,
          name: r.name,
          slug: r.slug,
          status: r.status as 'active' | 'disabled',
          role: r.role as MembershipRole,
          membershipStatus: r.membershipStatus as MembershipStatus,
          isActive: r.userOrgId === r.orgId,
        }));
      } catch (err) {
        // Local D1 before `0006_tenant_membership` migrate — degrade to empty list.
        const message = err instanceof Error ? err.message : String(err);
        if (/no such table/i.test(message) && /organization_memberships/i.test(message)) {
          return [];
        }
        throw err;
      }
    },

    async getMembership(orgId, userId) {
      const [row] = await db
        .select({
          id: schema.organizationMemberships.id,
          orgId: schema.organizationMemberships.orgId,
          userId: schema.organizationMemberships.userId,
          role: schema.organizationMemberships.role,
          status: schema.organizationMemberships.status,
          createdAt: schema.organizationMemberships.createdAt,
          updatedAt: schema.organizationMemberships.updatedAt,
          orgName: schema.organizations.name,
          orgSlug: schema.organizations.slug,
          orgStatus: schema.organizations.status,
          username: schema.users.usernameNormalized,
        })
        .from(schema.organizationMemberships)
        .innerJoin(
          schema.organizations,
          eq(schema.organizationMemberships.orgId, schema.organizations.id),
        )
        .innerJoin(schema.users, eq(schema.organizationMemberships.userId, schema.users.id))
        .where(
          and(
            eq(schema.organizationMemberships.orgId, orgId),
            eq(schema.organizationMemberships.userId, userId),
          ),
        )
        .limit(1);
      if (!row) return null;
      return {
        id: row.id,
        orgId: row.orgId,
        orgName: row.orgName,
        orgSlug: row.orgSlug,
        orgStatus: row.orgStatus as 'active' | 'disabled',
        userId: row.userId,
        username: row.username,
        role: row.role as MembershipRole,
        status: row.status as MembershipStatus,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    },

    async listMembers(orgId) {
      const rows = await db
        .select({
          id: schema.organizationMemberships.id,
          orgId: schema.organizationMemberships.orgId,
          userId: schema.organizationMemberships.userId,
          role: schema.organizationMemberships.role,
          status: schema.organizationMemberships.status,
          createdAt: schema.organizationMemberships.createdAt,
          updatedAt: schema.organizationMemberships.updatedAt,
          orgName: schema.organizations.name,
          orgSlug: schema.organizations.slug,
          orgStatus: schema.organizations.status,
          username: schema.users.usernameNormalized,
        })
        .from(schema.organizationMemberships)
        .innerJoin(
          schema.organizations,
          eq(schema.organizationMemberships.orgId, schema.organizations.id),
        )
        .innerJoin(schema.users, eq(schema.organizationMemberships.userId, schema.users.id))
        .where(eq(schema.organizationMemberships.orgId, orgId))
        .orderBy(asc(schema.users.usernameNormalized));

      return rows.map((row) => ({
        id: row.id,
        orgId: row.orgId,
        orgName: row.orgName,
        orgSlug: row.orgSlug,
        orgStatus: row.orgStatus as 'active' | 'disabled',
        userId: row.userId,
        username: row.username,
        role: row.role as MembershipRole,
        status: row.status as MembershipStatus,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    },

    async upsertMembership(input) {
      const existing = await this.getMembership(input.orgId, input.userId);
      const ts = nowSec();
      if (existing) {
        await db
          .update(schema.organizationMemberships)
          .set({
            role: input.role,
            status: input.status ?? 'active',
            updatedAt: ts,
          })
          .where(eq(schema.organizationMemberships.id, existing.id));
        const next = await this.getMembership(input.orgId, input.userId);
        return next!;
      }
      const id = newId();
      await db.insert(schema.organizationMemberships).values({
        id,
        orgId: input.orgId,
        userId: input.userId,
        role: input.role,
        status: input.status ?? 'active',
        createdAt: ts,
        updatedAt: ts,
      });
      const created = await this.getMembership(input.orgId, input.userId);
      if (!created) {
        throw new ApiHttpError(500, 'INTERNAL', 'Failed to create membership');
      }
      return created;
    },

    async updateMembership(orgId, userId, patch) {
      const existing = await this.getMembership(orgId, userId);
      if (!existing || existing.status === 'revoked') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Membership not found');
      }
      const ts = nowSec();
      await db
        .update(schema.organizationMemberships)
        .set({
          role: patch.role ?? existing.role,
          status: patch.status ?? existing.status,
          updatedAt: ts,
        })
        .where(eq(schema.organizationMemberships.id, existing.id));
      const next = await this.getMembership(orgId, userId);
      return next!;
    },

    async createInvitation(input) {
      const ts = nowSec();
      const id = newId();
      const email = input.email.trim().toLowerCase();
      await db.insert(schema.organizationInvitations).values({
        id,
        orgId: input.orgId,
        email,
        role: input.role,
        tokenHash: input.tokenHash,
        status: 'pending',
        expiresAt: ts + INVITE_TTL_SEC,
        acceptedAt: null,
        createdBy: input.createdBy,
        createdAt: ts,
        updatedAt: ts,
      });
      const [row] = await db
        .select()
        .from(schema.organizationInvitations)
        .where(eq(schema.organizationInvitations.id, id))
        .limit(1);
      return mapInvite(row!);
    },

    async listInvitations(orgId) {
      const rows = await db
        .select()
        .from(schema.organizationInvitations)
        .where(eq(schema.organizationInvitations.orgId, orgId))
        .orderBy(asc(schema.organizationInvitations.createdAt));
      return rows.map(mapInvite);
    },

    async findInvitationByTokenHash(tokenHash) {
      const [row] = await db
        .select()
        .from(schema.organizationInvitations)
        .where(eq(schema.organizationInvitations.tokenHash, tokenHash))
        .limit(1);
      return row ? mapInvite(row) : null;
    },

    async markInvitationAccepted(id) {
      const ts = nowSec();
      await db
        .update(schema.organizationInvitations)
        .set({ status: 'accepted', acceptedAt: ts, updatedAt: ts })
        .where(eq(schema.organizationInvitations.id, id));
      const [row] = await db
        .select()
        .from(schema.organizationInvitations)
        .where(eq(schema.organizationInvitations.id, id))
        .limit(1);
      if (!row) throw new ApiHttpError(404, 'NOT_FOUND', 'Invitation not found');
      return mapInvite(row);
    },

    async noteActiveOrganization() {
      /* Drizzle reads users.org_id on list. */
    },
  };
}

export function createMemoryTenantRepository(seed?: {
  orgs?: Array<{ id: string; name: string; slug: string; status: 'active' | 'disabled' }>;
  memberships?: Array<{
    id?: string;
    orgId: string;
    userId: string;
    username: string;
    role: MembershipRole;
    status?: MembershipStatus;
  }>;
  activeOrgByUser?: Record<string, string | null>;
}): TenantRepository {
  const orgs = new Map(
    (seed?.orgs ?? []).map((o) => [o.id, { ...o }]),
  );
  const memberships: MembershipDto[] = (seed?.memberships ?? []).map((m) => {
    const org = orgs.get(m.orgId);
    const ts = nowSec();
    return {
      id: m.id ?? newId(),
      orgId: m.orgId,
      orgName: org?.name ?? 'Org',
      orgSlug: org?.slug ?? 'org',
      orgStatus: org?.status ?? 'active',
      userId: m.userId,
      username: m.username,
      role: m.role,
      status: m.status ?? 'active',
      createdAt: ts,
      updatedAt: ts,
    };
  });
  const invitations: InvitationDto[] = [];
  const inviteHashes = new Map<string, string>();
  const activeOrg = new Map<string, string | null>(
    Object.entries(seed?.activeOrgByUser ?? {}),
  );

  return {
    async getOrganizationMeta(orgId) {
      return orgs.get(orgId) ?? null;
    },

    async listMembershipsForUser(userId) {
      const active = activeOrg.get(userId) ?? null;
      return memberships
        .filter((m) => m.userId === userId && m.status !== 'revoked')
        .map((m) => ({
          orgId: m.orgId,
          name: m.orgName,
          slug: m.orgSlug,
          status: m.orgStatus,
          role: m.role,
          membershipStatus: m.status,
          isActive: active === m.orgId,
        }));
    },

    async getMembership(orgId, userId) {
      return memberships.find((m) => m.orgId === orgId && m.userId === userId) ?? null;
    },

    async listMembers(orgId) {
      return memberships
        .filter((m) => m.orgId === orgId)
        .sort((a, b) => a.username.localeCompare(b.username));
    },

    async upsertMembership(input) {
      const org = orgs.get(input.orgId);
      if (!org) throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
      const idx = memberships.findIndex(
        (m) => m.orgId === input.orgId && m.userId === input.userId,
      );
      const ts = nowSec();
      if (idx >= 0) {
        memberships[idx] = {
          ...memberships[idx]!,
          role: input.role,
          status: input.status ?? 'active',
          updatedAt: ts,
        };
        return memberships[idx]!;
      }
      const row: MembershipDto = {
        id: newId(),
        orgId: input.orgId,
        orgName: org.name,
        orgSlug: org.slug,
        orgStatus: org.status,
        userId: input.userId,
        username: input.username ?? `user-${input.userId.slice(0, 6)}`,
        role: input.role,
        status: input.status ?? 'active',
        createdAt: ts,
        updatedAt: ts,
      };
      memberships.push(row);
      return row;
    },

    async updateMembership(orgId, userId, patch) {
      const idx = memberships.findIndex((m) => m.orgId === orgId && m.userId === userId);
      if (idx < 0 || memberships[idx]!.status === 'revoked') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Membership not found');
      }
      memberships[idx] = {
        ...memberships[idx]!,
        role: patch.role ?? memberships[idx]!.role,
        status: patch.status ?? memberships[idx]!.status,
        updatedAt: nowSec(),
      };
      return memberships[idx]!;
    },

    async createInvitation(input) {
      const ts = nowSec();
      const dto: InvitationDto = {
        id: newId(),
        orgId: input.orgId,
        email: input.email.trim().toLowerCase(),
        role: input.role,
        status: 'pending',
        expiresAt: ts + INVITE_TTL_SEC,
        acceptedAt: null,
        createdBy: input.createdBy,
        createdAt: ts,
        updatedAt: ts,
      };
      invitations.push(dto);
      inviteHashes.set(input.tokenHash, dto.id);
      return dto;
    },

    async listInvitations(orgId) {
      return invitations.filter((i) => i.orgId === orgId);
    },

    async findInvitationByTokenHash(tokenHash) {
      const id = inviteHashes.get(tokenHash);
      if (!id) return null;
      return invitations.find((i) => i.id === id) ?? null;
    },

    async markInvitationAccepted(id) {
      const idx = invitations.findIndex((i) => i.id === id);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'Invitation not found');
      const ts = nowSec();
      invitations[idx] = {
        ...invitations[idx]!,
        status: 'accepted',
        acceptedAt: ts,
        updatedAt: ts,
      };
      return invitations[idx]!;
    },

    async noteActiveOrganization(userId, orgId) {
      activeOrg.set(userId, orgId);
    },
  };
}

export type { InvitationCreatedDto };
