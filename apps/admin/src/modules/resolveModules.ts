/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/resolveModules.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Filter registry by audience + /me entitlements
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MODULE_REGISTRY } from './registry.js';
import type { AzesModuleAccess, AzesModuleDef, ModuleEntitlementLike } from './types.js';

export type ModuleAccessContext = {
  can?: (permission: string) => boolean;
  hasRole?: (role: string) => boolean;
  isEnabled?: (flag: string) => boolean;
};

export type ResolveVisibleModulesOptions = {
  /**
   * `demo` / `forceAll` → full registry (ignore entitlements).
   * `tenant` + platform → full registry when entitlements empty/missing.
   * `tenant` + non-platform → **strict**: empty entitlements → [] (no silent full fallback).
   */
  policy?: 'demo' | 'platform' | 'tenantStrict';
};

function passesAccess(access: AzesModuleAccess | undefined, ctx?: ModuleAccessContext): boolean {
  if (!access || !ctx) return true;
  if (access.permissions?.length) {
    if (!ctx.can || !access.permissions.some((p) => ctx.can!(p))) return false;
  }
  if (access.roles?.length) {
    if (!ctx.hasRole || !access.roles.some((r) => ctx.hasRole!(r))) return false;
  }
  if (access.featureFlag) {
    if (!ctx.isEnabled || !ctx.isEnabled(access.featureFlag)) return false;
  }
  return true;
}

/**
 * Resolve launcher-visible modules.
 *
 * Policy (documented — do not widen silently):
 * - demo / forceAll via policy `'demo'` → MODULE_REGISTRY
 * - `'platform'` (superAdmin | generalAdmin) → full registry (entitlements optional)
 * - `'tenantStrict'` → only enabled non-blocked entitlement codes; empty list → []
 * - legacy call (no policy): empty entitlements → full registry (compat for tests)
 */
export function resolveVisibleModules(
  entitlements: readonly ModuleEntitlementLike[] | undefined,
  accessCtx?: ModuleAccessContext,
  options?: ResolveVisibleModulesOptions,
): AzesModuleDef[] {
  const base = MODULE_REGISTRY.filter((m) => passesAccess(m.access, accessCtx));
  const policy = options?.policy;

  if (policy === 'demo' || policy === 'platform') {
    return [...base];
  }

  if (!entitlements || entitlements.length === 0) {
    // Legacy default (no policy): keep previous demoware fallback.
    // tenantStrict: never expand — empty means no modules.
    if (policy === 'tenantStrict') return [];
    return [...base];
  }

  const allowed = new Set(
    entitlements.filter((e) => e.enabled && e.subscriptionMode !== 'blocked').map((e) => e.code),
  );

  const filtered = base.filter((m) => allowed.has(m.id));

  if (policy === 'tenantStrict') {
    return filtered;
  }

  // Legacy: backend may not yet emit Odoo-style codes — keep usable when no policy.
  return filtered.length > 0 ? filtered : [...base];
}

export function getModuleById(id: string | undefined): AzesModuleDef | undefined {
  if (!id) return undefined;
  return MODULE_REGISTRY.find((m) => m.id === id);
}

export function isModulePath(logicalPath: string): boolean {
  return logicalPath === '/m' || logicalPath.startsWith('/m/');
}

export function parseModuleIdFromPath(logicalPath: string): string | undefined {
  if (!isModulePath(logicalPath)) return undefined;
  const parts = logicalPath.split('/').filter(Boolean);
  // ['m', ':moduleId', ...]
  return parts[1];
}

/** Whether a logical path is allowed for module routes or known base paths. */
export function isPathAllowedByModules(logicalPath: string): boolean {
  if (!isModulePath(logicalPath)) return false;
  const id = parseModuleIdFromPath(logicalPath);
  const mod = getModuleById(id);
  if (!mod) return false;
  if (logicalPath === mod.basePath || logicalPath.startsWith(`${mod.basePath}/`)) {
    return true;
  }
  return false;
}
