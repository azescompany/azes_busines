/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/nav-utils.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Pure navigation filtering, depth limiting and active-state matching
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  MAX_NAV_DEPTH,
  type AzesAccessContext,
  type AzesNavAccess,
  type AzesNavConfig,
  type AzesNavGroup,
  type AzesNavItem,
} from './types';

export function hasNavAccess(
  access: AzesNavAccess | undefined,
  context?: AzesAccessContext,
): boolean {
  if (!access || !context) return true;
  if (access.permissions?.length && !access.permissions.some((p) => context.can(p))) return false;
  if (access.roles?.length && !access.roles.some((r) => context.hasRole(r))) return false;
  if (access.featureFlag && !context.isEnabled(access.featureFlag)) return false;
  return true;
}

function filterItems(items: readonly AzesNavItem[], context?: AzesAccessContext): AzesNavItem[] {
  const result: AzesNavItem[] = [];
  for (const item of items) {
    if (!hasNavAccess(item.access, context)) continue;
    if (item.children?.length) {
      const children = filterItems(item.children, context);
      if (children.length === 0 && !item.path && !item.externalHref) continue;
      result.push(children.length === item.children.length ? item : { ...item, children });
      continue;
    }
    result.push(item);
  }
  return result;
}

/** Drop items and groups the access context does not allow. Pure; no context keeps everything. */
export function filterNav(config: AzesNavConfig, context?: AzesAccessContext): AzesNavConfig {
  const groups: AzesNavGroup[] = [];
  for (const group of config) {
    if (!hasNavAccess(group.access, context)) continue;
    const items = filterItems(group.items, context);
    if (items.length === 0) continue;
    groups.push(items.length === group.items.length ? group : { ...group, items });
  }
  return groups;
}

function cutItems(
  items: readonly AzesNavItem[],
  depth: number,
  onCut: (id: string) => void,
): AzesNavItem[] {
  return items.map((item) => {
    if (!item.children?.length) return item;
    if (depth >= MAX_NAV_DEPTH) {
      onCut(item.id);
      const { children: _dropped, ...rest } = item;
      return rest;
    }
    return { ...item, children: cutItems(item.children, depth + 1, onCut) };
  });
}

/** Cut children below `MAX_NAV_DEPTH`. Calls `onCut` with the ids whose children were dropped. */
export function limitNavDepth(
  config: AzesNavConfig,
  onCut: (id: string) => void = () => undefined,
): AzesNavConfig {
  return config.map((group) => ({ ...group, items: cutItems(group.items, 1, onCut) }));
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

export function isNavItemActive(item: AzesNavItem, pathname: string): boolean {
  if (!item.path) return false;
  const match = item.match ?? (item.path === '/' ? 'exact' : 'prefix');
  if (typeof match === 'function') return match(pathname);
  const current = normalizePath(pathname);
  const target = normalizePath(item.path);
  if (match === 'exact') return current === target;
  return current === target || current.startsWith(`${target}/`);
}

function findTrail(items: readonly AzesNavItem[], pathname: string): string[] | null {
  let best: string[] | null = null;
  for (const item of items) {
    const childTrail = item.children ? findTrail(item.children, pathname) : null;
    const candidate = childTrail
      ? [item.id, ...childTrail]
      : isNavItemActive(item, pathname)
        ? [item.id]
        : null;
    if (candidate && (!best || candidate.length > best.length)) best = candidate;
  }
  return best;
}

/** Ids from the root to the deepest active item, or an empty array. */
export function resolveActiveTrail(config: AzesNavConfig, pathname: string): string[] {
  let best: string[] = [];
  for (const group of config) {
    const trail = findTrail(group.items, pathname);
    if (trail && trail.length > best.length) best = trail;
  }
  return best;
}
