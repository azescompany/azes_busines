/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/repository.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-26
 * ║ Purpose: Org + Track persistence (D1 + memory; M5.0-lite fields)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, eq } from 'drizzle-orm';

import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import { defaultTrialEndsAt, isAllowedOrgColor, pickOrgColor } from './orgColors.js';
import type { OrganizationDto, TrackDto } from './types.js';

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || `track-${newId().slice(0, 8)}`;
}

export interface OrgRepository {
  createOrganization(input: {
    name: string;
    slug?: string;
    description?: string | null;
    colorCode?: string;
    subscriptionStatus?: 'active' | 'blocked';
    createdBy: string;
    parentOrganizationId?: string | null;
  }): Promise<OrganizationDto>;
  listOrganizations(): Promise<OrganizationDto[]>;
  getOrganization(id: string): Promise<OrganizationDto | null>;
  updateOrganization(
    id: string,
    patch: {
      name?: string;
      description?: string | null;
      colorCode?: string;
      subscriptionStatus?: 'active' | 'blocked';
      trialEndsAt?: number | null;
      subscriptionReadOnly?: boolean;
      status?: 'active' | 'disabled';
    },
  ): Promise<OrganizationDto>;
  createTrack(input: {
    orgId: string;
    name: string;
    slug?: string;
    description?: string | null;
    createdBy: string;
  }): Promise<TrackDto>;
  listTracks(orgId: string): Promise<TrackDto[]>;
  /** Platform-wide list (superAdmin / org.manage_all). */
  listAllTracks(): Promise<TrackDto[]>;
  getTrack(id: string): Promise<TrackDto | null>;
  setTrackCourses(trackId: string, courseIds: string[]): Promise<void>;
  assignUserTracks(input: {
    userId: string;
    trackIds: string[];
    assignedBy: string;
  }): Promise<void>;
  listActiveTracksForUser(userId: string): Promise<TrackDto[]>;
  /** Course IDs reachable via user's active tracks. */
  listAccessibleCourseIds(userId: string): Promise<string[]>;
}

function mapOrg(row: typeof schema.organizations.$inferSelect): OrganizationDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    colorCode: row.colorCode ?? '#2563EB',
    subscriptionStatus:
      (row.subscriptionStatus as OrganizationDto['subscriptionStatus']) ?? 'active',
    trialEndsAt: row.trialEndsAt ?? null,
    subscriptionReadOnly: Boolean(row.subscriptionReadOnly),
    status: row.status,
    parentOrganizationId: row.parentOrganizationId ?? null,
    createdBy: row.createdBy ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapTrack(row: typeof schema.tracks.$inferSelect): TrackDto {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    status: row.status,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createDrizzleOrgRepository(db: ApiDb): OrgRepository {
  return {
    async createOrganization(input) {
      const ts = nowSec();
      const id = newId();
      const slug = input.slug?.trim() || slugify(input.name);
      const colorCode =
        input.colorCode && isAllowedOrgColor(input.colorCode) ? input.colorCode : pickOrgColor(ts);
      const subscriptionStatus = input.subscriptionStatus ?? 'active';
      await db.insert(schema.organizations).values({
        id,
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        colorCode,
        subscriptionStatus,
        trialEndsAt: defaultTrialEndsAt(ts),
        status: 'active',
        parentOrganizationId: input.parentOrganizationId ?? null,
        createdBy: input.createdBy,
        createdAt: ts,
        updatedAt: ts,
      });
      const [row] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, id))
        .limit(1);
      return mapOrg(row!);
    },

    async getOrganization(id) {
      const [row] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, id))
        .limit(1);
      return row ? mapOrg(row) : null;
    },

    async updateOrganization(id, patch) {
      const existing = await this.getOrganization(id);
      if (!existing) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
      }
      const ts = nowSec();
      if (patch.colorCode !== undefined && !isAllowedOrgColor(patch.colorCode)) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'colorCode is not in the allowed palette');
      }
      await db
        .update(schema.organizations)
        .set({
          ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
          ...(patch.description !== undefined
            ? { description: patch.description?.trim() || null }
            : {}),
          ...(patch.colorCode !== undefined ? { colorCode: patch.colorCode } : {}),
          ...(patch.subscriptionStatus !== undefined
            ? { subscriptionStatus: patch.subscriptionStatus }
            : {}),
          ...(patch.trialEndsAt !== undefined ? { trialEndsAt: patch.trialEndsAt } : {}),
          ...(patch.subscriptionReadOnly !== undefined
            ? { subscriptionReadOnly: patch.subscriptionReadOnly }
            : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          updatedAt: ts,
        })
        .where(eq(schema.organizations.id, id));
      const next = await this.getOrganization(id);
      return next!;
    },

    async listOrganizations() {
      const rows = await db
        .select()
        .from(schema.organizations)
        .orderBy(asc(schema.organizations.name));
      const items = rows.map(mapOrg);
      const memberRows = await db
        .select({
          orgId: schema.users.orgId,
          userId: schema.users.id,
        })
        .from(schema.users);
      const roleRows = await db
        .select({
          userId: schema.userRoles.userId,
          roleName: schema.roles.name,
        })
        .from(schema.userRoles)
        .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id));
      const orgAdminUserIds = new Set(
        roleRows.filter((r) => r.roleName === 'orgAdmin').map((r) => r.userId),
      );
      const memberCount = new Map<string, number>();
      const orgAdminCount = new Map<string, number>();
      for (const row of memberRows) {
        if (!row.orgId) continue;
        memberCount.set(row.orgId, (memberCount.get(row.orgId) ?? 0) + 1);
        if (orgAdminUserIds.has(row.userId)) {
          orgAdminCount.set(row.orgId, (orgAdminCount.get(row.orgId) ?? 0) + 1);
        }
      }
      return items.map((org) => ({
        ...org,
        memberCount: memberCount.get(org.id) ?? 0,
        orgAdminCount: orgAdminCount.get(org.id) ?? 0,
      }));
    },

    async createTrack(input) {
      const ts = nowSec();
      const id = newId();
      let slug = input.slug?.trim() || slugify(input.name);
      const clash = await db
        .select()
        .from(schema.tracks)
        .where(and(eq(schema.tracks.orgId, input.orgId), eq(schema.tracks.slug, slug)))
        .limit(1);
      if (clash[0]) slug = `${slug}-${id.slice(0, 6)}`;
      await db.insert(schema.tracks).values({
        id,
        orgId: input.orgId,
        name: input.name.trim(),
        slug,
        description: input.description ?? null,
        status: 'active',
        createdBy: input.createdBy,
        createdAt: ts,
        updatedAt: ts,
      });
      const [row] = await db.select().from(schema.tracks).where(eq(schema.tracks.id, id)).limit(1);
      return mapTrack(row!);
    },

    async listTracks(orgId) {
      const rows = await db
        .select()
        .from(schema.tracks)
        .where(eq(schema.tracks.orgId, orgId))
        .orderBy(asc(schema.tracks.name));
      return rows.map(mapTrack);
    },

    async listAllTracks() {
      const rows = await db.select().from(schema.tracks).orderBy(asc(schema.tracks.name));
      return rows.map(mapTrack);
    },

    async getTrack(id) {
      const [row] = await db.select().from(schema.tracks).where(eq(schema.tracks.id, id)).limit(1);
      return row ? mapTrack(row) : null;
    },

    async setTrackCourses(trackId, courseIds) {
      const ts = nowSec();
      await db.delete(schema.trackCourses).where(eq(schema.trackCourses.trackId, trackId));
      let pos = 1;
      for (const courseId of courseIds) {
        await db.insert(schema.trackCourses).values({
          trackId,
          courseId,
          position: pos++,
          createdAt: ts,
        });
      }
    },

    async assignUserTracks(input) {
      const ts = nowSec();
      for (const trackId of input.trackIds) {
        const existing = await db
          .select()
          .from(schema.userTracks)
          .where(
            and(eq(schema.userTracks.userId, input.userId), eq(schema.userTracks.trackId, trackId)),
          )
          .limit(1);
        if (existing[0]) {
          await db
            .update(schema.userTracks)
            .set({ status: 'active', assignedBy: input.assignedBy, assignedAt: ts })
            .where(
              and(
                eq(schema.userTracks.userId, input.userId),
                eq(schema.userTracks.trackId, trackId),
              ),
            );
        } else {
          await db.insert(schema.userTracks).values({
            userId: input.userId,
            trackId,
            status: 'active',
            assignedBy: input.assignedBy,
            assignedAt: ts,
          });
        }
      }
    },

    async listActiveTracksForUser(userId) {
      const rows = await db
        .select({ track: schema.tracks })
        .from(schema.userTracks)
        .innerJoin(schema.tracks, eq(schema.userTracks.trackId, schema.tracks.id))
        .where(and(eq(schema.userTracks.userId, userId), eq(schema.userTracks.status, 'active')));
      return rows.map((r) => mapTrack(r.track));
    },

    async listAccessibleCourseIds(userId) {
      const rows = await db
        .select({ courseId: schema.trackCourses.courseId })
        .from(schema.userTracks)
        .innerJoin(schema.trackCourses, eq(schema.userTracks.trackId, schema.trackCourses.trackId))
        .where(and(eq(schema.userTracks.userId, userId), eq(schema.userTracks.status, 'active')));
      return [...new Set(rows.map((r) => r.courseId))];
    },
  };
}

function normalizeMemoryOrg(o: OrganizationDto): OrganizationDto {
  return {
    ...o,
    description: o.description ?? null,
    colorCode: o.colorCode ?? '#2563EB',
    subscriptionStatus: o.subscriptionStatus ?? 'active',
    trialEndsAt: o.trialEndsAt ?? null,
    subscriptionReadOnly: o.subscriptionReadOnly ?? false,
  };
}

export function createMemoryOrgRepository(seed?: {
  organizations?: OrganizationDto[];
  tracks?: TrackDto[];
}): OrgRepository {
  const orgs = [...(seed?.organizations ?? [])].map(normalizeMemoryOrg);
  const tracks = [...(seed?.tracks ?? [])];
  const trackCourseMap = new Map<string, string[]>();
  const userTrackMap = new Map<string, Set<string>>();

  return {
    async createOrganization(input) {
      const ts = nowSec();
      const colorCode =
        input.colorCode && isAllowedOrgColor(input.colorCode) ? input.colorCode : pickOrgColor(ts);
      const dto: OrganizationDto = {
        id: newId(),
        name: input.name.trim(),
        slug: input.slug?.trim() || slugify(input.name),
        description: input.description?.trim() || null,
        colorCode,
        subscriptionStatus: input.subscriptionStatus ?? 'active',
        trialEndsAt: defaultTrialEndsAt(ts),
        subscriptionReadOnly: false,
        status: 'active',
        parentOrganizationId: input.parentOrganizationId ?? null,
        createdBy: input.createdBy,
        createdAt: ts,
        updatedAt: ts,
      };
      orgs.push(dto);
      return dto;
    },
    async listOrganizations() {
      return [...orgs];
    },
    async getOrganization(id) {
      return orgs.find((o) => o.id === id) ?? null;
    },
    async updateOrganization(id, patch) {
      const idx = orgs.findIndex((o) => o.id === id);
      if (idx < 0) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
      }
      if (patch.colorCode !== undefined && !isAllowedOrgColor(patch.colorCode)) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'colorCode is not in the allowed palette');
      }
      const current = orgs[idx]!;
      const next: OrganizationDto = {
        ...current,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description?.trim() || null }
          : {}),
        ...(patch.colorCode !== undefined ? { colorCode: patch.colorCode } : {}),
        ...(patch.subscriptionStatus !== undefined
          ? { subscriptionStatus: patch.subscriptionStatus }
          : {}),
        ...(patch.trialEndsAt !== undefined ? { trialEndsAt: patch.trialEndsAt } : {}),
        ...(patch.subscriptionReadOnly !== undefined
          ? { subscriptionReadOnly: patch.subscriptionReadOnly }
          : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        updatedAt: nowSec(),
      };
      orgs[idx] = next;
      return next;
    },
    async createTrack(input) {
      if (!orgs.some((o) => o.id === input.orgId)) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
      }
      const ts = nowSec();
      const dto: TrackDto = {
        id: newId(),
        orgId: input.orgId,
        name: input.name.trim(),
        slug: input.slug?.trim() || slugify(input.name),
        description: input.description ?? null,
        status: 'active',
        createdBy: input.createdBy,
        createdAt: ts,
        updatedAt: ts,
      };
      tracks.push(dto);
      return dto;
    },
    async listTracks(orgId) {
      return tracks.filter((t) => t.orgId === orgId);
    },
    async listAllTracks() {
      return [...tracks].sort((a, b) => a.name.localeCompare(b.name));
    },
    async getTrack(id) {
      return tracks.find((t) => t.id === id) ?? null;
    },
    async setTrackCourses(trackId, courseIds) {
      trackCourseMap.set(trackId, [...courseIds]);
    },
    async assignUserTracks(input) {
      const set = userTrackMap.get(input.userId) ?? new Set();
      for (const id of input.trackIds) set.add(id);
      userTrackMap.set(input.userId, set);
    },
    async listActiveTracksForUser(userId) {
      const ids = userTrackMap.get(userId) ?? new Set();
      return tracks.filter((t) => ids.has(t.id) && t.status === 'active');
    },
    async listAccessibleCourseIds(userId) {
      const trackIds = userTrackMap.get(userId) ?? new Set();
      const courseIds = new Set<string>();
      for (const tid of trackIds) {
        for (const cid of trackCourseMap.get(tid) ?? []) {
          courseIds.add(cid);
        }
      }
      return [...courseIds];
    },
  };
}
