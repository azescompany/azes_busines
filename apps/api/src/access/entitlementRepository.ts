/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/entitlementRepository.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Org module entitlement + subscription snapshot persistence
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, eq, inArray } from 'drizzle-orm';

import { nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import {
  evaluateSubscription,
  type SubscriptionMode,
  type SubscriptionPolicyInput,
} from './entitlementPolicy.js';

export type OrgSubscriptionSnapshot = SubscriptionPolicyInput & {
  orgId: string;
  orgStatus: 'active' | 'disabled';
};

export interface EntitlementRepository {
  getOrgSubscription(orgId: string): Promise<OrgSubscriptionSnapshot | null>;
  /** Active platform module codes assigned to the org (`organization_modules.status=active`). */
  listActiveModuleCodes(orgId: string): Promise<string[]>;
  isModuleActiveForOrg(orgId: string, moduleCode: string): Promise<boolean>;
  /**
   * Replace active set without deleting rows: listed → active; others → disabled.
   * Never deletes CRM / business data. Validates platform module ids exist + active.
   */
  setOrgModules(orgId: string, moduleIds: string[]): Promise<string[]>;
  listPlatformModules(): Promise<
    Array<{ id: string; code: string; name: string; version: string; status: string }>
  >;
  /** Optional — memory tests / SuperAdmin org patch path. */
  updateOrgSubscription?(
    orgId: string,
    patch: Partial<SubscriptionPolicyInput> & { status?: 'active' | 'disabled' },
  ): Promise<void>;
}

export type EntitlementDecision = {
  allowed: boolean;
  subscriptionMode: SubscriptionMode;
  entitled: boolean;
  reason?: string;
};

export async function resolveModuleEntitlement(
  repo: EntitlementRepository,
  orgId: string,
  moduleCode: string,
  opts?: { write?: boolean },
): Promise<EntitlementDecision> {
  const snap = await repo.getOrgSubscription(orgId);
  if (!snap || snap.orgStatus !== 'active') {
    return {
      allowed: false,
      subscriptionMode: 'blocked',
      entitled: false,
      reason: 'Organization not active',
    };
  }
  const mode = evaluateSubscription(snap, nowSec());
  const entitled = await repo.isModuleActiveForOrg(orgId, moduleCode);
  if (!entitled) {
    return {
      allowed: false,
      subscriptionMode: mode,
      entitled: false,
      reason: 'Module not entitled for organization',
    };
  }
  if (mode === 'blocked') {
    return {
      allowed: false,
      subscriptionMode: mode,
      entitled: true,
      reason: 'Organization subscription blocked',
    };
  }
  if (mode === 'read_only' && opts?.write) {
    return {
      allowed: false,
      subscriptionMode: mode,
      entitled: true,
      reason: 'Organization subscription is read-only',
    };
  }
  return { allowed: true, subscriptionMode: mode, entitled: true };
}

export function createDrizzleEntitlementRepository(db: ApiDb): EntitlementRepository {
  return {
    async getOrgSubscription(orgId) {
      const [row] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, orgId))
        .limit(1);
      if (!row) return null;
      return {
        orgId: row.id,
        orgStatus: row.status as 'active' | 'disabled',
        subscriptionStatus: (row.subscriptionStatus as 'active' | 'blocked') ?? 'active',
        trialEndsAt: row.trialEndsAt ?? null,
        subscriptionReadOnly: Boolean(row.subscriptionReadOnly),
      };
    },

    async listActiveModuleCodes(orgId) {
      const rows = await db
        .select({
          code: schema.platformModules.code,
          status: schema.organizationModules.status,
        })
        .from(schema.organizationModules)
        .innerJoin(
          schema.platformModules,
          eq(schema.organizationModules.moduleId, schema.platformModules.id),
        )
        .where(
          and(
            eq(schema.organizationModules.orgId, orgId),
            eq(schema.organizationModules.status, 'active'),
            eq(schema.platformModules.status, 'active'),
          ),
        );
      return rows.map((r) => r.code);
    },

    async isModuleActiveForOrg(orgId, moduleCode) {
      const codes = await this.listActiveModuleCodes(orgId);
      return codes.includes(moduleCode);
    },

    async listPlatformModules() {
      const rows = await db.select().from(schema.platformModules);
      return rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        version: r.version,
        status: r.status,
      }));
    },

    async setOrgModules(orgId, moduleIds) {
      const uniqueIds = [...new Set(moduleIds)];
      if (uniqueIds.length > 0) {
        const platform = await db
          .select()
          .from(schema.platformModules)
          .where(inArray(schema.platformModules.id, uniqueIds));
        if (platform.length !== uniqueIds.length) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unknown platform module id');
        }
        if (platform.some((p) => p.status !== 'active')) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Cannot assign disabled platform module');
        }
      }

      const existing = await db
        .select()
        .from(schema.organizationModules)
        .where(eq(schema.organizationModules.orgId, orgId));
      const now = nowSec();
      const wanted = new Set(uniqueIds);

      for (const row of existing) {
        const nextStatus = wanted.has(row.moduleId) ? 'active' : 'disabled';
        if (row.status !== nextStatus) {
          await db
            .update(schema.organizationModules)
            .set({ status: nextStatus })
            .where(
              and(
                eq(schema.organizationModules.orgId, orgId),
                eq(schema.organizationModules.moduleId, row.moduleId),
              ),
            );
        }
      }

      const existingIds = new Set(existing.map((r) => r.moduleId));
      for (const moduleId of uniqueIds) {
        if (!existingIds.has(moduleId)) {
          await db.insert(schema.organizationModules).values({
            orgId,
            moduleId,
            status: 'active',
            createdAt: now,
          });
        }
      }

      return uniqueIds;
    },
  };
}

export function createMemoryEntitlementRepository(seed?: {
  orgs?: Array<{
    id: string;
    status?: 'active' | 'disabled';
    subscriptionStatus?: 'active' | 'blocked';
    trialEndsAt?: number | null;
    subscriptionReadOnly?: boolean;
  }>;
  platformModules?: Array<{
    id: string;
    code: string;
    name: string;
    version?: string;
    status?: 'active' | 'disabled';
  }>;
  /** Active org→moduleId assignments (status defaults active). */
  orgModules?: Array<{ orgId: string; moduleId: string; status?: 'active' | 'disabled' }>;
}): EntitlementRepository {
  const orgs = new Map(
    (seed?.orgs ?? []).map((o) => [
      o.id,
      {
        id: o.id,
        status: o.status ?? ('active' as const),
        subscriptionStatus: o.subscriptionStatus ?? ('active' as const),
        trialEndsAt: o.trialEndsAt ?? null,
        subscriptionReadOnly: o.subscriptionReadOnly ?? false,
      },
    ]),
  );
  const platform = new Map(
    (
      seed?.platformModules ?? [
        {
          id: 'pmod-admin-core',
          code: 'admin-core',
          name: 'Admin Core',
          version: '1.0.0',
          status: 'active' as const,
        },
        {
          id: 'pmod-crm',
          code: 'crm',
          name: 'CRM',
          version: '1.0.0',
          status: 'active' as const,
        },
      ]
    ).map((m) => [
      m.id,
      {
        id: m.id,
        code: m.code,
        name: m.name,
        version: m.version ?? '1.0.0',
        status: m.status ?? ('active' as const),
      },
    ]),
  );
  const assignments = new Map<string, { moduleId: string; status: 'active' | 'disabled' }[]>();
  for (const row of seed?.orgModules ?? []) {
    const list = assignments.get(row.orgId) ?? [];
    list.push({ moduleId: row.moduleId, status: row.status ?? 'active' });
    assignments.set(row.orgId, list);
  }

  return {
    async getOrgSubscription(orgId) {
      const org = orgs.get(orgId);
      if (!org) return null;
      return {
        orgId,
        orgStatus: org.status,
        subscriptionStatus: org.subscriptionStatus,
        trialEndsAt: org.trialEndsAt,
        subscriptionReadOnly: org.subscriptionReadOnly,
      };
    },

    async listActiveModuleCodes(orgId) {
      const list = assignments.get(orgId) ?? [];
      const codes: string[] = [];
      for (const a of list) {
        if (a.status !== 'active') continue;
        const mod = platform.get(a.moduleId);
        if (mod && mod.status === 'active') codes.push(mod.code);
      }
      return codes;
    },

    async isModuleActiveForOrg(orgId, moduleCode) {
      const codes = await this.listActiveModuleCodes(orgId);
      return codes.includes(moduleCode);
    },

    async listPlatformModules() {
      return [...platform.values()];
    },

    async setOrgModules(orgId, moduleIds) {
      if (!orgs.has(orgId)) {
        // Allow assignment even if org snapshot missing — tests may only seed modules.
        orgs.set(orgId, {
          id: orgId,
          status: 'active',
          subscriptionStatus: 'active',
          trialEndsAt: null,
          subscriptionReadOnly: false,
        });
      }
      const uniqueIds = [...new Set(moduleIds)];
      for (const id of uniqueIds) {
        const mod = platform.get(id);
        if (!mod) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unknown platform module id');
        if (mod.status !== 'active') {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Cannot assign disabled platform module');
        }
      }
      const existing = assignments.get(orgId) ?? [];
      const wanted = new Set(uniqueIds);
      const next = existing.map((row) => ({
        moduleId: row.moduleId,
        status: (wanted.has(row.moduleId) ? 'active' : 'disabled') as 'active' | 'disabled',
      }));
      for (const id of uniqueIds) {
        if (!next.some((r) => r.moduleId === id)) {
          next.push({ moduleId: id, status: 'active' });
        }
      }
      assignments.set(orgId, next);
      return uniqueIds;
    },

    async updateOrgSubscription(orgId, patch) {
      const existing = orgs.get(orgId) ?? {
        id: orgId,
        status: 'active' as const,
        subscriptionStatus: 'active' as const,
        trialEndsAt: null as number | null,
        subscriptionReadOnly: false,
      };
      orgs.set(orgId, {
        ...existing,
        status: patch.status ?? existing.status,
        subscriptionStatus: patch.subscriptionStatus ?? existing.subscriptionStatus,
        trialEndsAt: patch.trialEndsAt !== undefined ? patch.trialEndsAt : existing.trialEndsAt,
        subscriptionReadOnly:
          patch.subscriptionReadOnly !== undefined
            ? patch.subscriptionReadOnly
            : existing.subscriptionReadOnly,
      });
    },
  };
}
