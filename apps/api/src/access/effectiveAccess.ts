/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/access/effectiveAccess.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Unified Effective Access Resolver (Phase 06 / AC-D06)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { EntitlementRepository } from './entitlementRepository.js';
import {
  evaluateSubscription,
  filterNavByEntitlement,
  filterPermissionsByEntitlement,
  type SubscriptionMode,
} from './entitlementPolicy.js';
import type { DataScope } from '../auth/dataScope.js';
import { normalizeDataScope } from '../auth/dataScope.js';
import { normalizeRoles, permissionsForRoles, type Permission } from '../auth/permissions.js';
import type { AuthNavItem } from '../auth/navCatalog.js';
import { nowSec } from '../auth/tokens.js';
import type { MenuRepository } from '../menu/repository.js';

/**
 * Resolver mode — dual-read migration (MIGRATION_PLAN).
 * - legacy: rollback alias (Phase 08: same deny/allow core as unified — do not widen)
 * - unified: single resolveEffectiveAccess for requirePermission + /me (default)
 *
 * **Deprecation (Phase 08 / 2026-10-27):** `legacy` kept through **2026-12-31** for
 * emergency rollback only. After that window, remove env + mode branch (Coordinator
 * release task). Both modes currently share `resolvePermissionSet` / `resolveNavSet`.
 */
export type AccessResolverMode = 'legacy' | 'unified';

let resolverMode: AccessResolverMode = 'unified';

export function getResolverMode(): AccessResolverMode {
  return resolverMode;
}

export function setResolverMode(mode: AccessResolverMode): void {
  resolverMode = mode;
}

/** Bootstrap from Worker / test env. Unknown values keep current mode (default unified). */
export function initResolverModeFromEnv(env?: { ACCESS_RESOLVER_MODE?: string }): void {
  const mode = env?.ACCESS_RESOLVER_MODE?.trim().toLowerCase();
  if (mode === 'legacy' || mode === 'unified') {
    resolverMode = mode;
  }
}

export type ResolveAccessContext = {
  orgId: string | null;
  userId?: string;
  menuRepo?: MenuRepository | null;
  entitlementRepo?: EntitlementRepository | null;
  /** Platform staff (org.manage_all) skips entitlement strip on permission lists. */
  bypassEntitlementFilter?: boolean;
  /** Optional membership data_scope when already loaded. */
  dataScope?: string | null;
  /** Optional unit ids for scope summary (Phase 03 units). */
  unitIds?: string[];
};

/** Scope summary for /me (AC-D04) — aligns with membership `data_scope`. */
export type ScopeSummary = {
  dataScope: DataScope;
  unitIds?: string[];
  unitNames?: string[];
};

export type ModuleEntitlementSummary = {
  code: string;
  name: string;
  enabled: boolean;
  subscriptionMode: SubscriptionMode;
};

export type EffectiveAccessResult = {
  permissions: Permission[];
  nav: AuthNavItem[];
  modules: ModuleEntitlementSummary[];
  scopeSummary: ScopeSummary | null;
  /** Stable fingerprint of effective access payload (cache invalidation hint). */
  accessVersion: number;
};

function stableAccessVersion(parts: {
  orgId: string | null;
  permissions: readonly string[];
  navIds: readonly string[];
  modules: readonly ModuleEntitlementSummary[];
  scope: ScopeSummary | null;
}): number {
  if (!parts.orgId) return 0;
  const payload = [
    parts.orgId,
    [...parts.permissions].sort().join(','),
    [...parts.navIds].sort().join(','),
    parts.modules
      .map((m) => `${m.code}:${m.enabled ? 1 : 0}:${m.subscriptionMode}`)
      .sort()
      .join(','),
    parts.scope ? `${parts.scope.dataScope}:${(parts.scope.unitIds ?? []).join('|')}` : '',
  ].join('#');
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function loadEntitlementFilter(
  ctx: ResolveAccessContext | undefined,
): Promise<{ codes: Set<string>; mode: SubscriptionMode } | null> {
  if (!ctx?.orgId || !ctx.entitlementRepo || ctx.bypassEntitlementFilter) return null;
  const snap = await ctx.entitlementRepo.getOrgSubscription(ctx.orgId);
  if (!snap) return null;
  const mode = evaluateSubscription(snap, nowSec());
  const codes = new Set(await ctx.entitlementRepo.listActiveModuleCodes(ctx.orgId));
  return { codes, mode };
}

async function mergeUserOverrides(
  perms: Permission[],
  menuRepo: MenuRepository | null | undefined,
  ctx: ResolveAccessContext | undefined,
): Promise<Permission[]> {
  if (!menuRepo || !ctx?.userId || !ctx.orgId) return perms;
  const overrideCodes = await menuRepo.listUserOverridePermissionCodes(ctx.userId, ctx.orgId);
  if (overrideCodes.length === 0) return perms;
  const set = new Set<Permission>(perms);
  for (const code of overrideCodes) set.add(code as Permission);
  return [...set];
}

async function mergeUserOverrideNav(
  items: AuthNavItem[],
  menuRepo: MenuRepository | null | undefined,
  ctx: ResolveAccessContext | undefined,
): Promise<AuthNavItem[]> {
  if (!menuRepo || !ctx?.userId || !ctx.orgId) return items;
  const extraIds = await menuRepo.listUserOverrideMenuIds(ctx.userId, ctx.orgId);
  if (extraIds.length === 0) return items;
  const allMenus = await menuRepo.listMenus('admin');
  const byId = new Map(allMenus.map((m) => [m.id, m]));
  const seen = new Set(items.map((i) => i.id));
  const merged = [...items];
  for (const menuId of extraIds) {
    const m = byId.get(menuId);
    if (!m || m.status !== 'active') continue;
    if (seen.has(m.code)) continue;
    seen.add(m.code);
    merged.push({
      id: m.code,
      path: m.path,
      i18nKey: m.i18nKey,
      iconKey: m.iconKey,
    });
  }
  return merged;
}

/**
 * Core permission resolution (Phase 05 dual-read).
 * Used by both legacy and unified modes — single algorithm, no parallel truth.
 */
export async function resolvePermissionSet(
  roles: readonly string[],
  ctx: ResolveAccessContext,
): Promise<Permission[]> {
  const normalized = normalizeRoles(roles);
  let perms: Permission[];
  if (normalized.includes('superAdmin')) {
    perms = permissionsForRoles(normalized);
  } else {
    const baseline = permissionsForRoles(normalized);
    if (!ctx.menuRepo) {
      perms = baseline;
    } else {
      const gated = new Set(await ctx.menuRepo.listAllMenuGatedPermissionCodes());
      const fromMenus = await ctx.menuRepo.listPermissionCodesForRoles(normalized);
      const keptBaseline = baseline.filter((p) => !gated.has(p));
      const set = new Set<Permission>(keptBaseline);
      for (const code of fromMenus) set.add(code as Permission);
      perms = [...set];
    }
  }

  perms = await mergeUserOverrides(perms, ctx.menuRepo, ctx);

  const filter = await loadEntitlementFilter(ctx);
  if (!filter) return perms;
  return filterPermissionsByEntitlement(perms, filter.codes, filter.mode);
}

export async function resolveNavSet(
  roles: readonly string[],
  ctx: ResolveAccessContext,
): Promise<AuthNavItem[]> {
  const normalized = normalizeRoles(roles);
  let items: AuthNavItem[];
  if (!ctx.menuRepo) {
    items = [{ id: 'home', path: '/', i18nKey: 'nav.home' }];
  } else {
    const rows = await ctx.menuRepo.listNavForRoles(normalized, 'admin');
    items = rows.map((i) => ({
      id: i.id,
      path: i.path,
      i18nKey: i.i18nKey,
      iconKey: i.iconKey,
    }));
  }

  items = await mergeUserOverrideNav(items, ctx.menuRepo, ctx);

  const filter = await loadEntitlementFilter(ctx);
  if (!filter) return items;
  return filterNavByEntitlement(items, filter.codes, filter.mode);
}

async function resolveModuleSummary(
  ctx: ResolveAccessContext,
): Promise<ModuleEntitlementSummary[]> {
  if (!ctx.orgId || !ctx.entitlementRepo) return [];
  const platformModules = await ctx.entitlementRepo.listPlatformModules();
  const activeCodes = new Set(await ctx.entitlementRepo.listActiveModuleCodes(ctx.orgId));
  const snap = await ctx.entitlementRepo.getOrgSubscription(ctx.orgId);
  const mode = snap ? evaluateSubscription(snap, nowSec()) : ('blocked' as SubscriptionMode);

  return platformModules
    .filter((m) => m.status === 'active')
    .map((m) => ({
      code: m.code,
      name: m.name,
      enabled: activeCodes.has(m.code),
      subscriptionMode: mode,
    }));
}

function resolveScopeSummary(ctx: ResolveAccessContext): ScopeSummary | null {
  if (!ctx.orgId) return null;
  return {
    dataScope: normalizeDataScope(ctx.dataScope),
    unitIds: ctx.unitIds ?? [],
  };
}

/**
 * Single source of truth for requirePermission and GET /me (AC-D06).
 * Default deny: missing menuRepo falls back to static role map only (no invented grants).
 */
export async function resolveEffectiveAccess(
  roles: readonly string[],
  ctx: ResolveAccessContext,
): Promise<EffectiveAccessResult> {
  // Mode flag currently selects the same policy core; unified packages /me fields.
  // legacy keeps identical deny/allow so rollback does not widen privileges.
  void getResolverMode();

  const permissions = await resolvePermissionSet(roles, ctx);
  const nav = await resolveNavSet(roles, ctx);
  const modules = await resolveModuleSummary(ctx);
  const scopeSummary = resolveScopeSummary(ctx);
  const accessVersion = stableAccessVersion({
    orgId: ctx.orgId,
    permissions,
    navIds: nav.map((n) => n.id),
    modules,
    scope: scopeSummary,
  });

  return {
    permissions,
    nav,
    modules,
    scopeSummary,
    accessVersion,
  };
}

export async function effectiveCan(
  roles: readonly string[],
  permission: Permission,
  ctx: ResolveAccessContext,
): Promise<boolean> {
  const result = await resolveEffectiveAccess(roles, ctx);
  return result.permissions.includes(permission);
}

/** Menus the actor may grant (role menus ∪ personal overrides). */
export async function resolveGrantableMenuIds(
  roles: readonly string[],
  menuRepo: MenuRepository,
  ctx?: ResolveAccessContext,
): Promise<string[]> {
  const normalized = normalizeRoles(roles);
  if (normalized.includes('superAdmin')) {
    return (await menuRepo.listMenus('admin')).map((m) => m.id);
  }
  const fromRoles = await menuRepo.listMenuIdsForRoles(normalized);
  const fromUser =
    ctx?.userId && ctx.orgId ? await menuRepo.listUserOverrideMenuIds(ctx.userId, ctx.orgId) : [];
  return [...new Set([...fromRoles, ...fromUser])];
}
